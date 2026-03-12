# Gemini API Demo (React + TypeScript)

Simple web app to test Gemini LLM usage in your project.

## Stack

- React + TypeScript (Vite)
- Direct Gemini API call from frontend (demo mode)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` from example:
   ```bash
   copy .env.example .env
   ```
3. Add your Gemini API key in `.env`:
   ```env
   VITE_GEMINI_API_KEY=your_real_key
   VITE_GEMINI_MODEL=gemini-1.5-flash
   ```

## Run

```bash
npm run dev
```

Frontend: `http://localhost:5173`

## Notes

- This is intentionally simple for demo purposes.
- For production, move Gemini calls to backend so your key is not exposed.
