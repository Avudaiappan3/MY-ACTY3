// src/voice/VoiceEngine.js
// ═══════════════════════════════════════════════════════
//  COMPLETE VOICE AUTOMATION ENGINE
//  - Always listening (no tapping)
//  - AI natural speech understanding
//  - Tamil first → English TTS reply
//  - Waveform animation data
//  - Wake word detection
//  - Undo last save
//  - Summary spoken aloud
// ═══════════════════════════════════════════════════════

import Voice from "@react-native-voice/voice";
import Tts from "react-native-tts";
import axios from "axios";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import { updateCell, getTodayRow, getTodayData, DAILY_COLUMNS, colIndex } from "../api/sheetsApi";
import { useAppStore } from "../store/appStore";

// ── TAMIL REPLIES ─────────────────────────────────────
const TAMIL_REPLIES = {
  "wake up":       "எழுந்திரிக்கும் நேரம் பதிவு செய்யப்பட்டது!",
  "sleep time":    "தூக்க நேரம் சேர்க்கப்பட்டது!",
  "sleep hours":   "தூக்க மணி நேரம் பதிவு ஆனது!",
  "meditation":    "தியானம் பதிவு செய்யப்பட்டது! மிகவும் நல்லது!",
  "push-ups":      "புஷ் அப்ஸ் பதிவு செய்யப்பட்டது! வாழ்க!",
  "pushups":       "புஷ் அப்ஸ் பதிவு செய்யப்பட்டது! வாழ்க!",
  "study time":    "படிப்பு நேரம் சேர்க்கப்பட்டது! சிறப்பு!",
  "reading time":  "வாசிப்பு நேரம் பதிவு ஆனது!",
  "java hours":    "ஜாவா பயிற்சி நேரம் பதிவு ஆனது!",
  "topics":        "தலைப்புகள் சேர்க்கப்பட்டன!",
  "problems":      "பிரச்சினைகள் தீர்க்கப்பட்டன! சாதனை!",
  "words learned": "புதிய வார்த்தைகள் கற்றீர்கள்! அருமை!",
  "productive":    "உற்பத்தி நேரம் பதிவு ஆனது!",
  "revision":      "திருத்தம் செய்யப்பட்டது!",
  "screen time":   "திரை நேரம் பதிவு ஆனது!",
  "youtube":       "யூட்யூப் நேரம் பதிவு ஆனது!",
  "social media":  "சமூக ஊடக நேரம் பதிவு ஆனது!",
  "gaming":        "விளையாட்டு நேரம் பதிவு ஆனது!",
  "mood":          "உங்கள் மனநிலை பதிவு செய்யப்பட்டது!",
  "water":         "தண்ணீர் குடிப்பு பதிவு செய்யப்பட்டது! ஆரோக்கியம்!",
  "breakfast":     "காலை சாப்பாடு பதிவு ஆனது!",
  "dinner":        "இரவு சாப்பாடு பதிவு ஆனது!",
  "pomodoro":      "பொமோடோரோ session பதிவு ஆனது!",
  "daily goal":    "இன்றைய இலக்கு பதிவு செய்யப்பட்டது!",
  "tomorrow goal": "நாளைய இலக்கு பதிவு செய்யப்பட்டது!",
  "daily notes":   "குறிப்புகள் சேர்க்கப்பட்டன!",
  "activities":    "செயல்பாடுகள் பதிவு ஆனது!",
  "morning_routine":"காலை வழக்கம் முடிந்தது! சிறப்பாக இருக்கிறது!",
  "night_routine":  "இரவு வழக்கம் முடிந்தது! நல்ல தூக்கம் வாருங்கள்!",
  "summary":        "இன்றைய சுருக்கம் இதோ!",
  "undo":           "கடைசி update தவிர்க்கப்பட்டது!",
  "not_understood": "மன்னிக்கவும், புரியவில்லை. மீண்டும் சொல்லுங்கள்!",
  "saved":          "தகவல் சேர்க்கப்பட்டது!",
  "wake_word":      "வணக்கம்! கேட்கிறேன்!",
};

// ── ENGLISH REPLIES ───────────────────────────────────
const EN_REPLIES = {
  "wake up":       (v) => `Wake up time ${v} saved! Great start to the day!`,
  "sleep time":    (v) => `Sleep time ${v} recorded!`,
  "sleep hours":   (v) => `${v} hours of sleep logged!`,
  "meditation":    (v) => `${v} minutes of meditation recorded! Excellent focus!`,
  "push-ups":      (v) => `${v} push-ups logged! You are on fire!`,
  "pushups":       (v) => `${v} push-ups logged! Keep it up!`,
  "study time":    (v) => `${v} hours of study saved! Knowledge is power!`,
  "reading time":  (v) => `${v} hours of reading logged!`,
  "java hours":    (v) => `${v} hours of Java practice saved!`,
  "topics":        (v) => `Topics covered: ${v}. Great learning!`,
  "problems":      (v) => `${v} problems solved! Amazing work!`,
  "words learned": (v) => `${v} new words learned! Vocabulary growing!`,
  "productive":    (v) => `${v} productive hours logged!`,
  "revision":      (v) => `Revision marked as ${v}!`,
  "screen time":   (v) => `Screen time ${v} hours recorded!`,
  "youtube":       (v) => `YouTube time ${v} saved!`,
  "social media":  (v) => `Social media ${v} logged!`,
  "gaming":        (v) => `Gaming time ${v} saved!`,
  "mood":          (v) => `Mood set to ${v}! Your feelings matter!`,
  "water":         (v) => `${v} glasses of water logged! Stay hydrated!`,
  "breakfast":     (v) => `Breakfast: ${v} recorded!`,
  "dinner":        (v) => `Dinner: ${v} saved!`,
  "pomodoro":      (v) => `${v} pomodoro sessions logged!`,
  "daily goal":    (v) => `Today's goal set: ${v}!`,
  "tomorrow goal": (v) => `Tomorrow's goal set: ${v}!`,
  "daily notes":   (v) => `Notes saved: ${v}`,
  "activities":    (v) => `Activities logged: ${v}`,
  "morning_routine":() => `Morning routine complete! Excellent discipline!`,
  "night_routine":  () => `Night routine done! Sleep well and recover!`,
  "undo":           () => `Last update has been undone!`,
  "not_understood": () => `Sorry, I did not understand. Please try again!`,
  "wake_word":      () => `Hello! I am listening. Speak your update!`,
  default:         (v) => `Saved: ${v}`,
};

// ── WAKE WORDS ────────────────────────────────────────
const WAKE_WORDS = [
  "hey activities",
  "hi activities",
  "ok activities",
  "activate",
  "ஹே activities",
];

// ── SKIP / STOP / UNDO COMMANDS ───────────────────────
const STOP_COMMANDS  = ["stop listening", "stop", "நிறுத்து", "pause"];
const UNDO_COMMANDS  = ["undo", "cancel", "தவிர்", "back"];
const SUMMARY_CMDS   = ["summary", "how was my day", "சுருக்கம்", "report"];

// ═══════════════════════════════════════════════════
//  MAIN VOICE ENGINE CLASS
// ═══════════════════════════════════════════════════
class VoiceEngine {
  constructor() {
    this.isListening  = false;
    this.isProcessing = false;
    this.todayRow     = null;
    this.lastSaved    = null; // for undo
    this.apiKey       = "";
    this.onStateChange   = null; // callback for UI updates
    this.onWaveformData  = null; // callback for waveform
    this.onTranscript    = null; // callback for live transcript
    this.onResult        = null; // callback for save result
    this.onSpeaking      = null; // callback when TTS speaking
    this._setupVoice();
    this._setupTTS();
  }

  // ── SETUP ───────────────────────────────────────
  _setupTTS() {
    Tts.setDefaultRate(0.48);
    Tts.setDefaultPitch(1.0);
    Tts.addEventListener("tts-start",  () => this.onSpeaking?.(true));
    Tts.addEventListener("tts-finish", () => {
      this.onSpeaking?.(false);
      // Auto restart listening after TTS finishes
      if (this.isListening) {
        setTimeout(() => this._startListeningCycle(), 300);
      }
    });
  }

  _setupVoice() {
    Voice.onSpeechStart   = () => this._onSpeechStart();
    Voice.onSpeechEnd     = () => this._onSpeechEnd();
    Voice.onSpeechResults = (e) => this._onResults(e.value?.[0] || "");
    Voice.onSpeechPartialResults = (e) => {
      this.onTranscript?.(e.value?.[0] || "");
    };
    Voice.onSpeechError   = () => this._onError();
  }

  // ── START / STOP ─────────────────────────────────
  async start(todayRow, apiKey) {
    this.todayRow  = todayRow;
    this.apiKey    = apiKey;
    this.isListening = true;
    this.onStateChange?.("listening");
    await this._speak("wake_word", null);
    this._startListeningCycle();
  }

  async stop() {
    this.isListening = false;
    try { await Voice.stop(); } catch (e) {}
    this.onStateChange?.("stopped");
  }

  async _startListeningCycle() {
    if (!this.isListening || this.isProcessing) return;
    try {
      await Voice.stop();
      await new Promise(r => setTimeout(r, 200));
      await Voice.start("en-IN");
      this.onStateChange?.("listening");
    } catch (e) {
      // Try Tamil if English fails
      try { await Voice.start("ta-IN"); } catch (e2) {}
    }
  }

  // ── SPEECH EVENTS ────────────────────────────────
  _onSpeechStart() {
    this.onStateChange?.("listening");
  }

  _onSpeechEnd() {
    // Will get results soon
  }

  async _onResults(text) {
    if (!text || this.isProcessing) return;
    this.isProcessing = true;
    this.onTranscript?.(text);
    this.onStateChange?.("processing");
    await this._processText(text);
    this.isProcessing = false;
  }

  _onError() {
    if (this.isListening && !this.isProcessing) {
      setTimeout(() => this._startListeningCycle(), 500);
    }
  }

  // ── PROCESS TEXT ─────────────────────────────────
  async _processText(text) {
    const t = text.toLowerCase().trim();

    // 1. Check wake word
    if (WAKE_WORDS.some(w => t.includes(w))) {
      await this._speak("wake_word", null);
      return;
    }

    // 2. Check stop
    if (STOP_COMMANDS.some(c => t.includes(c))) {
      await this.stop();
      return;
    }

    // 3. Check undo
    if (UNDO_COMMANDS.some(c => t.includes(c))) {
      await this._handleUndo();
      return;
    }

    // 4. Check summary
    if (SUMMARY_CMDS.some(c => t.includes(c))) {
      await this._speakSummary();
      return;
    }

    // 5. Check morning/night routine
    if (t.includes("morning done") || t.includes("morning routine") ||
        t.includes("காலை முடிந்தது")) {
      await this._saveRoutine("morning");
      return;
    }
    if (t.includes("night done") || t.includes("night routine") ||
        t.includes("இரவு முடிந்தது")) {
      await this._saveRoutine("night");
      return;
    }

    // 6. AI parse
    const { field, value } = await this._aiParse(text);

    if (field && value !== null && value !== undefined) {
      await this._saveField(field, value);
    } else {
      await this._speak("not_understood", null);
      this.onResult?.({ success: false, msg: `❓ Not understood: "${text}"` });
    }
  }

  // ── AI PARSE ─────────────────────────────────────
  async _aiParse(text) {
    // Try AI first
    if (this.apiKey && this.apiKey !== "YOUR_ANTHROPIC_API_KEY") {
      try {
        const fields = Object.keys(DAILY_COLUMNS).join(", ");
        const prompt = `Parse this voice command for a daily tracker: "${text}"
Available fields: ${fields}
Normalize naturally:
- "half past five" → 5:30
- "thirty push-ups" → push-ups: 30  
- "studied for two hours" → study time: 2
- "feeling happy" → mood: happy
- "drank eight glasses" → water: 8
- "woke up at five thirty" → wake up: 5:30
- Tamil numbers: "முப்பது" = 30, "இரண்டு" = 2
Reply ONLY as JSON (no markdown):
{"field": "field name here", "value": "value here"}
or {"field": null, "value": null} if unclear`;

        const res = await axios.post(
          "https://api.anthropic.com/v1/messages",
          {
            model: "claude-sonnet-4-6",
            max_tokens: 80,
            messages: [{ role: "user", content: prompt }],
          },
          {
            headers: {
              "Content-Type":     "application/json",
              "x-api-key":        this.apiKey,
              "anthropic-version":"2023-06-01",
            },
          }
        );
        const raw  = res.data.content[0].text.replace(/```json|```/g, "").trim();
        const data = JSON.parse(raw);
        return { field: data.field, value: data.value };
      } catch (e) {
        console.log("AI parse error:", e);
      }
    }
    // Fallback simple parse
    return this._simpleParse(text);
  }

  _simpleParse(text) {
    const t = text.toLowerCase().trim();
    // Normalize common phrases
    const normalized = t
      .replace("half past ", "")
      .replace("quarter to ",  "")
      .replace("o'clock",      ":00")
      .replace(" hours",       "")
      .replace(" hour",        "")
      .replace(" minutes",     "")
      .replace(" mins",        "")
      .replace(" glasses",     "")
      .replace(" pushups",     "")
      .replace(" push ups",    "");

    for (const field of Object.keys(DAILY_COLUMNS)) {
      if (normalized.includes(field)) {
        let value = normalized.replace(field, "").trim();
        value = value.replace(/\b(of|for|did|today|i|my)\b/g, "").trim();
        if (value) return { field, value };
      }
    }
    // Mood shorthand
    const moods = ["happy","sad","good","great","tired","stressed","okay","bad"];
    for (const m of moods) {
      if (t.includes(m)) return { field: "mood", value: m };
    }
    return { field: null, value: null };
  }

  // ── SAVE FIELD ───────────────────────────────────
  async _saveField(field, value) {
    if (!this.todayRow) {
      this.onResult?.({ success: false, msg: "❌ Not connected to Google Sheets" });
      await this._speakRaw("இணைப்பு இல்லை! Not connected to Google Sheets.");
      return;
    }

    const meta = DAILY_COLUMNS[field];
    if (!meta) return;

    const valStr = Array.isArray(value) ? value.join(", ") : String(value);
    const ok     = await updateCell(meta.col, this.todayRow, valStr);

    if (ok) {
      // Save for undo
      this.lastSaved = { field, value: valStr, col: meta.col, row: this.todayRow };

      // Haptic feedback
      ReactNativeHapticFeedback.trigger("notificationSuccess");

      // Notify UI
      this.onResult?.({
        success: true,
        msg:     `✅ ${meta.label} → ${valStr}`,
        field,
        value:   valStr,
      });

      // Speak reply
      await this._speak(field, valStr);
    } else {
      this.onResult?.({ success: false, msg: `❌ Failed to save ${meta.label}` });
      await this._speakRaw("சேமிக்க முடியவில்லை! Failed to save. Please try again.");
    }
  }

  // ── SAVE ROUTINE ─────────────────────────────────
  async _saveRoutine(type) {
    const key = `${type}_routine`;
    ReactNativeHapticFeedback.trigger("notificationSuccess");
    this.onResult?.({
      success: true,
      msg: `✅ ${type === "morning" ? "🌅" : "🌙"} ${type} routine marked done!`,
      field: key, value: "done",
    });
    await this._speak(key, null);
  }

  // ── UNDO ─────────────────────────────────────────
  async _handleUndo() {
    if (!this.lastSaved) {
      await this._speakRaw("தவிர்க்க எதுவும் இல்லை! Nothing to undo.");
      return;
    }
    const { col, row } = this.lastSaved;
    await updateCell(col, row, "");
    this.onResult?.({ success: true, msg: "↩️ Last update undone!", field: "undo", value: "" });
    await this._speak("undo", null);
    this.lastSaved = null;
  }

  // ── SUMMARY ──────────────────────────────────────
  async _speakSummary() {
    if (!this.todayRow) {
      await this._speakRaw("இணைப்பு இல்லை! Not connected.");
      return;
    }
    this.onStateChange?.("processing");
    this.onResult?.({ success: true, msg: "📊 Reading your summary...", field: "summary", value: "" });

    try {
      const data = await getTodayData(this.todayRow);
      const ci   = (col) => col.length === 1
        ? col.charCodeAt(0) - 65
        : (col.charCodeAt(0) - 64) * 26 + (col.charCodeAt(1) - 65);

      const wakeUp   = data[ci("D")]  || "not set";
      const study    = data[ci("J")]  || "0";
      const pushUps  = data[ci("H")]  || "0";
      const water    = data[ci("AA")] || "0";
      const mood     = data[ci("Z")]  || "not set";
      const problems = data[ci("N")]  || "0";
      const screen   = data[ci("R")]  || "0";

      // Count filled fields
      const keys   = ["D","E","G","H","J","Z","AA","N","P","R"];
      const filled = keys.filter(k => data[ci(k)] && String(data[ci(k)]).trim()).length;
      const score  = Math.round((filled / keys.length) * 100);
      const grade  = score >= 90 ? "சிறந்தது! Excellent!" :
                     score >= 70 ? "நல்லது! Good job!"     :
                     score >= 50 ? "தொடருங்கள்! Keep going!" :
                                   "மேம்படுங்கள்! Improve tomorrow!";

      const summary =
        `இன்றைய சுருக்கம்! Here is your daily summary! ` +
        `உங்கள் productivity score ${score} சதவீதம்! ` +
        `Your productivity score is ${score} percent! ${grade} ` +
        `நீங்கள் ${wakeUp} மணிக்கு எழுந்தீர்கள்! You woke up at ${wakeUp}! ` +
        `${study} மணி நேரம் படித்தீர்கள்! You studied for ${study} hours! ` +
        `${pushUps} push-ups செய்தீர்கள்! You did ${pushUps} push-ups! ` +
        `${water} glasses தண்ணீர் குடித்தீர்கள்! You drank ${water} glasses of water! ` +
        `${problems} problems தீர்த்தீர்கள்! You solved ${problems} problems! ` +
        `Mood: ${mood}! ` +
        `நாளை மேலும் சிறப்பாக செய்வோம்! See you tomorrow! Keep going!`;

      await this._speakRaw(summary);
    } catch (e) {
      await this._speakRaw("சுருக்கம் கிடைக்கவில்லை! Could not load summary.");
    }
  }

  // ── TTS HELPERS ──────────────────────────────────
  async _speak(field, value) {
    const tamil = TAMIL_REPLIES[field] || TAMIL_REPLIES["saved"];
    const enFn  = EN_REPLIES[field]   || EN_REPLIES.default;
    const en    = enFn(value);
    await this._speakRaw(`${tamil} ${en}`);
  }

  async _speakRaw(text) {
    return new Promise((resolve) => {
      this.onSpeaking?.(true);
      Tts.speak(text);
      // TTS finish listener restarts listening
      const listener = Tts.addEventListener("tts-finish", () => {
        listener.remove?.();
        resolve();
      });
      // Fallback timeout
      setTimeout(resolve, 8000);
    });
  }

  // ── CLEANUP ──────────────────────────────────────
  destroy() {
    this.isListening = false;
    try { Voice.destroy(); } catch (e) {}
    Tts.stop();
    Voice.removeAllListeners();
  }
}

// Singleton instance
export const voiceEngine = new VoiceEngine();
export default VoiceEngine;
