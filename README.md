# CalorieSnap - Camera Food Analysis PWA

AI-powered food calorie estimation using device camera.

## Development

```bash
# Install dependencies
npm install

# Start local development
npm run dev

# Test camera functionality (requires HTTPS)
```

## Setup

1. Create `.env.local` file with Google AI API key:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```

2. Deploy to Vercel or run locally for testing.

## Features

- 📷 Camera capture with mobile-first design
- 🤖 AI food identification using Google Gemini
- 📊 Calorie estimation with confidence scores
- 🔒 Secure API key handling
- 📱 PWA with offline capabilities
- 🎨 Mobile-optimized UI

## Security

- Google API key secured in backend only
- Input validation and rate limiting
- No API key exposure to frontend

## Mobile Testing

- iOS Safari 14+
- Android Chrome 90+
- Progressive Web App install support

