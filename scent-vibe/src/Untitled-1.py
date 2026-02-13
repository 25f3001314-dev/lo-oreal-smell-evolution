
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 1. Configure CORS so your React app (on a different port) can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (good for dev)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Mock Data: Maps scent names to audio, text (vibe), and visual params
scent_data = {
    "lavender": {
        "audio_track": "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
        "vibe": "Drifting through purple fields. Deep calm envelops you.",
        "params": {"color": "#b19cd9", "density": 2000, "speed": 0.05}
    },
    "citrus": {
        "audio_track": "https://cdn.pixabay.com/download/audio/2022/10/25/audio_4f0b6c6803.mp3",
        "vibe": "Sharp, bright sunlight. Instant energy and focus.",
        "params": {"color": "#ffaa00", "density": 3000, "speed": 0.2}
    },
    "ocean": {
        "audio_track": "https://cdn.pixabay.com/download/audio/2022/03/09/audio_c8c91a332a.mp3",
        "vibe": "Cool mist and crashing waves. Refreshing clarity.",
        "params": {"color": "#0077be", "density": 2200, "speed": 0.1}
    }
}

# 3. The Endpoint
@app.get("/api/scent/{scent_type}")
async def get_scent(scent_type: str):
    # normalize input to lowercase
    result = scent_data.get(scent_type.lower())
    
    if not result:
        raise HTTPException(status_code=404, detail="Scent not found")
    
    return result
