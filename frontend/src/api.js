// Base URL of the FastAPI backend. Set VITE_API_URL at build time (e.g. on
// Vercel) to point at the deployed backend; with no env file, local dev
// talks straight to uvicorn's default port.
export const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
