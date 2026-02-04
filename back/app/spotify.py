import base64
import os
import time
from typing import Any, Dict

import httpx

SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_BASE = "https://api.spotify.com/v1"


def _basic_auth_header(client_id: str, client_secret: str) -> str:
    raw = f"{client_id}:{client_secret}".encode("utf-8")
    return base64.b64encode(raw).decode("utf-8")


class SpotifyClient:
    def __init__(self) -> None:
        self._client_id = os.environ.get("SPOTIFY_CLIENT_ID", "").strip()
        self._client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET", "").strip()
        if not self._client_id or not self._client_secret:
            raise RuntimeError("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET")

        self._access_token = ""
        self._token_expires_at = 0.0

    async def _get_access_token(self) -> str:
        now = time.time()
        if self._access_token and now < self._token_expires_at - 30:
            return self._access_token

        auth_header = _basic_auth_header(self._client_id, self._client_secret)
        headers = {"Authorization": f"Basic {auth_header}"}
        data = {"grant_type": "client_credentials"}

        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(SPOTIFY_TOKEN_URL, headers=headers, data=data)
            resp.raise_for_status()
            payload = resp.json()

        self._access_token = payload["access_token"]
        self._token_expires_at = now + int(payload.get("expires_in", 3600))
        return self._access_token

    async def get_artist(self, artist_id: str) -> Dict[str, Any]:
        token = await self._get_access_token()
        headers = {"Authorization": f"Bearer {token}"}
        url = f"{SPOTIFY_API_BASE}/artists/{artist_id}"

        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            return resp.json()

    async def search_artist(self, query: str, limit: int = 10) -> Dict[str, Any]:
        token = await self._get_access_token()
        headers = {"Authorization": f"Bearer {token}"}
        params = {"q": query, "type": "artist", "limit": limit}
        url = f"{SPOTIFY_API_BASE}/search"

        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url, headers=headers, params=params)
            resp.raise_for_status()
            return resp.json()
