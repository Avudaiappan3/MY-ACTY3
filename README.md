# 💰 Voice Expense Tracker — React Native

Premium voice-powered expense tracker with Midnight Neon theme.

## 📁 Project Structure
```
VoiceExpenseTracker/
├── App.js                          # Root navigation
├── app.json                        # Expo config
├── eas.json                        # EAS Build config
├── babel.config.js
├── package.json
└── src/
    ├── theme.js                    # Midnight Neon design tokens
    ├── screens/
    │   ├── HomeScreen.js           # Dashboard + today summary
    │   ├── VoiceScreen.js          # Voice recording + expense entry
    │   ├── AnalyticsScreen.js      # Charts + insights
    │   ├── HistoryScreen.js        # All expenses list
    │   └── SettingsScreen.js       # Budgets + preferences
    └── services/
        ├── storage.js              # AsyncStorage CRUD
        └── parser.js               # Voice text → expense parser
```

## 🚀 Setup & Run

### Step 1 — Install Node.js
Download from nodejs.org (LTS version)

### Step 2 — Install Expo CLI
```bash
npm install -g expo-cli eas-cli
```

### Step 3 — Go to project folder
```bash
cd VoiceExpenseTracker
npm install
```

### Step 4 — Run on phone
```bash
npx expo start
```
- Install **Expo Go** app on your Android phone
- Scan the QR code shown in terminal

## 📱 Build APK

### Option A — EAS Build (recommended)
```bash
eas login
eas build --platform android --profile preview
```

### Option B — Local build
```bash
npx expo run:android
```

## 🎙️ How to Use
1. Open app → tap **🎙️ Voice** tab
2. Tap the glowing mic button
3. Say: **"Food 50 UPI"** or **"Transport 30 cash"**
4. Review detected expense → tap **✓ Save**
5. Check **📊 Analytics** for insights

## 💬 Voice Commands
| Say | Result |
|-----|--------|
| "Transport 50" | ₹50 → Transport |
| "Food 30 UPI" | ₹30 → Food (UPI) |
| "Others 200 cash" | ₹200 → Others |
| "Personal use 100 petrol" | ₹100 → Personal Use |
| "Home things 140" | ₹140 → Home Things |
| "Rent 3000" | ₹3000 → Rent |

## ✨ Features
- 🎙️ Voice input with Whisper AI processing
- 🗣️ Voice confirmation (speaks back saved expense)
- 📊 Live analytics with bar charts
- 🎯 Budget tracking per category
- 🔥 Streak tracker
- 💾 Offline storage (AsyncStorage)
- ☁️ Google Sheets sync (optional)
- 🌙 Midnight Neon theme (AMOLED-friendly)
- 📳 Haptic feedback
- 🔔 Daily reminders
