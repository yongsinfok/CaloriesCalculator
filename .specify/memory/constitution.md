<!-- Sync Impact Report -->
<!-- Version change: 0.0.0 → 1.0.0 -->
<!-- Modified principles: None (initial creation) -->
<!-- Added sections: All sections (Core Principles, Architecture & Security, Development Standards, Governance) -->
<!-- Removed sections: None -->
<!-- Templates requiring updates: ✅ all templates reviewed and aligned -->
<!-- Follow-up TODOs: None -->

# CalorieSnap Constitution

## Core Principles

### I. Mobile-First PWA Architecture
Mobile-first design is mandatory. The application must be implemented as a Progressive Web App with camera-first UX. Single-purpose interface focused on food identification and calorie estimation. Clear loading indicators required for all AI interactions.

### II. Security Separation
The Google AI API Key MUST remain secure in the @api-agent-gemini module (Vercel Environment Variable) and MUST NEVER be exposed to the client-side. API communication between frontend and backend must be structured JSON.

### III. Zero-Cost Foundation
V1.0 must be implemented using free-tier services and APIs. Future scaling may require migration to paid AI APIs, but core functionality must work without initial costs.

### IV. AI-Powered Food Recognition
Core functionality centers on AI-based food identification from camera images. Calorie estimates must account for cooking methods and portion sizes. Results must be displayed in clear, user-friendly format.

### V. Modular Communication
The @frontend-camera-pwa and @api-agent-gemini modules communicate via structured JSON API. Frontend sends Base64 image data; backend returns structured calorie report with food items, calorie counts, and confidence scores.

## Architecture & Security

### Technology Stack
- Frontend: Progressive Web App with camera access APIs
- Backend: Vercel Functions (serverless)
- AI API: Google AI Gemini Vision (free tier)
- Communication: JSON API with Base64 image encoding

### Data Flow Requirements
1. Frontend captures image via camera API
2. Image converted to Base64 and sent to backend
3. Backend securely calls Google AI API with environment-stored key
4. AI response parsed into structured calorie report
5. Report returned to frontend for display

### Privacy & Security
- No user images stored permanently unless explicitly opted-in
- API key never exposed to client-side code
- All AI processing happens server-side
- Minimal data collection, clear privacy policy required

## Development Standards

### PWA Requirements
- Must work offline for basic functionality
- Installable on mobile devices
- Camera access must work on both iOS and Android
- Loading states for all AI interactions
- Responsive design for various screen sizes

### API Contract
```json
// Request (Frontend → Backend)
{
  "image": "base64-encoded-image-data"
}

// Response (Backend → Frontend)
{
  "foods": [
    {
      "name": "food-item",
      "calories": number,
      "confidence": number,
      "cooking_method": "method"
    }
  ],
  "total_calories": number,
  "processing_time_ms": number
}
```

### Quality Standards
- Camera capture must work in various lighting conditions
- Calorie estimates within reasonable accuracy range
- Error handling for failed AI requests
- Graceful degradation when AI is unavailable
- Performance: image analysis completes within 10 seconds

## Governance

This constitution supersedes all other development practices and documentation. Amendments require:
1. Documented proposal with specific changes
2. Approval through project maintainers
3. Updated version number following semantic versioning
4. Migration plan for any breaking changes

All development work must verify compliance with:
- Mobile-first PWA principles
- Security separation requirements
- Zero-cost foundation constraints
- Modular communication patterns

**Version**: 1.0.0 | **Ratified**: 2025-11-09 | **Last Amended**: 2025-11-09