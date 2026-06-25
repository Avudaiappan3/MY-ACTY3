// src/screens/HomeScreen.js — Premium Home Dashboard

import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Animated, Dimensions, RefreshControl,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import * as Animatable from "react-native-animatable";
import { Colors, Spacing, Radius, Shadow, Typography } from "../utils/colors";
import {
  GlassCard, StatCard, NeonButton,
  SectionHeader, XPBar, NotifBadge, ProgressRing,
} from "../components/UIComponents";
import { useAppStore } from "../store/appStore";
import { getTodayData, getTodayRow, colIndex, DAILY_COLUMNS } from "../api/sheetsApi";
import moment from "moment";

const { width: W } = Dimensions.get("window");

const QUICK_ACTIONS = [
  { icon: "⏰", label: "Wake Up",    field: "wake up",    color: Colors.cyan   },
  { icon: "💪", label: "Push-Ups",   field: "push-ups",   color: Colors.pink   },
  { icon: "🧘", label: "Meditation", field: "meditation", color: Colors.violet },
  { icon: "📚", label: "Study",      field: "study time", color: Colors.gold   },
  { icon: "💧", label: "Water",      field: "water",      color: "#4DD0E1"     },
  { icon: "😊", label: "Mood",       field: "mood",       color: "#A5D6A7"     },
  { icon: "📱", label: "Screen",     field: "screen time",color: Colors.danger  },
  { icon: "✅", label: "Problems",   field: "problems",   color: "#81C784"     },
];

export default function HomeScreen({ navigation }) {
  const {
    todayData, setTodayData, setTodayRow,
    xp, level, streak, notifications,
    isConnected, addNotification,
  } = useAppStore();

  const [refreshing, setRefreshing]   = useState(false);
  const [progress,   setProgress]     = useState(0);
  const [filled,     setFilled]       = useState(0);
  const [time,       setTime]         = useState(moment().format("hh:mm:ss A"));
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(moment().format("hh:mm:ss A"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Pulse animation for streak
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Load data
  useEffect(() => { loadData(); }, [isConnected]);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const row  = await getTodayRow();
      if (row) {
        setTodayRow(row);
        const data = await getTodayData(row);
        setTodayData(data);
        calcProgress(data);
      }
    } catch (e) {
      console.log("Home load error:", e);
    }
    setRefreshing(false);
  };

  const calcProgress = (data) => {
    const keys = ["D","E","G","H","J","Z","AA","N","P","R"];
    let count  = 0;
    keys.forEach(col => {
      const idx = colIndex(col);
      if (data[idx] && String(data[idx]).trim()) count++;
    });
    setFilled(count);
    setProgress(Math.round((count / keys.length) * 100));
  };

  const greeting = () => {
    const h = moment().hour();
    if (h < 12) return { text: "Good Morning ☀️", sub: "Rise and shine!" };
    if (h < 17) return { text: "Good Afternoon 🌤", sub: "Keep pushing!" };
    if (h < 21) return { text: "Good Evening 🌆", sub: "Almost there!" };
    return { text: "Good Night 🌙", sub: "Rest well!" };
  };

  const getStatValue = (col) => {
    const idx = colIndex(col);
    return todayData[idx] || "—";
  };

  const { text: greetText, sub: greetSub } = greeting();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData}
            tintColor={Colors.cyan} colors={[Colors.cyan]} />
        }
      >
        {/* ── HERO SECTION ── */}
        <LinearGradient
          colors={["#0D0221", "#1A0533", "#050816"]}
          style={s.hero}
        >
          {/* Floating orbs */}
          <View style={[s.orb, { top: -30, right: -30, backgroundColor: Colors.violet + "30" }]} />
          <View style={[s.orb, { top: 60, left: -40, backgroundColor: Colors.blue + "20",
            width: 120, height: 120 }]} />

          {/* Top row */}
          <View style={s.heroTop}>
            <View>
              <Text style={s.heroGreet}>{greetText}</Text>
              <Text style={s.heroSub}>{greetSub}</Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 6 }}>
              <TouchableOpacity
                style={s.notifBtn}
                onPress={() => navigation.navigate("Notifications")}
              >
                <Text style={{ fontSize: 22 }}>🔔</Text>
                <NotifBadge count={unreadCount} />
              </TouchableOpacity>
              <Text style={s.heroClock}>{time}</Text>
            </View>
          </View>

          {/* Date */}
          <Text style={s.heroDate}>{moment().format("dddd, DD MMMM YYYY")}</Text>

          {/* Progress ring + info */}
          <View style={s.heroProgress}>
            <ProgressRing
              size={110}
              progress={progress}
              label={`${progress}%`}
              sublabel="Done"
            />
            <View style={s.heroStats}>
              <View style={s.heroStat}>
                <Text style={s.heroStatVal}>{filled}/10</Text>
                <Text style={s.heroStatLbl}>Habits Logged</Text>
              </View>
              <View style={s.heroStat}>
                <Animated.Text style={[s.heroStreak, { transform: [{ scale: pulseAnim }] }]}>
                  🔥 {streak}
                </Animated.Text>
                <Text style={s.heroStatLbl}>Day Streak</Text>
              </View>
              <View style={s.heroStat}>
                <Text style={s.heroStatVal}>Lv.{level}</Text>
                <Text style={s.heroStatLbl}>Your Level</Text>
              </View>
            </View>
          </View>

          {/* XP Bar */}
          <View style={{ paddingHorizontal: Spacing.md, paddingBottom: Spacing.md }}>
            <XPBar xp={xp} level={level} />
          </View>

          {/* Motivational card */}
          <View style={s.motivCard}>
            <Text style={s.motivText}>
              {progress >= 80 ? "🌟 Outstanding! You're absolutely crushing it today!" :
               progress >= 50 ? "💪 Great progress! Keep the momentum going!" :
               progress >= 30 ? "📈 Good start! You've got this, keep logging!" :
               "🚀 Start logging your habits to track your progress!"}
            </Text>
          </View>
        </LinearGradient>

        {/* ── STAT CARDS ── */}
        <View style={s.section}>
          <SectionHeader title="📊 Today's Stats" action="See All" onAction={() => navigation.navigate("Summary")} />
          <View style={s.statsGrid}>
            <StatCard icon="⏰" label="Wake Up"   value={getStatValue("D")}  color={Colors.cyan}    trend="On track"  trendUp />
            <StatCard icon="💧" label="Water"     value={getStatValue("AA")} color="#4DD0E1"         trend="+2 vs avg" trendUp />
            <StatCard icon="📚" label="Study Hrs" value={getStatValue("J")}  color={Colors.gold}    trend="Above avg" trendUp />
            <StatCard icon="😊" label="Mood"      value={getStatValue("Z")}  color="#A5D6A7"        trend=""          />
          </View>
        </View>

        {/* ── QUICK ACTIONS ── */}
        <View style={s.section}>
          <SectionHeader title="⚡ Quick Update" />
          <View style={s.quickGrid}>
            {QUICK_ACTIONS.map((item, i) => (
              <Animatable.View
                key={item.field}
                animation="fadeInUp"
                delay={i * 60}
                style={s.quickCell}
              >
                <TouchableOpacity
                  style={[s.quickBtn, { borderColor: item.color + "50" }]}
                  onPress={() => navigation.navigate("Voice", { prefill: item.field })}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[item.color + "25", item.color + "10"]}
                    style={s.quickBtnInner}
                  >
                    <Text style={s.quickIcon}>{item.icon}</Text>
                    <Text style={[s.quickLabel, { color: item.color }]}>{item.label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        </View>

        {/* ── ROUTINES ── */}
        <View style={s.section}>
          <SectionHeader title="🔁 Daily Routines" />
          <View style={s.routineRow}>
            <TouchableOpacity
              style={s.routineBtn}
              onPress={() => navigation.navigate("Routine", { type: "morning" })}
            >
              <LinearGradient
                colors={["#FF9800", "#F5A623"]}
                style={s.routineBtnInner}
              >
                <Text style={s.routineBtnIcon}>🌅</Text>
                <Text style={s.routineBtnText}>Morning{"\n"}Routine</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.routineBtn}
              onPress={() => navigation.navigate("Routine", { type: "night" })}
            >
              <LinearGradient
                colors={[Colors.violet, Colors.blue]}
                style={s.routineBtnInner}
              >
                <Text style={s.routineBtnIcon}>🌙</Text>
                <Text style={s.routineBtnText}>Night{"\n"}Routine</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── AI COACH CARD ── */}
        <View style={[s.section, { marginBottom: 30 }]}>
          <GlassCard
            glowColor={Colors.cyan}
            onPress={() => navigation.navigate("Coach")}
          >
            <View style={s.coachRow}>
              <Text style={{ fontSize: 36 }}>🧠</Text>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.coachTitle}>AI Daily Coach</Text>
                <Text style={s.coachSub}>
                  Get personalized insights and today's action plan
                </Text>
              </View>
              <Text style={{ color: Colors.cyan, fontSize: 20 }}>→</Text>
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: Colors.bg },

  // Hero
  hero:        { paddingTop: 50, paddingBottom: 10, overflow: "hidden" },
  orb:         { position: "absolute", width: 160, height: 160, borderRadius: 80 },
  heroTop:     { flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", paddingHorizontal: Spacing.lg, marginBottom: 4 },
  heroGreet:   { fontSize: 26, fontWeight: "800", color: Colors.textPrim },
  heroSub:     { fontSize: 13, color: Colors.textSec, marginTop: 2 },
  heroClock:   { fontSize: 13, color: Colors.cyan, fontFamily: "monospace" },
  heroDate:    { fontSize: 12, color: Colors.textMuted, paddingHorizontal: Spacing.lg, marginBottom: 20 },
  heroProgress:{ flexDirection: "row", alignItems: "center",
    paddingHorizontal: Spacing.lg, marginBottom: 16, gap: 20 },
  heroStats:   { flex: 1, gap: 14 },
  heroStat:    {},
  heroStatVal: { fontSize: 20, fontWeight: "800", color: Colors.textPrim },
  heroStatLbl: { fontSize: 11, color: Colors.textSec },
  heroStreak:  { fontSize: 22, fontWeight: "800", color: Colors.warning },
  motivCard:   { marginHorizontal: Spacing.md, marginBottom: Spacing.md,
    backgroundColor: Colors.violet + "20", borderRadius: Radius.md,
    padding: 14, borderLeftWidth: 3, borderLeftColor: Colors.cyan },
  motivText:   { color: Colors.textPrim, fontSize: 13, lineHeight: 20 },
  notifBtn:    { position: "relative" },

  // Stats
  section:    { paddingHorizontal: Spacing.md, marginTop: Spacing.md },
  statsGrid:  { flexDirection: "row", flexWrap: "wrap" },

  // Quick
  quickGrid:  { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickCell:  { width: (W - Spacing.md * 2 - 8 * 3) / 4 },
  quickBtn:   { borderRadius: Radius.md, borderWidth: 1, overflow: "hidden" },
  quickBtnInner:{ padding: 12, alignItems: "center", gap: 6 },
  quickIcon:  { fontSize: 24 },
  quickLabel: { fontSize: 11, fontWeight: "600", textAlign: "center" },

  // Routines
  routineRow:     { flexDirection: "row", gap: 12 },
  routineBtn:     { flex: 1, borderRadius: Radius.lg, overflow: "hidden" },
  routineBtnInner:{ padding: 20, alignItems: "center", gap: 8 },
  routineBtnIcon: { fontSize: 32 },
  routineBtnText: { color: "#fff", fontWeight: "700", fontSize: 15, textAlign: "center" },

  // Coach
  coachRow:   { flexDirection: "row", alignItems: "center" },
  coachTitle: { fontSize: 16, fontWeight: "700", color: Colors.textPrim },
  coachSub:   { fontSize: 12, color: Colors.textSec, marginTop: 3 },
});
