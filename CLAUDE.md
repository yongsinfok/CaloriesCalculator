# CalorieSnap - AI-Powered Food Calorie Estimation

## Project Overview

CalorieSnap is a mobile-first Progressive Web App (PWA) that enables users to capture photos of food and receive instant AI-powered calorie analysis. The application uses device cameras to capture food images, analyzes them using Google AI Gemini Vision API, and provides detailed calorie estimates with cooking method identification.

## Architecture

### Frontend (PWA)
- **Technology**: Vanilla JavaScript ES2022, HTML5, CSS3
- **Type**: Mobile-first Progressive Web App
- **Key Features**:
  - Camera capture with `getUserMedia()` API
  - Image preview and analysis submission
  - Responsive mobile UI with touch-friendly controls
  - Service worker for offline capabilities
  - Real-time loading progress indicators

### Backend (Serverless)
- **Technology**: Vercel Functions (Node.js)
- **AI Engine**: Google AI Gemini Vision API
- **Security**: API keys secured in backend only (never exposed to frontend)

## Project Structure

```
caloriesApp/
├── frontend/
│   ├── index.html          # Main PWA page
│   ├── manifest.json       # PWA manifest
│   ├── service-worker.js   # Service worker for offline support
│   ├── styles.css          # Mobile-first responsive styles
│   ├── app.js             # Main application controller
│   ├── camera.js          # Camera functionality module
│   └── icons/             # PWA icons
├── api/
│   ├── analyze.js         # AI analysis serverless function
│   └── common/
│       └── security.js    # Input validation and rate limiting
├── specs/
│   └── 001-camera-capture/
│       ├── spec.md        # Feature specification
│       ├── plan.md        # Implementation plan
│       ├── research.md    # Technology research
│       ├── data-model.md  # Data structures
│       └── contracts/     # API specifications
├── package.json           # Dependencies and scripts
└── vercel.json           # Vercel deployment config
```

## Key Features

### Core Functionality
1. **Camera Integration**: Live camera feed with permission handling
2. **Image Capture**: Touch-friendly photo capture to canvas
3. **AI Analysis**: Food identification and calorie estimation using Google AI
4. **Cooking Method Detection**: Identifies fried, baked, grilled, steamed, and raw preparations
5. **Results Display**: Structured display of food items with confidence scores

### Performance Targets
- **Analysis Speed**: <10 seconds for 95% of requests
- **User Experience**: Complete workflow within 15 seconds
- **Confidence Threshold**: 90% minimum for food identification
- **Food Limit**: Up to 5 distinct food items per analysis

### Security Features
- API key isolation (backend only)
- Rate limiting protection
- Input validation and sanitization
- Image size limits (4MB maximum)

## Getting Started

### Environment Setup
```bash
# Install dependencies
npm install

# Local development
npm run dev
```

### Required Environment Variables
- `GOOGLE_API_KEY`: Google AI Gemini API key (backend only)

### Build & Deploy
```bash
# Build (verifies static files)
npm run build

# Deploy to Vercel
vercel --prod
```

## API Endpoints

### POST /api/analyze
Receives base64 image data and returns calorie analysis.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "foods": [
      {
        "name": "grilled chicken",
        "calories": 165,
        "cooking_method": "grilled",
        "confidence": 0.92,
        "nutrition_info": {
          "protein": 31.0,
          "carbs": 0,
          "fat": 3.6
        }
      }
    ],
    "total_calories": 165,
    "processing_time_ms": 8500
  }
}
```

## Development Guidelines

### Code Patterns
- **ES6 Modules**: Use import/export for all JavaScript modules
- **Promise-based**: Async/await for all asynchronous operations
- **Error Handling**: Comprehensive try-catch with user-friendly messages
- **Security First**: Never expose API keys or sensitive data

### Testing Strategy
- Manual camera testing on iOS Safari and Android Chrome
- API response validation with mock data
- Security scans for API key exposure
- Performance monitoring for analysis speed

## Browser Support

- **iOS**: Safari 14+
- **Android**: Chrome 90+
- **Desktop**: Chrome, Firefox, Safari latest versions

## Current Implementation Status

✅ **Completed Features:**
- PWA foundation with service worker
- Camera capture and preview functionality
- Backend AI analysis with Google Gemini
- Results display with confidence scores
- Security separation (API key backend-only)
- Mobile-responsive UI design

🔄 **Ready for Use:**
- Full food analysis workflow
- Cooking method identification
- Error handling and retry mechanisms
- Rate limiting protection

## Future Enhancements

- Nutritional tracking and history
- Meal planning features
- Multi-language support
- Enhanced cooking method detection
- User preference customization

## License

MIT License - see project repository for details.