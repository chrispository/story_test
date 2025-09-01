# AI Story Adventure

A futuristic, AI-powered choose-your-own-adventure web application using Google Gemini for story generation and Google Imagen for image generation.

## Features

- Three genre options: Military Sci-Fi, Space Opera, Space Tech Thriller
- AI-generated branching narratives
- AI-generated images for each story scene
- Sleek, minimal interface with light/dark mode
- Comprehensive admin panel for managing settings and prompts

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`:
```
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
GOOGLE_IMAGEN_API_KEY=your_imagen_api_key
NEXTAUTH_SECRET=your_secret
```

3. Initialize the database:
```bash
curl http://localhost:3000/api/init
```

4. Run the development server:
```bash
npm run dev
```

5. Access the application at `http://localhost:3000`

## Admin Panel

Access the admin panel at `/admin` with default credentials:
- Username: `admin`
- Password: `admin123`

The admin panel allows you to:
- Adjust AI parameters (temperature, token limits)
- Manage all system prompts
- Configure animation speeds and UI elements

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Framer Motion for animations
- SQLite for database
- Google Gemini AI for story generation
- Google Imagen for image generation