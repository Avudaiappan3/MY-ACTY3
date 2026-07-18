import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, CATEGORIES } from '../theme';
import { getSettings, saveSettings, getBudgets, saveBudgets, clearAll } from '../services/storage';

function Row({ label, sub, children }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState({});
  const [budgets,  setBudgets]  = useState({});

  useEffect(() => {
    getSettings().then(setSettings);
    getBudgets().then(setBudgets);
  }, []);

  const updateSetting = async (key, val) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    await saveSettings(updated);
  };

  const updateBudget = async (key, val) => {
    const updated = { ...budgets, [key]: parseInt(val) || 0 };
    setBudgets(updated);
    await saveBudgets(updated);
  };

  const handleClearAll = () => {
    Alert.alert('Clear All Data', 'This will delete ALL expenses. Cannot undo!', [
      { text: 'Cancel' },
      { text: 'Delete All', style: 'destructive', onPress: async () => {
        await clearAll();
        Alert.alert('Done', 'All data cleared.');
      }},
    ]);
  };

  return (
    <LinearGradient colors={[COLORS.bg, '#050510']} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: SPACING.md }} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        <Section title="👤 Profile">
          <Row label="Your Name">
            <TextInput
              style={styles.input}
              value={settings.name || ''}
              onChangeText={v => updateSetting('name', v)}
              placeholder="Your name"
              placeholderTextColor={COLORS.textMuted}
            />
          </Row>
          <Row label="Currency" sub="Default: ₹ (Indian Rupee)">
            <TextInput
              style={[styles.input, { width: 60, textAlign: 'center' }]}
              value={settings.currency || '₹'}
              onChangeText={v => updateSetting('currency', v)}
              maxLength={3}
            />
          </Row>
        </Section>

        <Section title="🎙️ Voice">
          <Row label="Voice Confirmation" sub="Speaks back saved expense">
            <Switch value={settings.voiceConfirm !== false}
              onValueChange={v => updateSetting('voiceConfirm', v)}
              trackColor={{ true: COLORS.cyan }} thumbColor={COLORS.text} />
          </Row>
          <Row label="Quick Save" sub="Save without confirmation step">
            <Switch value={!!settings.quickSave}
              onValueChange={v => updateSetting('quickSave', v)}
              trackColor={{ true: COLORS.cyan }} thumbColor={COLORS.text} />
          </Row>
          <Row label="Haptic Feedback">
            <Switch value={settings.haptics !== false}
              onValueChange={v => updateSetting('haptics', v)}
              trackColor={{ true: COLORS.cyan }} thumbColor={COLORS.text} />
          </Row>
        </Section>

        <Section title="🔔 Notifications">
          <Row label="Daily Reminder" sub="Remind to log expenses">
            <Switch value={!!settings.dailyReminder}
              onValueChange={v => updateSetting('dailyReminder', v)}
              trackColor={{ true: COLORS.purple }} thumbColor={COLORS.text} />
          </Row>
          <Row label="Reminder Time" sub="24h format (e.g. 21:00)">
            <TextInput
              style={[styles.input, { width: 80, textAlign: 'center' }]}
              value={settings.reminderTime || '21:00'}
              onChangeText={v => updateSetting('reminderTime', v)}
              maxLength={5}
            />
          </Row>
        </Section>

        <Section title="💰 Monthly Budgets (₹)">
          {CATEGORIES.map(cat => (
            <Row key={cat.key} label={`${cat.emoji} ${cat.label}`}>
              <TextInput
                style={[styles.input, { width: 90, textAlign: 'center', color: cat.color }]}
                value={String(budgets[cat.key] || 0)}
                onChangeText={v => updateBudget(cat.key, v)}
                keyboardType="numeric"
              />
            </Row>
          ))}
          <Row label="📅 Total Monthly Budget">
            <TextInput
              style={[styles.input, { width: 90, textAlign: 'center', color: COLORS.gold }]}
              value={String(budgets.monthly || 2500)}
              onChangeText={v => updateBudget('monthly', v)}
              keyboardType="numeric"
            />
          </Row>
        </Section>

        <Section title="☁️ Google Sheets Sync">
          <Row label="Enable Sync" sub="Real-time cloud backup">
            <Switch value={!!settings.sheetsSync}
              onValueChange={v => updateSetting('sheetsSync', v)}
              trackColor={{ true: COLORS.green }} thumbColor={COLORS.text} />
          </Row>
          {settings.sheetsSync && (
            <Row label="Sheet ID">
              <TextInput
                style={[styles.input, { width: 160 }]}
                value={settings.sheetsId || ''}
                onChangeText={v => updateSetting('sheetsId', v)}
                placeholder="Google Sheet ID"
                placeholderTextColor={COLORS.textMuted}
              />
            </Row>
          )}
        </Section>

        <Section title="⚠️ Danger Zone">
          <TouchableOpacity style={styles.dangerBtn} onPress={handleClearAll}>
            <Text style={styles.dangerText}>🗑️  Clear All Data</Text>
          </TouchableOpacity>
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  title:        { fontSize: 28, fontWeight: '900', color: COLORS.text, marginTop: 56, marginBottom: SPACING.lg },
  section:      { marginBottom: SPACING.md },
  sectionTitle: { fontSize: 12, color: COLORS.textMuted, letterSpacing: 1.5, fontWeight: '700',
                  marginBottom: SPACING.xs, paddingLeft: SPACING.xs },
  sectionCard:  { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
                  borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  row:          { flexDirection: 'row', alignItems: 'center', padding: SPACING.md,
                  borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowLabel:     { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  rowSub:       { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  input:        { backgroundColor: COLORS.surfaceHigh, borderRadius: RADIUS.sm,
                  borderWidth: 1, borderColor: COLORS.border, color: COLORS.text,
                  paddingHorizontal: SPACING.sm, paddingVertical: 6, fontSize: 13 },
  dangerBtn:    { margin: SPACING.md, backgroundColor: COLORS.pink + '22',
                  borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.pink + '60',
                  padding: SPACING.md, alignItems: 'center' },
  dangerText:   { color: COLORS.pink, fontWeight: '800', fontSize: 15 },
});
