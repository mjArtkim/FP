from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .spotify import SpotifyClient

load_dotenv()

app = FastAPI(title="FP Spotify Back")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict:
    return {"ok": True}


@app.get("/spotify/artist/{artist_id}")
async def get_artist(artist_id: str) -> dict:
    try:
        client = SpotifyClient()
        return await client.get_artist(artist_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/spotify/search")
async def search_artist(q: str, limit: int = 10) -> dict:
    try:
        client = SpotifyClient()
        return await client.search_artist(q, limit=limit)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
