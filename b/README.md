AI-Powered Choose Your Own Adventure (AstraPaths)

Quick start

- Prereqs: Node 18+.
- Install: `npm install`
- Run: `PORT=3001 npm start` (use 3001 if 3000 is busy)
- Open: http://localhost:3001/
- Admin: http://localhost:3001/admin (Basic Auth: `admin` / `change-me` by default)

Environment

- Copy `.env.example` to `.env` to override defaults.
- `GOOGLE_API_KEY`: set for live Gemini. When missing or `MOCK_MODE=true`, mock text/images are used.
- `ADMIN_USER` / `ADMIN_PASS`: Basic Auth credentials for admin.

Tech

- Server: Express (ESM), endpoints under `/api/*`.
- Data: LowDB JSON files in `data/` (`parameters.json`, `prompts.json`, `screens.json`). Smallest possible persistent store.
- AI: Google Gemini via `@google/generative-ai` (mock fallback) and placeholder image generation (Picsum seed URLs).

API

- `POST /api/start-story` { genre }
- `POST /api/advance-story` { parentScreenID, choice }
- `GET /api/screen/:id`
- Admin parameters and prompts under `/api/admin/*` (Basic Auth required).

Notes

- Styling aims for minimal, futuristic gradients and smooth transitions.
- Replace image generation with Google Imagen/Vertex when credentials are available (see `server/lib/ai/imagen.js`).

