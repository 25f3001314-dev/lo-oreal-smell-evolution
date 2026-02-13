from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

app = FastAPI(title="Scent Vibe API")

# Premium L'Oréal-inspired scent database
SCENT_DB = {
    "lavender": {
        "name": "Lavender World",
        "color": "#A7C7E7",  # Soft purple-blue
        "density": 1500,
        "notes": ["Lavender", "Freesia", "Rose", "Melon", "Patchouli", "Musk"],
        "audio": "https://cdn.pixabay.com/audio/2022/03/15/audio_6d4e3a4e0a.mp3",  # Calming lavender ambient (CDN)
        "speed": 0.12
    },
    "ocean": {
        "name": "Ocean Breeze",
        "color": "#4a90e2",
        "density": 1800,
        "notes": ["Sea Salt", "Marine", "Moss"],
        "audio": "",
        "speed": 0.2
    },
    "default": {
        "name": "Rose Vanilla",
        "color": "#888",
        "density": 2000,
        "notes": ["Rose", "Vanilla"],
        "audio": "",
        "speed": 0.1
    }
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"status": "online", "message": "Vibe Scent API ready - use /api/scent/lavender"}


@app.get("/api/scent/{scent_id}")
async def get_scent(scent_id: str):
    try:
        return SCENT_DB.get(scent_id, SCENT_DB["default"])
    except Exception:
        raise HTTPException(500, "Scent error")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
