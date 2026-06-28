// App.js — Root Entry Point

import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Animated,
  StatusBar, Dimensions,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import LinearGradient from "react-native-linear-gradient";
import * as Animatable from "react-native-animatable";

import HomeScreen     from "./src/screens/HomeScreen";
import VoiceScreen    from "./src/screens/VoiceScreen";
import SummaryScreen  from "./src/screens/SummaryScreen";
import ChartsScreen   from "./src/screens/ChartsScreen";
import RoutineScreen  from "./src/screens/RoutineScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

import { Colors, Radius } from "./src/utils/colors";
import { useAppStore }    from "./src/store/appStore";
import { getTodayRow }    from "./src/api/sheetsApi";

const { width: W, height: H } = Dimensions.get("window");
const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// ══════════════════════════════════════════
//  SPLASH SCREEN
// ══════════════════════════════════════════
function SplashScreen({ onDone }) {
  const logoScale   = new Animated.Value(0);
  const logoOpacity = new Animated.Value(0);
  const barWidth    = new Animated.Value(0);
  const textOpacity = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      // Logo appears
      Animated.parallel([
        Animated.spring(logoScale,   { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      // Text appears
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      // Bar fills
      Animated.timing(barWidth, { toValue: W - 80, duration: 1500,
        useNativeDriver: false }),
    ]).start(() => setTimeout(onDone, 400));
  }, []);

  return (
    <LinearGradient colors={["#050816", "#0D0221", "#050816"]} style={spl.root}>
      {/* Orbs */}
      <View style={[spl.orb, { top: H * 0.1, left: -60, backgroundColor: Colors.violet + "25" }]} />
      <View style={[spl.orb, { bottom: H * 0.1, right: -60, backgroundColor: Colors.blue + "20",
        width: 200, height: 200 }]} />

      {/* Logo */}
      <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOpacity, alignItems: "center" }}>
        <LinearGradient
          colors={[Colors.violet, Colors.blue, Colors.cyan]}
          style={spl.logoWrap}
        >
          <Text style={spl.logoIcon}>✨</Text>
        </LinearGradient>
      </Animated.View>

      {/* Title */}
      <Animated.View style={{ opacity: textOpacity, alignItems: "center", marginTop: 24 }}>
        <Text style={spl.title}>Your Activities</Text>
        <Text style={spl.subtitle}>Midnight Neon Productivity</Text>
        <Text style={spl.version}>v2.0</Text>
      </Animated.View>

      {/* Loading bar */}
      <View style={spl.barTrack}>
        <Animated.View style={[spl.barFill, { width: barWidth }]} />
      </View>
      <Text style={spl.loadingText}>Loading your productivity...</Text>
    </LinearGradient>
  );
}

// ══════════════════════════════════════════
//  BOTTOM TAB NAVIGATOR
// ══════════════════════════════════════════
const TAB_ICONS = {
  Home:     { icon: "🏠", label: "Home"     },
  Voice:    { icon: "🎙️", label: "Voice"    },
  Summary:  { icon: "📊", label: "Summary"  },
  Charts:   { icon: "📈", label: "Charts"   },
  Routine:  { icon: "🔁", label: "Routine"  },
  Settings: { icon: "⚙️", label: "Settings" },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor:  Colors.navBg,
          borderTopColor:   Colors.border,
          borderTopWidth:   1,
          height:           65,
          paddingBottom:    8,
          paddingTop:       6,
        },
        tabBarActiveTintColor:   Colors.cyan,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabel: TAB_ICONS[route.name]?.label || route.name,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
        tabBarIcon: ({ focused }) => {
          const item = TAB_ICONS[route.name];
          return (
            <View style={[
              nav.iconWrap,
              focused && { backgroundColor: Colors.violet + "30", borderColor: Colors.violet + "50" }
            ]}>
              <Text style={{ fontSize: 20 }}>{item?.icon}</Text>
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}     />
      <Tab.Screen name="Voice"    component={VoiceScreen}    />
      <Tab.Screen name="Summary"  component={SummaryScreen}  />
      <Tab.Screen name="Charts"   component={ChartsScreen}   />
      <Tab.Screen name="Routine"  component={RoutineScreen}  />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// ══════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { initFromStorage, setTodayRow, setConnected } = useAppStore();

  useEffect(() => {
    initFromStorage();
    initSheets();
  }, []);

  const initSheets = async () => {
    try {
      const row = await getTodayRow();
      if (row) { setTodayRow(row); setConnected(true); }
    } catch (e) {
      console.log("Init sheets error:", e);
    }
  };

  if (showSplash) {
    return (
      <SplashScreen onDone={() => setShowSplash(false)} />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <NavigationContainer
        theme={{
          colors: {
            background: Colors.bg,
            primary:    Colors.violet,
            card:       Colors.navBg,
            text:       Colors.textPrim,
            border:     Colors.border,
          },
        }}
      >
        <MainTabs />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

// Styles
const spl = StyleSheet.create({
  root:        { flex: 1, alignItems: "center", justifyContent: "center" },
  orb:         { position: "absolute", width: 250, height: 250, borderRadius: 125 },
  logoWrap:    { width: 100, height: 100, borderRadius: 28,
    alignItems: "center", justifyContent: "center",
    shadowColor: Colors.violet, shadowOffset: {width:0,height:12},
    shadowOpacity: 0.6, shadowRadius: 20, elevation: 20 },
  logoIcon:    { fontSize: 52 },
  title:       { fontSize: 32, fontWeight: "800", color: Colors.textPrim, letterSpacing: 1 },
  subtitle:    { fontSize: 14, color: Colors.textSec, marginTop: 6 },
  version:     { fontSize: 11, color: Colors.textMuted, marginTop: 4 },
  barTrack:    { width: W - 80, height: 4, backgroundColor: Colors.border,
    borderRadius: 4, marginTop: 50, overflow: "hidden" },
  barFill:     { height: "100%", borderRadius: 4,
    backgroundColor: Colors.cyan },
  loadingText: { color: Colors.textMuted, fontSize: 12, marginTop: 12 },
});

const nav = StyleSheet.create({
  iconWrap: { width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "transparent" },
});
