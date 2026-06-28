// src/components/UIComponents.js — All Reusable Premium Components

import React, { useRef, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Stop } from "react-native-svg";
import * as Animatable from "react-native-animatable";
import { Colors, Typography, Spacing, Radius, Shadow } from "../utils/colors";

const { width: W } = Dimensions.get("window");

// ══════════════════════════════════════════
//  GLASS CARD
// ══════════════════════════════════════════
export const GlassCard = ({
  children, style, glowColor = Colors.violet,
  onPress, animated = false
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1.0,  useNativeDriver: true }).start();

  const Card = (
    <Animated.View style={[
      styles.glassCard,
      { borderColor: glowColor + "50", transform: [{ scale }] },
      style,
      { shadowColor: glowColor },
    ]}>
      <View style={[styles.glassInner, { borderColor: glowColor + "30" }]}>
        {children}
      </View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
      >
        {Card}
      </TouchableOpacity>
    );
  }
  return Card;
};

// ══════════════════════════════════════════
//  NEON BUTTON
// ══════════════════════════════════════════
export const NeonButton = ({
  title, onPress, colors = [Colors.violet, Colors.blue],
  style, textStyle, icon, loading = false, disabled = false,
  size = "md"
}) => {
  const heights = { sm: 40, md: 52, lg: 62 };
  const fonts   = { sm: 13,  md: 15,  lg: 17 };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[styles.neonBtnWrap, style]}
    >
      <LinearGradient
        colors={disabled ? ["#333", "#444"] : colors}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={[styles.neonBtn, { height: heights[size] }, Shadow.violet]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <View style={styles.neonBtnRow}>
            {icon && <Text style={styles.neonBtnIcon}>{icon}</Text>}
            <Text style={[styles.neonBtnText, { fontSize: fonts[size] }, textStyle]}>
              {title}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ══════════════════════════════════════════
//  STAT CARD
// ══════════════════════════════════════════
export const StatCard = ({
  icon, label, value, trend, trendUp = true,
  color = Colors.cyan, style
}) => (
  <Animatable.View animation="fadeInUp" duration={500} style={[styles.statCard, style]}>
    <LinearGradient
      colors={[Colors.card, Colors.cardHover]}
      style={styles.statGrad}
    >
      <View style={[styles.statIconWrap, { backgroundColor: color + "20" }]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value || "—"}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {trend && (
        <View style={styles.statTrend}>
          <Text style={{ color: trendUp ? Colors.success : Colors.danger, fontSize: 11 }}>
            {trendUp ? "↑" : "↓"} {trend}
          </Text>
        </View>
      )}
    </LinearGradient>
  </Animatable.View>
);

// ══════════════════════════════════════════
//  PROGRESS RING (SVG Animated)
// ══════════════════════════════════════════
export const ProgressRing = ({
  size = 120, progress = 0, color = Colors.violet,
  strokeWidth = 10, label, sublabel
}) => {
  const r      = (size - strokeWidth) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  const anim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress, duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGrad id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={Colors.violet} />
            <Stop offset="100%" stopColor={Colors.cyan} />
          </SvgGrad>
        </Defs>
        {/* Track */}
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={Colors.border} strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress */}
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="url(#ringGrad)" strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}>
        {label    && <Text style={[Typography.title,   { color: Colors.textPrim }]}>{label}</Text>}
        {sublabel && <Text style={[Typography.caption, { color: Colors.textSec }]}>{sublabel}</Text>}
      </View>
    </View>
  );
};

// ══════════════════════════════════════════
//  XP BAR
// ══════════════════════════════════════════
export const XPBar = ({ xp, level }) => {
  const xpInLevel  = xp % 100;
  const progress   = xpInLevel;
  const anim       = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress, duration: 800, useNativeDriver: false,
    }).start();
  }, [progress]);

  const LEVELS = ["Beginner", "Student", "Warrior", "Scholar", "Legend"];
  const lName  = LEVELS[Math.min(level - 1, LEVELS.length - 1)];

  return (
    <View style={styles.xpWrap}>
      <View style={styles.xpRow}>
        <Text style={styles.xpLevel}>Lv.{level} {lName}</Text>
        <Text style={styles.xpCount}>{xpInLevel}/100 XP</Text>
      </View>
      <View style={styles.xpTrack}>
        <Animated.View style={[
          styles.xpFill,
          { width: anim.interpolate({ inputRange: [0,100], outputRange: ["0%","100%"] }) }
        ]} />
      </View>
    </View>
  );
};

// ══════════════════════════════════════════
//  SECTION HEADER
// ══════════════════════════════════════════
export const SectionHeader = ({ title, action, onAction }) => (
  <View style={styles.sectionRow}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ══════════════════════════════════════════
//  NOTIFICATION BADGE
// ══════════════════════════════════════════
export const NotifBadge = ({ count }) => {
  if (!count) return null;
  return (
    <View style={styles.notifBadge}>
      <Text style={styles.notifText}>{count > 9 ? "9+" : count}</Text>
    </View>
  );
};

// ══════════════════════════════════════════
//  ACHIEVEMENT BADGE
// ══════════════════════════════════════════
export const AchievementBadge = ({ icon, title, desc, unlocked = false }) => (
  <Animatable.View
    animation={unlocked ? "bounceIn" : undefined}
    style={[styles.badgeWrap, { opacity: unlocked ? 1 : 0.4 }]}
  >
    <LinearGradient
      colors={unlocked ? [Colors.violet, Colors.blue] : [Colors.card, Colors.card]}
      style={styles.badgeGrad}
    >
      <Text style={styles.badgeIcon}>{icon}</Text>
      <Text style={styles.badgeTitle}>{title}</Text>
      <Text style={styles.badgeDesc}>{desc}</Text>
    </LinearGradient>
  </Animatable.View>
);

// ══════════════════════════════════════════
//  INLINE LOADING
// ══════════════════════════════════════════
export const LoadingRow = ({ msg = "Loading..." }) => (
  <View style={styles.loadingRow}>
    <ActivityIndicator color={Colors.cyan} size="small" />
    <Text style={styles.loadingText}>{msg}</Text>
  </View>
);

// ══════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════
const styles = StyleSheet.create({
  // Glass Card
  glassCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    marginVertical: 6,
  },
  glassInner: {
    borderRadius: Radius.lg,
    overflow: "hidden",
    padding: Spacing.md,
  },

  // Neon Button
  neonBtnWrap: { width: "100%" },
  neonBtn: {
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  neonBtnRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  neonBtnIcon: { fontSize: 18 },
  neonBtnText: { color: Colors.textPrim, fontWeight: "700" },

  // Stat Card
  statCard: {
    flex: 1,
    margin: 5,
    borderRadius: Radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statGrad: {
    padding: Spacing.md,
    alignItems: "center",
  },
  statIconWrap: {
    width: 44, height: 44,
    borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    marginBottom: 8,
  },
  statIcon:  { fontSize: 20 },
  statValue: { fontSize: 20, fontWeight: "700", marginBottom: 2 },
  statLabel: { ...Typography.caption, color: Colors.textSec },
  statTrend: { marginTop: 4 },

  // XP
  xpWrap:  { marginVertical: 8 },
  xpRow:   { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  xpLevel: { ...Typography.label, color: Colors.cyan },
  xpCount: { ...Typography.caption, color: Colors.textSec },
  xpTrack: {
    height: 6, backgroundColor: Colors.border,
    borderRadius: Radius.full, overflow: "hidden",
  },
  xpFill: {
    height: "100%", borderRadius: Radius.full,
    backgroundColor: Colors.violet,
  },

  // Section
  sectionRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 12 },
  sectionTitle:  { fontSize: 16, fontWeight: "700", color: Colors.textPrim },
  sectionAction: { fontSize: 13, color: Colors.cyan },

  // Notif badge
  notifBadge: {
    position: "absolute", top: -4, right: -4,
    backgroundColor: Colors.danger,
    borderRadius: 10, minWidth: 18, height: 18,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 3,
  },
  notifText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  // Achievement badge
  badgeWrap:  { width: (W - 60) / 3, margin: 5 },
  badgeGrad:  { borderRadius: Radius.md, padding: 12, alignItems: "center" },
  badgeIcon:  { fontSize: 28, marginBottom: 4 },
  badgeTitle: { fontSize: 11, fontWeight: "700", color: Colors.textPrim, textAlign: "center" },
  badgeDesc:  { fontSize: 10, color: Colors.textSec, textAlign: "center", marginTop: 2 },

  // Loading
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 20, justifyContent: "center" },
  loadingText: { color: Colors.textSec, fontSize: 13 },
});
