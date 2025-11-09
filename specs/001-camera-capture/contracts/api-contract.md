# API Contract: Camera Food Analysis

**Version**: 1.0.0
**Date**: 2025-11-09
**Endpoint**: `/api/analyze`

## Overview

This API provides AI-powered food analysis from captured images. It identifies food items, estimates calories, determines cooking methods, and provides confidence scores.

## Base URL

```
Production: https://calories-app.vercel.app/api/analyze
Development: http://localhost:3000/api/analyze
```

## Authentication

No authentication required for MVP. API key is secured server-side via Vercel Environment Variables.

## Request Specification

### HTTP Method
```
POST /api/analyze
```

### Headers
```http
Content-Type: application/json
Origin: [allowed-origin]  // CORS validation
```

### Request Body
```json
{
  "image": "string"
}
```

#### Fields
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `image` | string | Yes | Base64 image data | Base64-encoded image with data URI scheme |

#### Image Requirements
- **Format**: `data:image/[type];base64,[data]`
- **Supported Types**: `image/jpeg`, `image/png`, `image/webp`
- **Maximum Size**: 4MB (4,194,304 bytes)
- **Minimum Dimensions**: 200x200 pixels
- **Maximum Dimensions**: 3840x2160 pixels

### Example Request
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAA..."
}
```

## Response Specification

### Success Response
**HTTP Status**: 200 OK

```json
{
  "success": true,
  "data": {
    "foods": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "name": "Grilled Chicken Breast",
        "calories": 165,
        "confidence": 0.92,
        "cooking_method": "grilled",
        "portion_estimate": "150g",
        "nutrition_info": {
          "protein": 31.0,
          "carbs": 0.0,
          "fat": 3.6,
          "fiber": 0.0,
          "sodium": 74,
          "cholesterol": 85
        }
      }
    ],
    "total_calories": 165,
    "confidence": 0.92,
    "processing_time_ms": 1234,
    "metadata": {
      "model": "gemini-1.5-flash",
      "timestamp": "2025-11-09T10:30:00.000Z",
      "request_id": "req_123456789",
      "version": "1.0.0"
    }
  },
  "metadata": {
    "timestamp": "2025-11-09T10:30:00.000Z",
    "version": "1.0.0",
    "processing_time_ms": 1234
  }
}
```

### Error Response
**HTTP Status**: 4xx/5xx

```json
{
  "success": false,
  "error": {
    "code": "IMAGE_TOO_LARGE",
    "message": "Image too large. Maximum size: 4MB",
    "retryable": false,
    "details": {
      "received_size": 5242880,
      "max_size": 4194304
    }
  },
  "metadata": {
    "timestamp": "2025-11-09T10:30:00.000Z",
    "version": "1.0.0",
    "processing_time_ms": 45
  }
}
```

## Response Data Models

### FoodItem Object
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (UUID v4) |
| `name` | string | Yes | Identified food name |
| `calories` | integer | Yes | Estimated calories |
| `confidence` | number | Yes | Confidence score (0.0-1.0, min 0.90) |
| `cooking_method` | string | Yes | Cooking method (fried, baked, grilled, steamed, raw) |
| `portion_estimate` | string | No | Estimated portion size |
| `nutrition_info` | object | No | Detailed nutritional information |

### CookingMethod Values
- `fried` - Fried foods
- `baked` - Baked/roasted foods
- `grilled` - Grilled/broiled foods
- `steamed` - Steamed foods
- `raw` - Raw/uncooked foods

### NutritionInfo Object
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `protein` | number | Yes | Protein in grams |
| `carbs` | number | Yes | Carbohydrates in grams |
| `fat` | number | Yes | Fat in grams |
| `fiber` | number | Yes | Fiber in grams |
| `sodium` | integer | No | Sodium in milligrams |
| `cholesterol` | integer | No | Cholesterol in milligrams |

## Error Codes

### Client Errors (4xx)

| Code | HTTP Status | Retryable | Description |
|------|-------------|-----------|-------------|
| `MISSING_IMAGE` | 400 | No | Image field is required |
| `INVALID_IMAGE_FORMAT` | 400 | No | Unsupported image format |
| `IMAGE_TOO_LARGE` | 413 | No | Image exceeds size limit |
| `INVALID_BASE64` | 400 | No | Invalid base64 encoding |

### Server Errors (5xx)

| Code | HTTP Status | Retryable | Description |
|------|-------------|-----------|-------------|
| `AI_SERVICE_ERROR` | 500 | Yes | AI processing failed |
| `ANALYSIS_TIMEOUT` | 504 | Yes | Analysis took too long |
| `NETWORK_ERROR` | 502 | Yes | Network connectivity issue |
| `RATE_LIMIT_EXCEEDED` | 429 | Yes | Too many requests |
| `INTERNAL_ERROR` | 500 | No | Unexpected server error |

## Performance Specifications

### Response Time Targets
- **90th Percentile**: < 8 seconds
- **95th Percentile**: < 10 seconds
- **Maximum**: 30 seconds (server timeout)

### Rate Limiting
- **Free Tier**: 10 requests per minute per IP
- **Burst Limit**: 5 requests per 10 seconds
- **Sliding Window**: 60-minute rolling window

### Throughput
- **Concurrent Requests**: Up to 10 per function instance
- **Scaling**: Automatic based on demand
- **Cold Start**: < 2 seconds to first response

## Security

### CORS Policy
```http
Access-Control-Allow-Origin: https://calories-app.vercel.app
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

### Rate Limiting Implementation
IP-based rate limiting with exponential backoff for repeated violations.

### Input Validation
- Content-Type validation
- Base64 format validation
- Image format validation
- Size constraints
- Malicious payload filtering

## Testing

### Example Test Scenarios

#### Successful Analysis
```bash
curl -X POST https://calories-app.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAA..."
  }'
```
**Expected**: 200 OK with food analysis results

#### Missing Image
```bash
curl -X POST https://calories-app.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{}'
```
**Expected**: 400 Bad Request with `MISSING_IMAGE` error

#### Oversized Image
```bash
# Submit >4MB image
```
**Expected**: 413 Payload Too Large with `IMAGE_TOO_LARGE` error

### Load Testing
- **Concurrent Users**: Test with 50 simultaneous requests
- **Sustained Load**: 100 requests per minute for 5 minutes
- **Stress Test**: 200 requests per second for 30 seconds

## Monitoring

### Key Metrics
- Request rate and response times
- Error rates by error code
- AI model latency and accuracy
- Memory and CPU utilization
- Rate limiting violations

### Logging
Structured JSON logging with:
- Request IDs for traceability
- Error context and stack traces
- Performance metrics
- User agent and IP information

## Versioning

### Current Version: 1.0.0
- Initial release with basic food analysis
- Support for 5 cooking methods
- Maximum 5 food items per image

### Version Planning
- **1.1.x**: Add more cooking methods, improve accuracy
- **1.2.x**: Add recipe recognition, allergen detection
- **2.0.0**: Breaking changes for enhanced nutrition tracking

### Compatibility
- **Major versions**: Breaking changes, migration guide required
- **Minor versions**: New features, backward compatible
- **Patch versions**: Bug fixes, fully compatible

## Integration Guides

### Frontend JavaScript Integration
```javascript
async function analyzeImage(base64Image) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64Image
    })
  });

  const result = await response.json();

  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.error.message);
  }
}
```

### Error Handling Pattern
```javascript
try {
  const analysis = await analyzeImage(imageData);
  displayResults(analysis);
} catch (error) {
  if (error.code === 'IMAGE_TOO_LARGE') {
    showImageSizeError();
  } else if (error.retryable) {
    enableRetryButton();
  } else {
    showGenericError();
  }
}
```