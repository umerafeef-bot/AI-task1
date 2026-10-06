import sys
import webbrowser
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn

from translator import translate, SUPPORTED_LANGUAGES

app = FastAPI(title="CodeAlpha Task 1: Language Translation Tool", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


class TranslationRequest(BaseModel):
    text: str
    source_lang: str = "auto"
    target_lang: str = "es"


@app.get("/api/languages")
def get_languages():
    return {"languages": SUPPORTED_LANGUAGES}


@app.post("/api/translate")
def perform_translation(payload: TranslationRequest):
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    try:
        result = translate(payload.text, payload.source_lang, payload.target_lang)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/")
def serve_index():
    index_path = STATIC_DIR / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="Frontend file not found.")
    return FileResponse(index_path)


@app.get("/{filename}")
def serve_static_root(filename: str):
    file_path = STATIC_DIR / filename
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")



def start_server(host: str = "127.0.0.1", port: int = 8001):
    print(f"Starting Task 1 Language Translation Server at http://{host}:{port}")
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    start_server()
