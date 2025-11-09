# Quickstart Guide: Camera Food Capture & Analysis

**Purpose**: Get the camera capture and food analysis feature running quickly
**Created**: 2025-11-09
**Prerequisites**: Node.js 18+, Vercel account, Google AI API access

## Project Setup

### 1. Repository Structure
```
caloriesApp/
├── frontend/
│   ├── index.html           # Main PWA page
│   ├── styles.css           # Mobile-first styles
│   ├── app.js              # Main application logic
│   ├── camera.js           # Camera management
│   ├── manifest.json       # PWA manifest
│   └── service-worker.js   # Offline capabilities
├── api/
│   └── analyze.js          # Vercel serverless function
├── package.json            # Dependencies
├── vercel.json            # Vercel configuration
└── .env.local             # Local environment variables
```

### 2. Prerequisites Configuration

#### Google AI API Key
1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Create new API key for Gemini API
3. Add to Vercel Environment Variables:
   - Name: `GOOGLE_API_KEY`
   - Value: Your API key
   - Environments: Production, Preview, Development

#### Local Development Setup
```bash
# Create .env.local file
echo "GOOGLE_API_KEY=your_api_key_here" > .env.local

# Install dependencies
npm init -y
npm install @google/generative-ai
```

## Frontend Implementation

### 1. Create PWA Manifest (`frontend/manifest.json`)
```json
{
  "name": "CalorieSnap PWA",
  "short_name": "CalorieSnap",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4A90E2",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "permissions": ["camera"]
}
```

### 2. Create HTML Structure (`frontend/index.html`)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>CalorieSnap - Camera Food Analysis</title>

    <!-- PWA Meta Tags -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="CalorieSnap">
    <meta name="theme-color" content="#4A90E2">

    <!-- Resources -->
    <link rel="manifest" href="/manifest.json">
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <div id="app">
        <!-- Camera Screen -->
        <div id="camera-screen" class="screen active">
            <video id="video" playsinline autoplay muted></video>
            <canvas id="canvas" style="display: none;"></canvas>

            <div class="controls">
                <button id="capture-btn" class="btn-primary" disabled>
                    📷 Capture
                </button>
            </div>

            <div id="camera-error" class="error-message" style="display: none;">
                <p id="error-text"></p>
                <button id="retryCamera" class="btn-secondary">Try Again</button>
            </div>
        </div>

        <!-- Preview Screen -->
        <div id="preview-screen" class="screen">
            <img id="preview-image" src="" alt="Captured food">

            <div class="preview-controls">
                <button id="retake-btn" class="btn-secondary">🔄 Retake</button>
                <button id="analyze-btn" class="btn-primary">🔍 Analyze</button>
            </div>
        </div>

        <!-- Loading Screen -->
        <div id="loading-screen" class="screen">
            <div class="loading-content">
                <div class="spinner"></div>
                <h2>Analyzing your food...</h2>
                <p id="loading-details">Preparing image</p>
                <div id="progress-bar">
                    <div id="progress-fill"></div>
                </div>
            </div>
        </div>

        <!-- Results Screen -->
        <div id="results-screen" class="screen">
            <div class="results-header">
                <button id="new-analysis" class="btn-secondary">📷 New Analysis</button>
            </div>

            <div class="results-content">
                <div class="total-summary">
                    <h2 id="total-calories">-- calories</h2>
                    <p>Total estimated</p>
                </div>

                <div id="food-items" class="food-list">
                    <!-- Food items will be added here dynamically -->
                </div>
            </div>
        </div>
    </div>

    <script src="/app.js"></script>
</body>
</html>
```

### 3. Create Camera Module (`frontend/camera.js`)
```javascript
class CameraManager {
    constructor() {
        this.stream = null;
        this.video = document.getElementById('video');
    }

    async requestCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;

            // iOS specific attributes
            this.video.setAttribute('playsinline', '');
            this.video.setAttribute('muted', '');

            return await this.video.play();
        } catch (error) {
            this.handleCameraError(error);
            throw error;
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.video) {
            this.video.srcObject = null;
        }
    }

    captureFrame() {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d', { alpha: false });

        canvas.width = this.video.videoWidth;
        canvas.height = this.video.videoHeight;
        ctx.drawImage(this.video, 0, 0);

        return canvas.toDataURL('image/jpeg', 0.92);
    }

    handleCameraError(error) {
        const errorScreen = document.getElementById('camera-error');
        const errorText = document.getElementById('error-text');

        const errorMessages = {
            'NotAllowedError': 'Camera permission denied. Please enable camera access in settings.',
            'NotFoundError': 'No camera found on this device.',
            'NotReadableError': 'Camera is being used by another app.',
            'OverconstrainedError': 'Camera does not support the required settings.',
            'TypeError': 'Camera API not supported on this browser.'
        };

        errorText.textContent = errorMessages[error.name] || 'Camera error occurred.';
        errorScreen.style.display = 'block';
    }
}

export default CameraManager;
```

### 4. Create Main App Logic (`frontend/app.js`)
```javascript
import CameraManager from './camera.js';

class CalorieSnap {
    constructor() {
        this.camera = new CameraManager();
        this.initElements();
        this.bindEvents();
        this.init();
    }

    initElements() {
        // Screens
        this.screens = {
            camera: document.getElementById('camera-screen'),
            preview: document.getElementById('preview-screen'),
            loading: document.getElementById('loading-screen'),
            results: document.getElementById('results-screen')
        };

        // Elements
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.captureBtn = document.getElementById('capture-btn');
        this.retakeBtn = document.getElementById('retake-btn');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.previewImage = document.getElementById('preview-image');
        this.retryCamera = document.getElementById('retryCamera');
        this.newAnalysisBtn = document.getElementById('new-analysis');
    }

    bindEvents() {
        this.captureBtn.addEventListener('click', () => this.capturePhoto());
        this.retakeBtn.addEventListener('click', () => this.retakePhoto());
        this.analyzeBtn.addEventListener('click', () => this.analyzePhoto());
        this.retryCamera.addEventListener('click', () => this.init());
        this.newAnalysisBtn.addEventListener('click', () => this.newAnalysis());
    }

    async init() {
        try {
            await this.camera.requestCamera();
            this.captureBtn.disabled = false;
            this.showScreen('camera');
        } catch (error) {
            console.error('Camera initialization failed:', error);
        }
    }

    capturePhoto() {
        const imageData = this.camera.captureFrame();
        this.previewImage.src = imageData;
        this.previewImage.dataset.image = imageData;
        this.showScreen('preview');
    }

    retakePhoto() {
        this.showScreen('camera');
    }

    async analyzePhoto() {
        const imageData = this.previewImage.dataset.image;
        this.showScreen('loading');
        this.updateProgress('Preparing image...', 20);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imageData
                })
            });

            const result = await response.json();

            if (result.success) {
                this.updateProgress('Complete!', 100);
                setTimeout(() => {
                    this.showResults(result.data);
                }, 500);
            } else {
                throw new Error(result.error?.message || 'Analysis failed');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            this.showError('Analysis failed. Please try again.');
        }
    }

    showResults(data) {
        document.getElementById('total-calories').textContent = `${data.total_calories} calories`;

        const foodList = document.getElementById('food-items');
        foodList.innerHTML = '';

        data.foods.forEach(food => {
            const foodItem = document.createElement('div');
            foodItem.className = 'food-item';
            foodItem.innerHTML = `
                <div class="food-info">
                    <h3>${food.name}</h3>
                    <p class="method">${this.formatCookingMethod(food.cooking_method)}</p>
                </div>
                <div class="food-details">
                    <div class="calories">${food.calories} cal</div>
                    <div class="confidence">${Math.round(food.confidence * 100)}% confidence</div>
                </div>
            `;
            foodList.appendChild(foodItem);
        });

        this.showScreen('results');
    }

    formatCookingMethod(method) {
        const methods = {
            'fried': '🍳 Fried',
            'baked': '🍞 Baked',
            'grilled': '🔥 Grilled',
            'steamed': '💨 Steamed',
            'raw': '🥗 Raw'
        };
        return methods[method] || method;
    }

    newAnalysis() {
        this.camera.stopCamera();
        this.init();
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        this.screens[screenName].classList.add('active');
    }

    updateProgress(message, percentage) {
        document.getElementById('loading-details').textContent = message;
        document.getElementById('progress-fill').style.width = `${percentage}%`;
    }

    showError(message) {
        this.updateProgress(message, 0);
        setTimeout(() => {
            this.retakePhoto();
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CalorieSnap();
});
```

## Backend Implementation

### 1. Create Serverless Function (`api/analyze.js`)
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

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
        // Validate input
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_IMAGE',
                    message: 'Image field is required',
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
```

### 2. Create Vercel Configuration (`vercel.json`)
```json
{
  "functions": {
    "api/analyze.js": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "headers": [
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/frontend/$1"
    }
  ]
}
```

## Testing

### 1. Local Development
```bash
# Install dependencies
npm install

# Start local development
npm run dev

# Test camera functionality
# Open http://localhost:3000 in mobile browser
```

### 2. Production Deployment
```bash
# Deploy to Vercel
vercel

# Test production endpoint
curl -X POST https://your-app.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/jpeg;base64,..."}'
```

### 3. Mobile Testing Checklist
- [ ] Camera permission request works on iOS Safari
- [ ] Camera permission request works on Android Chrome
- [ ] Photo capture and preview works
- [ ] Analysis completes within 10 seconds
- [ ] Results display correctly on mobile screen
- [ ] PWA installs correctly on mobile
- [ ] Offline functionality works for basic app

## Troubleshooting

### Common Issues

**Camera not working**
- Check HTTPS requirement (camera API requires secure context)
- Verify browser compatibility
- Check permission settings

**Analysis failures**
- Verify GOOGLE_API_KEY is set in Vercel Environment Variables
- Check image size (< 4MB)
- Verify network connectivity

**PWA not installing**
- Check manifest.json path and content
- Verify HTTPS requirement
- Check service worker registration

### Debug URLs
- Camera test: `/test-camera.html`
- API test: `/api/analyze` (POST with test image)
- Manifest validation: Use online PWA manifest validator

## Next Steps
1. Implement comprehensive error handling
2. Add unit tests for camera and API functions
3. Implement analytics and monitoring
4. Add more sophisticated UI animations
5. Implement user preferences and settings