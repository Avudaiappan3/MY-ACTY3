// src/store/appStore.js — Global State with Zustand

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAppStore = create((set, get) => ({
  // ── Connection ──────────────────────────
  isConnected:  false,
  todayRow:     null,
  todayData:    [],
  setConnected: (v)    => set({ isConnected: v }),
  setTodayRow:  (row)  => set({ todayRow: row }),
  setTodayData: (data) => set({ todayData: data }),

  // ── User ────────────────────────────────
  userName:    "Friend",
  spreadsheetId: "1af_PTOmXL39vG53bbRhn4oQ4hFogumxsX1N7jA7AYDg",
  apiKey:      "",
  voiceSpeed:  1.0,
  voiceLang:   "en-IN",
  theme:       "midnight",
  setUserName: (n) => set({ userName: n }),
  setApiKey:   (k) => set({ apiKey: k }),
  setVoiceSpeed: (s) => set({ voiceSpeed: s }),
  setVoiceLang:  (l) => set({ voiceLang: l }),

  // ── Gamification ────────────────────────
  xp:           0,
  level:        1,
  streak:       0,
  badges:       [],
  totalHabits:  0,
  addXP: (pts) => {
    const newXP    = get().xp + pts;
    const newLevel = Math.floor(newXP / 100) + 1;
    set({ xp: newXP, level: newLevel });
    AsyncStorage.setItem("xp",    String(newXP));
    AsyncStorage.setItem("level", String(newLevel));
  },
  addBadge: (badge) => {
    const badges = [...get().badges, badge];
    set({ badges });
    AsyncStorage.setItem("badges", JSON.stringify(badges));
  },
  setStreak: (s) => {
    set({ streak: s });
    AsyncStorage.setItem("streak", String(s));
  },
  incrementHabits: () => set((s) => ({ totalHabits: s.totalHabits + 1 })),

  // ── Notifications ───────────────────────
  notifications: [],
  addNotification: (n) => set((s) => ({
    notifications: [{ ...n, id: Date.now(), read: false }, ...s.notifications]
  })),
  markAllRead: () => set((s) => ({
    notifications: s.notifications.map(n => ({ ...n, read: true }))
  })),
  clearNotifications: () => set({ notifications: [] }),

  // ── Today's Fields ───────────────────────
  fields: {
    wakeUp:      "",
    sleepTime:   "",
    sleepHours:  "",
    meditation:  0,
    pushUps:     0,
    studyTime:   0,
    readingTime: 0,
    javaHours:   0,
    topics:      [],
    problems:    0,
    wordsLearned:0,
    productive:  0,
    revision:    false,
    screenTime:  0,
    youtube:     0,
    socialMedia: 0,
    gaming:      0,
    mood:        "",
    water:       0,
    breakfast:   "",
    dinner:      "",
    pomodoro:    0,
    dailyGoal:   "",
    tomorrowGoal:"",
    dailyNotes:  "",
    activities:  [],
  },
  updateField: (key, value) => set((s) => ({
    fields: { ...s.fields, [key]: value }
  })),
  resetFields: () => set((s) => ({
    fields: Object.fromEntries(Object.keys(s.fields).map(k => [k, 
      typeof s.fields[k] === "number"  ? 0  :
      typeof s.fields[k] === "boolean" ? false :
      Array.isArray(s.fields[k])       ? [] : ""
    ]))
  })),

  // ── Loading ─────────────────────────────
  isLoading:  false,
  loadingMsg: "",
  setLoading: (v, msg = "") => set({ isLoading: v, loadingMsg: msg }),

  // ── Init from storage ────────────────────
  initFromStorage: async () => {
    const xp      = parseInt(await AsyncStorage.getItem("xp")     || "0");
    const level   = parseInt(await AsyncStorage.getItem("level")   || "1");
    const streak  = parseInt(await AsyncStorage.getItem("streak")  || "0");
    const badges  = JSON.parse(await AsyncStorage.getItem("badges")|| "[]");
    const apiKey  = await AsyncStorage.getItem("api_key") || "";
    const spId    = await AsyncStorage.getItem("spreadsheet_id") ||
                    "1af_PTOmXL39vG53bbRhn4oQ4hFogumxsX1N7jA7AYDg";
    set({ xp, level, streak, badges, apiKey, spreadsheetId: spId });
  },
}));
