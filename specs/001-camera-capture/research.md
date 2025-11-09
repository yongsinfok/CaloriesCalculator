# Research: Camera Food Capture & Analysis

**Date**: 2025-11-09
**Feature**: Camera Food Capture & Analysis
**Research Focus**: Technology decisions and implementation patterns

## Frontend Technology Research

### Camera API Integration
**Decision**: Use `navigator.mediaDevices.getUserMedia()` with comprehensive error handling
**Rationale**:
- Industry standard for camera access in modern browsers
- Well-documented API with good cross-platform support
- Works on both iOS Safari and Android Chrome with proper polyfills

**Implementation Pattern**:
```javascript
class CameraManager {
  async requestCamera() {
    const constraints = {
      video: {
        facingMode: 'environment', // Back camera for food photography
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    };
    return await navigator.mediaDevices.getUserMedia(constraints);
  }
}
```

**Cross-Platform Considerations**:
- iOS Safari requires user gesture for camera activation
- Android Chrome supports broader constraints
- Both platforms support `playsinline` attribute for video elements

### Canvas Capture Techniques
**Decision**: Use `Canvas.toDataURL('image/jpeg', 0.92)` for image capture
**Rationale**:
- JPEG format provides optimal size/quality balance for food photos
- 0.92 quality parameter retains detail while managing file size
- Direct base64 output matches backend API requirements

**Performance Optimization**:
- Reuse canvas objects to reduce memory allocation
- Scale images to 1920x1080 maximum to balance quality and upload speed
- Use `alpha: false` context for better JPEG performance

### PWA Requirements
**Decision**: Standard PWA with service worker and manifest.json
**Rationale**:
- Mobile-first architecture aligns with constitution requirements
- Service worker enables offline capability for basic functions
- Installable on mobile devices for improved user experience

**Key Features**:
- Cache static assets for offline functionality
- Network-first strategy for API calls
- Install prompt for mobile users
- Responsive design for various screen sizes

## Backend Technology Research

### Vercel Functions Architecture
**Decision**: Serverless functions at `/api/analyze.js`
**Rationale**:
- Zero-cost hosting aligns with constitution principle
- Automatic scaling supports variable load
- Integrated environment variable management for API key security

**Configuration**:
```javascript
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb' // Base64 image support
    }
  },
  maxDuration: 30 // Seconds for AI processing
};
```

### Google AI SDK Integration
**Decision**: Use `@google/generative-ai` with gemini-1.5-flash model
**Rationale**:
- Official SDK with maintained reliability
- gemini-1.5-flash offers good balance of speed and accuracy for food recognition
- Free tier capabilities support MVP requirements

**Implementation Pattern**:
```javascript
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    maxOutputTokens: 2048,
    temperature: 0.4 // Lower for factual food analysis
  }
});
```

### Security Architecture
**Decision**: Environment variables for API key, JSON API for communication
**Rationale**:
- API key never exposed to client-side code
- Vercel environment variables provide secure access
- JSON API provides structured, verifiable communication pattern

**Implementation**:
- `GOOGLE_API_KEY` stored in Vercel Environment Variables
- No API key references in frontend code
- CORS configured for production domains only

## Integration Patterns

### Data Flow Architecture
**Decision**: Base64 image upload → structured JSON response
**Rationale**:
- Simple implementation without file upload complexity
- Direct integration with camera-to-canvas workflow
- JSON response easily parsed and displayed in frontend

**Request Format**:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response Format**:
```json
{
  "success": true,
  "data": {
    "foods": [
      {
        "name": "Grilled Chicken Breast",
        "calories": 165,
        "cooking_method": "grilled",
        "confidence": 0.92
      }
    ],
    "total_calories": 165,
    "processing_time_ms": 1234
  }
}
```

### Error Handling Strategy
**Decision**: Comprehensive error handling with retry capabilities
**Rationale**:
- Network failures are common on mobile connections
- AI service may experience temporary unavailability
- User-friendly error messages improve experience

**Error Categories**:
- Camera permission/access errors
- Network connectivity issues
- AI service failures
- Invalid image data

## Performance Considerations

### Frontend Optimization
- Lazy load camera API only when needed
- Compress images before upload (1024px maximum dimension)
- Implement progressive loading indicators
- Cache static assets with service worker

### Backend Optimization
- Initialize AI client outside handler for connection reuse
- Implement rate limiting to prevent abuse
- Set appropriate timeouts (30 seconds for AI processing)
- Monitor memory usage for large image processing

### Quality Standards
- Target 90% food identification success rate
- Analysis completion within 10 seconds (95th percentile)
- Support for 5 essential cooking methods
- 90% minimum confidence threshold for inclusion

## Technology Stack Summary

**Frontend**:
- HTML5 with Canvas API for camera capture
- Progressive Web App with service worker
- Vanilla JavaScript with modern ES6+ features
- Mobile-first responsive design

**Backend**:
- Vercel serverless functions (Node.js runtime)
- Google AI Gemini Vision API
- Environment variable security
- JSON API communication pattern

**Integration**:
- Base64 image encoding for transmission
- Structured JSON response format
- Cross-platform browser compatibility
- Offline capability for basic functions

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| WebRTC for camera access | Over-complex for simple capture needs |
| File upload endpoints | Requires additional storage infrastructure |
| WebSocket for real-time updates | Adds unnecessary complexity for one-shot analysis |
| Multi-cloud AI approach | Increases complexity and costs beyond MVP scope |

## Implementation Validation

This research validates the technology choices outlined in the constitution:
- ✅ Mobile-first PWA architecture
- ✅ Security separation with backend API key
- ✅ Zero-cost foundation with free-tier services
- ✅ AI-powered food recognition
- ✅ Modular JSON communication pattern

The selected technologies provide a solid foundation for implementing the feature while maintaining alignment with project principles and constraints.