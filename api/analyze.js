import { GoogleGenerativeAI } from '@google/generative-ai';
import { validateInput, checkRateLimit } from './common/security.js';

// Initialize AI client outside handler for connection reuse
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
    maxDuration: 30, // seconds
};

export default async function handler(req, res) {
    const startTime = Date.now();

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    try {
        // Rate limiting
        const clientId = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (!checkRateLimit(clientId)) {
            return res.status(429).json({
                success: false,
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: 'Too many requests. Please try again later.',
                    retryable: true
                }
            });
        }

        // Validate input
        const { image, sessionId } = req.body;
        if (!validateInput(image, 'image')) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_IMAGE',
                    message: 'Image field is required and must be valid base64',
                    retryable: false
                }
            });
        }

        if (sessionId && !validateInput(sessionId, 'session')) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_SESSION',
                    message: 'Invalid session ID format',
                    retryable: false
                }
            });
        }

        // Validate API key
        if (!process.env.GOOGLE_API_KEY) {
            throw new Error('GOOGLE_API_KEY not configured');
        }

        // Parse and validate image
        const { mimeType, data } = parseBase64Image(image);

        // Check image size
        const sizeInBytes = (data.length * 3) / 4;
        if (sizeInBytes > 4 * 1024 * 1024) { // 4MB limit
            return res.status(413).json({
                success: false,
                error: {
                    code: 'IMAGE_TOO_LARGE',
                    message: 'Image too large. Maximum size: 4MB',
                    retryable: false
                }
            });
        }

        // Initialize model
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.4,
            }
        });

        // Create analysis prompt
        const prompt = `Analyze this food image and provide a detailed calorie breakdown.

Return JSON in this format:
{
  "foods": [
    {
      "name": "food item name",
      "calories": number,
      "cooking_method": "fried|baked|grilled|steamed|raw",
      "confidence": number (0.0-1.0),
      "portion_estimate": "estimated size",
      "nutrition_info": {
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number
      }
    }
  ],
  "confidence": number
}

Requirements:
- Maximum 5 food items
- Minimum 90% confidence for each item
- Include cooking method when identifiable
- Be precise with nutritional values`;

        // Generate content with timeout
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Analysis timeout')), 25000)
        );

        const generatePromise = model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType,
                    data,
                },
            },
        ]);

        const result = await Promise.race([generatePromise, timeoutPromise]);
        const response = await result.response;
        const text = response.text();

        // Parse and format response
        const analysisResult = parseAIResponse(text);
        const processingTime = Date.now() - startTime;

        return res.status(200).json({
            success: true,
            data: {
                ...analysisResult,
                processing_time_ms: processingTime,
                metadata: {
                    model: 'gemini-1.5-flash',
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                }
            },
            metadata: {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                processing_time_ms: processingTime
            }
        });

    } catch (error) {
        console.error('Analysis error:', error);

        let errorResponse = {
            success: false,
            error: {
                code: 'UNKNOWN_ERROR',
                message: 'Analysis failed',
                retryable: false
            },
            metadata: {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                processing_time_ms: Date.now() - startTime
            }
        };

        // Handle specific errors
        if (error.message === 'Analysis timeout') {
            errorResponse.error = {
                code: 'ANALYSIS_TIMEOUT',
                message: 'Analysis took too long. Please try with a smaller image.',
                retryable: true
            };
            return res.status(504).json(errorResponse);
        }

        if (error.message?.includes('API key')) {
            errorResponse.error = {
                code: 'SERVICE_CONFIG_ERROR',
                message: 'Service configuration error',
                retryable: false
            };
            return res.status(500).json(errorResponse);
        }

        return res.status(500).json(errorResponse);
    }
}

// Utility functions
function parseBase64Image(base64String) {
    const matches = base64String.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
        throw new Error('Invalid base64 image format');
    }

    return {
        mimeType: `image/${matches[1]}`,
        data: matches[2]
    };
}

function parseAIResponse(text) {
    try {
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);

            // Calculate total calories
            const totalCalories = parsed.foods?.reduce((sum, food) => sum + (food.calories || 0), 0) || 0;

            // Filter by confidence threshold
            const filteredFoods = parsed.foods?.filter(food => food.confidence >= 0.9) || [];

            return {
                foods: filteredFoods.slice(0, 5), // Max 5 items
                total_calories: totalCalories,
                confidence: parsed.confidence || (filteredFoods.length > 0 ? 0.9 : 0)
            };
        }
    } catch (error) {
        console.error('Failed to parse AI response:', error);
    }

    // Fallback response
    return {
        foods: [],
        total_calories: 0,
        confidence: 0
    };
}