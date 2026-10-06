"""
Task 1: AI Language Translation Engine
Supports Google Translate (GTX) with MyMemory fallback and automatic language detection.
"""

import json
import urllib.parse
import urllib.request
from typing import Dict, Optional, Tuple


SUPPORTED_LANGUAGES = {
    "auto": "Auto Detect",
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "ru": "Russian",
    "zh-CN": "Chinese (Simplified)",
    "ja": "Japanese",
    "ko": "Korean",
    "ar": "Arabic",
    "hi": "Hindi",
    "ur": "Urdu",
    "tr": "Turkish",
    "nl": "Dutch",
    "pl": "Polish",
    "sv": "Swedish",
    "id": "Indonesian",
    "vi": "Vietnamese",
}


def translate_google_gtx(text: str, source_lang: str = "auto", target_lang: str = "en") -> Tuple[str, str]:
    """
    Translates text using Google Translate GTX endpoint.
    Returns (translated_text, detected_source_lang).
    """
    encoded_text = urllib.parse.quote(text)
    url = (
        f"https://translate.googleapis.com/translate_a/single?"
        f"client=gtx&sl={source_lang}&tl={target_lang}&dt=t&q={encoded_text}"
    )
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    )
    with urllib.request.urlopen(req, timeout=10) as response:
        raw = response.read().decode("utf-8")
        data = json.loads(raw)
        
    translated = "".join(part[0] for part in data[0] if part and part[0])
    detected_lang = data[2] if len(data) > 2 and data[2] else source_lang
    return translated, detected_lang


def translate_mymemory(text: str, source_lang: str = "en", target_lang: str = "es") -> str:
    """
    Fallback translation via MyMemory API.
    """
    from deep_translator import MyMemoryTranslator
    src = "en" if source_lang == "auto" else source_lang
    translator = MyMemoryTranslator(source=src, target=target_lang)
    return translator.translate(text)


def translate(text: str, source_lang: str = "auto", target_lang: str = "es") -> Dict[str, str]:
    """
    Main translation entry point with automatic fallback.
    """
    if not text or not text.strip():
        return {
            "translated_text": "",
            "detected_lang": source_lang,
            "provider": "none"
        }
    
    clean_text = text.strip()
    try:
        translated, detected = translate_google_gtx(clean_text, source_lang, target_lang)
        return {
            "translated_text": translated,
            "detected_lang": detected,
            "provider": "Google Translate API"
        }
    except Exception as exc:
        try:
            fallback = translate_mymemory(clean_text, source_lang, target_lang)
            return {
                "translated_text": fallback,
                "detected_lang": source_lang if source_lang != "auto" else "en",
                "provider": "MyMemory API (Fallback)"
            }
        except Exception as inner_exc:
            raise RuntimeError(f"Translation failed on all providers: {exc} | {inner_exc}")


if __name__ == "__main__":
    sample_text = "Welcome to CodeAlpha AI Internship! Artificial Intelligence is transforming the world."
    res = translate(sample_text, "auto", "es")
    print("Source Text:", sample_text)
    print("Translated (Spanish):", res["translated_text"])
    print("Detected Language:", res["detected_lang"])
    print("Provider:", res["provider"])
