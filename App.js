import React, { useEffect, useRef } from 'react';
import { StatusBar, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, View } from 'react-native';

import HomeScreen      from './src/screens/HomeScreen';
import VoiceScreen     from './src/screens/VoiceScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import HistoryScreen   from './src/screens/HistoryScreen';
import SettingsScreen  from './src/screens/SettingsScreen';
import { COLORS }      from './src/theme';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, label, focused }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.2 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{
      alignItems: 'center',
      transform: [{ scale }],
    }}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={{
        fontSize: 10,
        color: focused ? COLORS.cyan : COLORS.textMuted,
        fontWeight: focused ? '700' : '400',
        marginTop: 2,
      }}>{label}</Text>
    </Animated.View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: COLORS.surface,
                borderTopColor: COLORS.border,
                borderTopWidth: 1,
                height: 70,
                paddingBottom: 8,
                paddingTop: 6,
                elevation: 20,
                shadowColor: COLORS.cyan,
                shadowOpacity: 0.15,
                shadowRadius: 10,
              },
              tabBarShowLabel: false,
            }}
          >
            <Tab.Screen name="Home" component={HomeScreen}
              options={{ tabBarIcon: ({ focused }) =>
                <TabIcon emoji="🏠" label="Home" focused={focused} /> }} />
            <Tab.Screen name="Voice" component={VoiceScreen}
              options={{ tabBarIcon: ({ focused }) =>
                <TabIcon emoji="🎙️" label="Voice" focused={focused} /> }} />
            <Tab.Screen name="Analytics" component={AnalyticsScreen}
              options={{ tabBarIcon: ({ focused }) =>
                <TabIcon emoji="📊" label="Charts" focused={focused} /> }} />
            <Tab.Screen name="History" component={HistoryScreen}
              options={{ tabBarIcon: ({ focused }) =>
                <TabIcon emoji="📋" label="History" focused={focused} /> }} />
            <Tab.Screen name="Settings" component={SettingsScreen}
              options={{ tabBarIcon: ({ focused }) =>
                <TabIcon emoji="⚙️" label="Settings" focused={focused} /> }} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
