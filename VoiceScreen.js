// src/screens/VoiceScreen.js — FULLY AUTOMATED VOICE SCREEN
// Always listening | Tamil+English TTS | Waveform | No questions

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, ScrollView, TextInput,
  KeyboardAvoidingView, Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import * as Animatable from "react-native-animatable";
import { Colors, Spacing, Radius } from "../utils/colors";
import { voiceEngine } from "../voice/VoiceEngine";
import { useAppStore } from "../store/appStore";
import { NeonButton } from "../components/UIComponents";

const { width: W } = Dimensions.get("window");
const BAR_COUNT = 28;

const STATUS_CONFIG = {
  listening:  { color: Colors.cyan,    icon: "🎙️", text: "Listening... speak anytime"     },
  processing: { color: Colors.gold,    icon: "⚙️", text: "Understanding your command..."  },
  speaking:   { color: Colors.violet,  icon: "🔊", text: "Speaking reply..."              },
  stopped:    { color: Colors.textSec, icon: "⏸",  text: "Paused — tap Start to resume"  },
  saving:     { color: Colors.success, icon: "💾", text: "Saving to Google Sheets..."     },
  error:      { color: Colors.danger,  icon: "❌", text: "Error — tap Start to retry"     },
};

const QUICK_COMMANDS = [
  { label: "morning done", icon: "🌅" },
  { label: "night done",   icon: "🌙" },
  { label: "summary",      icon: "📊" },
  { label: "undo",         icon: "↩️" },
];

const VOICE_GUIDE = [
  ["wake up 5 30",          "⏰ Wake Up"],
  ["push-ups 30",           "💪 Push-Ups"],
  ["studied 2 hours",       "📚 Study Time"],
  ["feeling happy",         "😊 Mood"],
  ["drank 7 glasses",       "💧 Water"],
  ["screen time 3 hours",   "📱 Screen"],
  ["problems solved 10",    "✅ Problems"],
  ["meditation 20 minutes", "🧘 Meditation"],
  ["I woke up at 5:30",     "⏰ Natural speech"],
  ["tomorrow goal DSA",     "🎯 Tomorrow Goal"],
  ["morning done",          "🌅 Morning Routine"],
  ["night done",            "🌙 Night Routine"],
  ["summary",               "📊 Speak summary"],
  ["undo",                  "↩️ Undo last save"],
];

export default function VoiceScreen() {
  const { todayRow, apiKey, addXP, incrementHabits, addNotification } = useAppStore();

  const [status,     setStatus]     = useState("stopped");
  const [transcript, setTranscript] = useState("");
  const [resultMsg,  setResultMsg]  = useState("");
  const [resultOk,   setResultOk]   = useState(true);
  const [saveCount,  setSaveCount]  = useState(0);
  const [history,    setHistory]    = useState([]);
  const [showManual, setShowManual] = useState(false);
  const [manualText, setManualText] = useState("");

  const barAnims  = useRef(Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.08))).current;
  const waveLoops = useRef([]);
  const micGlow   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    voiceEngine.onStateChange = (s) => {
      setStatus(s);
      if (s === "listening") { startWave(); startGlow(); }
      else                   { stopWave();  stopGlow();  }
    };
    voiceEngine.onTranscript = (t) => setTranscript(t);
    voiceEngine.onSpeaking   = (sp) => { if (sp) setStatus("speaking"); };
    voiceEngine.onResult     = (r) => {
      setTranscript("");
      setResultMsg(r.msg);
      setResultOk(r.success);
      if (r.success) {
        setSaveCount(c => c + 1);
        addXP(10); incrementHabits();
        addNotification({ title: "✅ Saved!", body: r.msg });
        setHistory(h => [
          { msg: r.msg, time: new Date().toLocaleTimeString(), ok: true }, ...h.slice(0,9)
        ]);
      } else {
        setHistory(h => [
          { msg: r.msg, time: new Date().toLocaleTimeString(), ok: false }, ...h.slice(0,9)
        ]);
      }
    };
    return () => { voiceEngine.stop(); stopWave(); };
  }, [todayRow]);

  const startWave = () => {
    stopWave();
    waveLoops.current = barAnims.map((anim, i) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 0.2 + Math.random() * 0.8,
            duration: 150 + Math.random() * 250, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.05 + Math.random() * 0.2,
            duration: 150 + Math.random() * 250, useNativeDriver: true }),
        ])
      );
      setTimeout(() => loop.start(), i * 25);
      return loop;
    });
  };

  const stopWave = () => {
    waveLoops.current.forEach(l => l?.stop?.());
    waveLoops.current = [];
    barAnims.forEach(a =>
      Animated.timing(a, { toValue: 0.08, duration: 300, useNativeDriver: true }).start()
    );
  };

  const startGlow = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(micGlow, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.timing(micGlow, { toValue: 0, duration: 800, useNativeDriver: false }),
      ])
    ).start();
  };

  const stopGlow = () => {
    micGlow.stopAnimation();
    Animated.timing(micGlow, { toValue: 0, duration: 300, useNativeDriver: false }).start();
  };

  const startListening = async () => {
    setResultMsg(""); setTranscript("");
    await voiceEngine.start(todayRow, apiKey);
  };

  const stopListening  = async () => { await voiceEngine.stop(); };

  const sendQuick = async (cmd) => {
    await voiceEngine._processText(cmd);
  };

  const submitManual = async () => {
    if (!manualText.trim()) return;
    await voiceEngine._processText(manualText);
    setManualText(""); setShowManual(false);
  };

  const cfg      = STATUS_CONFIG[status] || STATUS_CONFIG.stopped;
  const isActive = status === "listening" || status === "processing";

  const glowBg = micGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(124,58,237,0.2)", "rgba(0,212,255,0.5)"],
  });

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>

        {/* HERO */}
        <LinearGradient colors={["#0D0221", "#080B1A", Colors.bg]} style={s.hero}>
          <Animated.View style={[s.orb, { backgroundColor: glowBg }]} />

          {/* Status */}
          <View style={[s.statusPill, { borderColor: cfg.color + "60" }]}>
            <View style={[s.dot, { backgroundColor: cfg.color, shadowColor: cfg.color }]} />
            <Text style={[s.statusTxt, { color: cfg.color }]}>{cfg.icon}  {cfg.text}</Text>
          </View>

          {/* Waveform */}
          <View style={s.waveRow}>
            {barAnims.map((anim, i) => (
              <Animated.View key={i} style={[s.bar, {
                transform: [{ scaleY: anim }],
                backgroundColor: isActive
                  ? (i % 3 === 0 ? Colors.violet : i % 3 === 1 ? Colors.cyan : Colors.blue)
                  : Colors.border + "50",
                height: Math.abs(i - BAR_COUNT / 2) < 5 ? 55 : 38,
              }]} />
            ))}
          </View>

          {/* Mic button */}
          <View style={s.micArea}>
            {isActive && (
              <>
                <Animatable.View animation="pulse" iterationCount="infinite" duration={1600}
                  style={[s.ring, { width: 130, height: 130, borderRadius: 65,
                    borderColor: Colors.violet + "50" }]} />
                <Animatable.View animation="pulse" iterationCount="infinite" duration={1600}
                  delay={500} style={[s.ring, { width: 165, height: 165, borderRadius: 82,
                    borderColor: Colors.cyan + "25" }]} />
              </>
            )}
            <TouchableOpacity onPress={isActive ? stopListening : startListening} activeOpacity={0.85}>
              <LinearGradient
                colors={isActive ? [Colors.danger, "#770000"] : [Colors.violet, Colors.blue]}
                style={s.micBtn}
              >
                <Text style={s.micIcon}>{isActive ? "⏹" : "🎙️"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Transcript */}
          {transcript
            ? <Animatable.Text animation="fadeIn" style={s.transcript}>"{transcript}"</Animatable.Text>
            : <Text style={s.hint}>{isActive ? "Speak naturally — no button needed" : "Tap mic to start"}</Text>
          }
        </LinearGradient>

        {/* RESULT */}
        {resultMsg ? (
          <Animatable.View animation="fadeInUp" style={[s.resultCard, {
            borderColor:     resultOk ? Colors.success + "60" : Colors.danger + "60",
            backgroundColor: resultOk ? Colors.success + "10" : Colors.danger + "10",
          }]}>
            <Text style={[s.resultTxt, { color: resultOk ? Colors.success : Colors.danger }]}>
              {resultMsg}
            </Text>
          </Animatable.View>
        ) : null}

        {/* COUNTER */}
        {saveCount > 0 && (
          <View style={s.counter}>
            <Text style={s.counterTxt}>✅ {saveCount} update{saveCount !== 1 ? "s" : ""} saved this session</Text>
          </View>
        )}

        {/* QUICK COMMANDS */}
        <View style={s.sec}>
          <Text style={s.secTitle}>⚡ Quick Commands</Text>
          <View style={s.quickRow}>
            {QUICK_COMMANDS.map(c => (
              <TouchableOpacity key={c.label} onPress={() => sendQuick(c.label)}>
                <LinearGradient colors={[Colors.violet + "50", Colors.blue + "30"]}
                  style={s.chip}>
                  <Text style={s.chipIcon}>{c.icon}</Text>
                  <Text style={s.chipTxt}>{c.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* VOICE GUIDE */}
        <View style={s.sec}>
          <Text style={s.secTitle}>🗣️ What You Can Say</Text>
          <View style={s.guideCard}>
            {VOICE_GUIDE.map(([say, saves]) => (
              <View key={say} style={s.guideRow}>
                <Text style={s.guideSay}>"{say}"</Text>
                <Text style={s.guideSave}>→ {saves}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* MANUAL INPUT */}
        <View style={s.sec}>
          <TouchableOpacity onPress={() => setShowManual(!showManual)} style={s.manualToggle}>
            <Text style={s.manualToggleTxt}>
              {showManual ? "▲ Hide manual input" : "⌨️ Type manually instead"}
            </Text>
          </TouchableOpacity>
          {showManual && (
            <Animatable.View animation="fadeInDown" style={{ gap: 10 }}>
              <TextInput
                style={s.manualInput}
                value={manualText}
                onChangeText={setManualText}
                placeholder='e.g. "push-ups 30" or "studied 2 hours"'
                placeholderTextColor={Colors.textMuted}
                onSubmitEditing={submitManual}
                returnKeyType="send"
                autoFocus
              />
              <NeonButton title="✅  Submit" onPress={submitManual} />
            </Animatable.View>
          )}
        </View>

        {/* HISTORY */}
        {history.length > 0 && (
          <View style={s.sec}>
            <Text style={s.secTitle}>📋 Session History</Text>
            <View style={s.histCard}>
              {history.map((item, i) => (
                <View key={i} style={s.histRow}>
                  <Text style={[s.histMsg, { color: item.ok ? Colors.success : Colors.danger }]}>
                    {item.msg}
                  </Text>
                  <Text style={s.histTime}>{item.time}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* START / STOP */}
        <View style={[s.sec, { flexDirection: "row", gap: 10 }]}>
          <View style={{ flex: 1 }}>
            <NeonButton title="🎙️  Start" onPress={startListening}
              colors={[Colors.violet, Colors.blue]} disabled={isActive} />
          </View>
          <View style={{ flex: 1 }}>
            <NeonButton title="⏹  Stop" onPress={stopListening}
              colors={[Colors.danger, "#880000"]} disabled={!isActive} />
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.bg },
  hero:   { paddingTop: 50, paddingBottom: 30, alignItems: "center", overflow: "hidden" },
  orb:    { position: "absolute", width: 260, height: 260, borderRadius: 130, top: -80, left: -80 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 999, borderWidth: 1,
    backgroundColor: Colors.bgSecondary, marginBottom: 22 },
  dot:    { width: 8, height: 8, borderRadius: 4,
    shadowOffset:{width:0,height:0}, shadowOpacity:1, shadowRadius:6, elevation:4 },
  statusTxt: { fontSize: 13, fontWeight: "600" },
  waveRow:   { flexDirection: "row", alignItems: "center", height: 70,
    gap: 2, marginBottom: 28, paddingHorizontal: 8 },
  bar:    { width: (W - 60) / BAR_COUNT - 2, borderRadius: 3 },
  micArea:{ alignItems: "center", justifyContent: "center",
    width: 200, height: 200, marginBottom: 16 },
  ring:   { position: "absolute", borderWidth: 1.5, alignSelf: "center" },
  micBtn: { width: 100, height: 100, borderRadius: 50,
    alignItems: "center", justifyContent: "center",
    shadowOffset:{width:0,height:10}, shadowOpacity:0.7, shadowRadius:20, elevation:20 },
  micIcon:   { fontSize: 40 },
  transcript:{ color: Colors.cyan, fontSize: 14, fontStyle: "italic",
    textAlign: "center", paddingHorizontal: 20 },
  hint: { color: Colors.textMuted, fontSize: 13 },
  resultCard:{ marginHorizontal: Spacing.md, padding: 14, borderRadius: Radius.md,
    borderWidth: 1, marginVertical: 8 },
  resultTxt: { fontSize: 14, fontWeight: "700", textAlign: "center" },
  counter:   { alignItems: "center", paddingVertical: 4 },
  counterTxt:{ color: Colors.success, fontSize: 12, fontWeight: "600" },
  sec:    { paddingHorizontal: Spacing.md, marginTop: Spacing.md },
  secTitle:  { fontSize: 14, fontWeight: "700", color: Colors.textPrim, marginBottom: 10 },
  quickRow:  { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip:   { flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999,
    borderWidth: 1, borderColor: Colors.violet + "40" },
  chipIcon:  { fontSize: 16 },
  chipTxt:   { color: Colors.textPrim, fontSize: 13, fontWeight: "600" },
  guideCard: { backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border },
  guideRow:  { flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border + "40" },
  guideSay:  { color: Colors.cyan, fontSize: 12, fontStyle: "italic", flex: 1 },
  guideSave: { color: Colors.textSec, fontSize: 12, textAlign: "right" },
  manualToggle:  { paddingVertical: 12, alignItems: "center" },
  manualToggleTxt:{ color: Colors.cyan, fontSize: 13 },
  manualInput:   { backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, padding: 14,
    color: Colors.textPrim, fontSize: 14 },
  histCard: { backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border },
  histRow:  { flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border + "30" },
  histMsg:  { fontSize: 12, fontWeight: "600", flex: 1 },
  histTime: { fontSize: 10, color: Colors.textMuted, marginLeft: 8 },
});
