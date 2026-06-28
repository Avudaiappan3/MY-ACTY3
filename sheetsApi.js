// src/api/sheetsApi.js — Google Sheets Integration

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

const SPREADSHEET_ID = "1af_PTOmXL39vG53bbRhn4oQ4hFogumxsX1N7jA7AYDg";
const SHEETS_BASE    = "https://sheets.googleapis.com/v4/spreadsheets";

export const DAILY_COLUMNS = {
  "wake up":       { col: "D",  label: "⏰ Wake Up" },
  "sleep time":    { col: "E",  label: "🌙 Sleep Time" },
  "sleep hours":   { col: "F",  label: "⏱ Sleep Hrs" },
  "meditation":    { col: "G",  label: "🧘 Meditation" },
  "push-ups":      { col: "H",  label: "💪 Push-Ups" },
  "study time":    { col: "J",  label: "📚 Study Time" },
  "reading time":  { col: "K",  label: "📖 Reading Time" },
  "java hours":    { col: "L",  label: "☕ Java Hours" },
  "topics":        { col: "M",  label: "📌 Topics" },
  "problems":      { col: "N",  label: "✅ Problems" },
  "words learned": { col: "O",  label: "🔤 Words" },
  "productive":    { col: "P",  label: "💡 Productive" },
  "revision":      { col: "Q",  label: "🔁 Revision" },
  "screen time":   { col: "R",  label: "📱 Screen" },
  "youtube":       { col: "S",  label: "📺 YouTube" },
  "social media":  { col: "T",  label: "💬 Social" },
  "gaming":        { col: "U",  label: "🎮 Gaming" },
  "daily goal":    { col: "Y",  label: "🎯 Goal" },
  "mood":          { col: "Z",  label: "😊 Mood" },
  "water":         { col: "AA", label: "💧 Water" },
  "breakfast":     { col: "AB", label: "🍳 Breakfast" },
  "dinner":        { col: "AC", label: "🍽 Dinner" },
  "pomodoro":      { col: "AD", label: "🍅 Pomodoro" },
  "tomorrow goal": { col: "AE", label: "🎯 Tomorrow" },
  "daily notes":   { col: "AK", label: "📝 Notes" },
};

// Get OAuth token from storage
const getToken = async () => {
  return await AsyncStorage.getItem("google_access_token");
};

// Save token
export const saveToken = async (token) => {
  await AsyncStorage.setItem("google_access_token", token);
};

// Get today's row number
export const getTodayRow = async () => {
  try {
    const token  = await getToken();
    const today  = moment().format("DD-MMM-YYYY");
    const range  = encodeURIComponent("'📋 Daily Tracker'!A:A");
    const url    = `${SHEETS_BASE}/${SPREADSHEET_ID}/values/${range}`;
    const res    = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const values = res.data.values || [];
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] && values[i][0].includes(today)) {
        return i + 1;
      }
    }
    return null;
  } catch (e) {
    console.error("getTodayRow error:", e);
    return null;
  }
};

// Update a single cell
export const updateCell = async (col, row, value) => {
  try {
    const token = await getToken();
    const range = encodeURIComponent(`'📋 Daily Tracker'!${col}${row}`);
    const url   = `${SHEETS_BASE}/${SPREADSHEET_ID}/values/${range}?valueInputOption=USER_ENTERED`;
    await axios.put(url, { values: [[value]] }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Cache update for offline
    await cacheUpdate(col, row, value);
    return true;
  } catch (e) {
    console.error("updateCell error:", e);
    // Save to offline queue
    await addToOfflineQueue(col, row, value);
    return false;
  }
};

// Get today's full row data
export const getTodayData = async (row) => {
  try {
    const token = await getToken();
    const range = encodeURIComponent(`'📋 Daily Tracker'!A${row}:AK${row}`);
    const url   = `${SHEETS_BASE}/${SPREADSHEET_ID}/values/${range}`;
    const res   = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.values?.[0] || [];
  } catch (e) {
    console.error("getTodayData error:", e);
    return [];
  }
};

// Get week data for charts
export const getWeekData = async () => {
  try {
    const token = await getToken();
    const range = encodeURIComponent("'📋 Daily Tracker'!A2:AK60");
    const url   = `${SHEETS_BASE}/${SPREADSHEET_ID}/values/${range}`;
    const res   = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const all = (res.data.values || []).filter(r => r && r.length > 1);
    return all.slice(-7);
  } catch (e) {
    console.error("getWeekData error:", e);
    return [];
  }
};

// Mark routine done
export const markRoutineDone = async (sheetName, colIdx) => {
  try {
    const token  = await getToken();
    const range  = encodeURIComponent(`'${sheetName}'!A:H`);
    const url    = `${SHEETS_BASE}/${SPREADSHEET_ID}/values/${range}`;
    const res    = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const rows   = res.data.values || [];
    const updates = [];
    rows.forEach((row, i) => {
      if (row[colIdx] === "☐") {
        updates.push({
          range: `'${sheetName}'!${String.fromCharCode(65 + colIdx)}${i + 1}`,
          values: [["✓"]],
        });
      }
    });
    if (updates.length > 0) {
      await axios.post(
        `${SHEETS_BASE}/${SPREADSHEET_ID}/values:batchUpdate`,
        { valueInputOption: "USER_ENTERED", data: updates },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
    return updates.length;
  } catch (e) {
    console.error("markRoutine error:", e);
    return 0;
  }
};

// Offline queue
const addToOfflineQueue = async (col, row, value) => {
  try {
    const queue = JSON.parse(await AsyncStorage.getItem("offline_queue") || "[]");
    queue.push({ col, row, value, timestamp: Date.now() });
    await AsyncStorage.setItem("offline_queue", JSON.stringify(queue));
  } catch (e) {}
};

// Sync offline queue
export const syncOfflineQueue = async () => {
  try {
    const queue = JSON.parse(await AsyncStorage.getItem("offline_queue") || "[]");
    const failed = [];
    for (const item of queue) {
      const ok = await updateCell(item.col, item.row, item.value);
      if (!ok) failed.push(item);
    }
    await AsyncStorage.setItem("offline_queue", JSON.stringify(failed));
    return queue.length - failed.length;
  } catch (e) {
    return 0;
  }
};

// Cache last known data
const cacheUpdate = async (col, row, value) => {
  try {
    const cache = JSON.parse(await AsyncStorage.getItem("today_cache") || "{}");
    cache[`${col}${row}`] = value;
    await AsyncStorage.setItem("today_cache", JSON.stringify(cache));
  } catch (e) {}
};

// Column index helper
export const colIndex = (col) => {
  if (col.length === 1) return col.charCodeAt(0) - 65;
  return (col.charCodeAt(0) - 64) * 26 + (col.charCodeAt(1) - 65);
};
