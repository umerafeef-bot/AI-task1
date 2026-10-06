const sourceText = document.getElementById("sourceText");
const sourceLangSelect = document.getElementById("sourceLangSelect");
const targetLangSelect = document.getElementById("targetLangSelect");
const translateBtn = document.getElementById("translateBtn");
const swapLangBtn = document.getElementById("swapLangBtn");
const charCount = document.getElementById("charCount");
const placeholderText = document.getElementById("placeholderText");
const translatedResultText = document.getElementById("translatedResultText");
const detectedLangTag = document.getElementById("detectedLangTag");
const providerInfo = document.getElementById("providerInfo");
const copyBtn = document.getElementById("copyBtn");
const copyBtnText = document.getElementById("copyBtnText");
const clearBtn = document.getElementById("clearBtn");
const speakOutputBtn = document.getElementById("speakOutputBtn");
const listenInputBtn = document.getElementById("listenInputBtn");
const toast = document.getElementById("toast");

let currentTranslatedText = "";

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Character counter
sourceText.addEventListener("input", () => {
  const count = sourceText.value.length;
  charCount.textContent = `${count} / 5000`;
});

// Swap languages
swapLangBtn.addEventListener("click", () => {
  if (sourceLangSelect.value === "auto") {
    showToast("Cannot swap when source is set to Auto Detect.");
    return;
  }
  const temp = sourceLangSelect.value;
  sourceLangSelect.value = targetLangSelect.value;
  targetLangSelect.value = temp;

  // Swap texts if there is a translation
  if (currentTranslatedText) {
    sourceText.value = currentTranslatedText;
    currentTranslatedText = "";
    translatedResultText.style.display = "none";
    placeholderText.style.display = "block";
    placeholderText.textContent = "Click Translate to translate swapped text...";
    charCount.textContent = `${sourceText.value.length} / 5000`;
  }
});

// Clear button
clearBtn.addEventListener("click", () => {
  sourceText.value = "";
  charCount.textContent = "0 / 5000";
  currentTranslatedText = "";
  translatedResultText.style.display = "none";
  placeholderText.style.display = "block";
  placeholderText.textContent = "Your translation will appear here...";
  detectedLangTag.textContent = "Detected: Auto";
  providerInfo.textContent = "Engine Ready";
});

// Translate function
async function handleTranslation() {
  const text = sourceText.value.trim();
  if (!text) {
    showToast("Please enter some text to translate!");
    return;
  }

  translateBtn.disabled = true;
  translateBtn.querySelector("span").textContent = "Translating...";
  providerInfo.textContent = "Translating...";

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        source_lang: sourceLangSelect.value,
        target_lang: targetLangSelect.value
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Translation request failed.");
    }

    const data = await res.json();
    currentTranslatedText = data.translated_text;

    placeholderText.style.display = "none";
    translatedResultText.style.display = "block";
    translatedResultText.textContent = currentTranslatedText;

    detectedLangTag.textContent = `Detected: ${data.detected_lang.toUpperCase()}`;
    providerInfo.textContent = data.provider || "Completed";
  } catch (error) {
    console.error("Translation error:", error);
    showToast(`Error: ${error.message}`);
    providerInfo.textContent = "Error occurred";
  } finally {
    translateBtn.disabled = false;
    translateBtn.querySelector("span").textContent = "Translate Now";
  }
}

translateBtn.addEventListener("click", handleTranslation);

// Allow Ctrl+Enter or Cmd+Enter to translate
sourceText.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    handleTranslation();
  }
});

// Copy to clipboard
copyBtn.addEventListener("click", async () => {
  if (!currentTranslatedText) {
    showToast("Nothing to copy yet!");
    return;
  }
  try {
    await navigator.clipboard.writeText(currentTranslatedText);
    copyBtnText.textContent = "Copied!";
    showToast("Translation copied to clipboard!");
    setTimeout(() => {
      copyBtnText.textContent = "Copy";
    }, 2000);
  } catch (err) {
    showToast("Could not copy to clipboard.");
  }
});

// Speech Synthesis (Text to speech for output)
speakOutputBtn.addEventListener("click", () => {
  if (!currentTranslatedText) {
    showToast("No translated text to read!");
    return;
  }
  if (!("speechSynthesis" in window)) {
    showToast("Speech synthesis not supported in this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(currentTranslatedText);
  utterance.lang = targetLangSelect.value;
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
});

// Speech Synthesis for input
listenInputBtn.addEventListener("click", () => {
  const text = sourceText.value.trim();
  if (!text) {
    showToast("No input text to read!");
    return;
  }
  if (!("speechSynthesis" in window)) {
    showToast("Speech synthesis not supported in this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = sourceLangSelect.value === "auto" ? "en" : sourceLangSelect.value;
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
});

// Example presets
document.querySelectorAll(".preset-pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    sourceText.value = pill.getAttribute("data-text");
    charCount.textContent = `${sourceText.value.length} / 5000`;
    handleTranslation();
  });
});
