# Task 1: Language Translation Tool (CodeAlpha AI Internship)

A web and command-line Artificial Intelligence Language Translation tool built with Python, FastAPI, and Google Neural Translation APIs.

## Features
- **Multi-language Support:** Translate between 20+ languages including English, Spanish, French, German, Japanese, Chinese, Arabic, Hindi, Urdu, and more.
- **Auto-Detection:** Automatically detects the source language.
- **High Availability:** Uses Google Translate single endpoint with fallback to MyMemory API.
- **Text-to-Speech (TTS):** Integrated Web Speech API for both input and output listening.
- **One-click Copy & Presets:** Quick copy to clipboard with toast notifications and pre-loaded sample prompts.
- **Modern Responsive UI:** Glassmorphism dark-mode interface with ambient lighting and micro-animations.

## Installation & Setup

1. Install requirements:
```bash
pip install fastapi uvicorn deep-translator requests
```

2. Run the application:
```bash
python app.py
```

3. Open your browser and navigate to:
```
http://127.0.0.1:8001
```

## CLI Usage
You can also run translation directly via Python terminal:
```bash
python translator.py
```
