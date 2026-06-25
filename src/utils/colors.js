// src/utils/colors.js — Midnight Neon Design System

export const Colors = {
  // Backgrounds
  bg:          "#050816",
  bgSecondary: "#0B1023",
  card:        "#111827",
  cardHover:   "#1E293B",

  // Gradients
  gradStart:   "#7C3AED",
  gradEnd:     "#2563EB",
  gradHero:    ["#7C3AED", "#2563EB", "#00D4FF"],

  // Accents
  cyan:        "#00D4FF",
  violet:      "#7C3AED",
  blue:        "#2563EB",
  pink:        "#FF4081",
  gold:        "#FFB300",

  // Status
  success:     "#00E676",
  warning:     "#FFB300",
  danger:      "#FF5252",
  info:        "#00D4FF",

  // Text
  textPrim:    "#F8FAFC",
  textSec:     "#94A3B8",
  textMuted:   "#4B5563",

  // Borders
  border:      "#2E3A59",
  borderGlow:  "#7C3AED",

  // Nav
  navBg:       "#080B18",
  navActive:   "#7C3AED",

  // Cards
  cardGlass:   "rgba(17, 24, 39, 0.85)",
  glowViolet:  "rgba(124, 58, 237, 0.3)",
  glowCyan:    "rgba(0, 212, 255, 0.2)",
  glowGold:    "rgba(255, 179, 0, 0.2)",
};

export const Typography = {
  hero:    { fontSize: 34, fontWeight: "800", fontFamily: "Roboto" },
  title:   { fontSize: 24, fontWeight: "700", fontFamily: "Roboto" },
  section: { fontSize: 18, fontWeight: "600", fontFamily: "Roboto" },
  body:    { fontSize: 14, fontWeight: "400", fontFamily: "Roboto" },
  caption: { fontSize: 11, fontWeight: "400", fontFamily: "Roboto" },
  label:   { fontSize: 12, fontWeight: "600", fontFamily: "Roboto" },
  mono:    { fontSize: 13, fontWeight: "500", fontFamily: "monospace" },
};

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const Radius = {
  sm:   8,
  md:   14,
  lg:   20,
  xl:   28,
  full: 999,
};

export const Shadow = {
  violet: {
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  cyan: {
    shadowColor: "#00D4FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
};
