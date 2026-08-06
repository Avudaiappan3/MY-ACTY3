import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  ScrollView, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { COLORS, SPACING, RADIUS, CATEGORIES, PAYMENT_METHODS } from '../theme';
import { parseExpense } from '../services/parser';
import { saveExpense, getSettings } from '../services/storage';

// ── Waveform animation ────────────────────────────────────────────────────────
function Waveform({ isListening }) {
  const bars = useRef([...Array(20)].map(() => new Animated.Value(0.15))).current;

  useEffect(() => {
    if (isListening) {
      const anims = bars.map((bar, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 40),
            Animated.timing(bar, { toValue: 0.2 + Math.random() * 0.8,
              duration: 200 + Math.random()*300, useNativeDriver: true }),
            Animated.timing(bar, { toValue: 0.1 + Math.random() * 0.3,
              duration: 200 + Math.random()*300, useNativeDriver: true }),
          ])
        )
      );
      Animated.parallel(anims).start();
    } else {
      bars.forEach(bar =>
        Animated.timing(bar, { toValue: 0.15, duration: 300,
          useNativeDriver: true }).start()
      );
    }
  }, [isListening]);

  return (
    <View style={styles.waveform}>
      {bars.map((bar, i) => (
        <Animated.View key={i} style={[styles.waveBar, {
          transform: [{ scaleY: bar }],
          backgroundColor: isListening
            ? i % 3 === 0 ? COLORS.cyan : i % 3 === 1 ? COLORS.purple : COLORS.pink
            : COLORS.border,
        }]} />
      ))}
    </View>
  );
}

// ── Mic button ────────────────────────────────────────────────────────────────
function MicButton({ isListening, onPress }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const ring  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.00, duration: 600, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(ring, { toValue: 1.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(ring, { toValue: 1.0, duration: 0,    useNativeDriver: true }),
      ])).start();
    } else {
      pulse.setValue(1); ring.setValue(1);
    }
  }, [isListening]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      {isListening && (
        <Animated.View style={[styles.ring, {
          transform: [{ scale: ring }],
          opacity: ring.interpolate({ inputRange:[1,1.4], outputRange:[0.4,0] }),
        }]} />
      )}
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <LinearGradient
          colors={isListening ? COLORS.gradPink : COLORS.gradCyan}
          style={styles.micBtn}
        >
          <Text style={styles.micEmoji}>{isListening ? '⏹️' : '🎙️'}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Category picker ───────────────────────────────────────────────────────────
function CategoryPicker({ selected, onSelect }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      style={{ marginBottom: SPACING.md }}>
      {CATEGORIES.map(cat => {
        const active = selected === cat.key;
        return (
          <TouchableOpacity key={cat.key} onPress={() => onSelect(cat.key)}
            style={[styles.catChip, { borderColor: active ? cat.color : COLORS.border,
              backgroundColor: active ? cat.color + '22' : 'transparent' }]}>
            <Text style={{ fontSize: 16 }}>{cat.emoji}</Text>
            <Text style={[styles.catChipLabel, { color: active ? cat.color : COLORS.textSub }]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ── Payment picker ────────────────────────────────────────────────────────────
function PaymentPicker({ selected, onSelect }) {
  return (
    <View style={styles.payRow}>
      {PAYMENT_METHODS.map(pm => {
        const active = selected === pm.label;
        return (
          <TouchableOpacity key={pm.key} onPress={() => onSelect(pm.label)}
            style={[styles.payChip, { borderColor: active ? COLORS.cyan : COLORS.border,
              backgroundColor: active ? COLORS.cyan + '22' : 'transparent' }]}>
            <Text>{pm.emoji}</Text>
            <Text style={[styles.payLabel, { color: active ? COLORS.cyan : COLORS.textSub }]}>
              {pm.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Confirm card ──────────────────────────────────────────────────────────────
function ConfirmCard({ parsed, onConfirm, onEdit, onCancel }) {
  const cat = CATEGORIES.find(c => c.key === parsed.category);
  const slideY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 80 }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.confirmCard,
      { transform: [{ translateY: slideY }], opacity,
        borderColor: cat?.color + '60' || COLORS.cyan }]}>
      <Text style={styles.confirmTitle}>🎯 Detected Expense</Text>
      <View style={styles.confirmRow}>
        <Text style={styles.confirmEmoji}>{cat?.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.confirmCat, { color: cat?.color }]}>{cat?.label}</Text>
          {parsed.note ? <Text style={styles.confirmNote}>{parsed.note}</Text> : null}
        </View>
        <Text style={styles.confirmAmt}>₹{parsed.amount.toLocaleString()}</Text>
      </View>
      <View style={styles.confirmMeta}>
        <Text style={styles.confirmMetaText}>💳 {parsed.payment}</Text>
        <Text style={[styles.confirmMetaText, { color: COLORS.green }]}>
          {parsed.confidence}% confident
        </Text>
      </View>
      <View style={styles.confirmBtns}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={{ color: COLORS.textSub, fontWeight:'700' }}>✕ Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
          <Text style={{ color: COLORS.gold, fontWeight:'700' }}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onConfirm} style={{ flex: 1 }}>
          <LinearGradient colors={COLORS.gradGreen} style={styles.saveBtn}>
            <Text style={{ color: COLORS.bg, fontWeight:'900', fontSize: 15 }}>✓ Save</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ── Main VoiceScreen ──────────────────────────────────────────────────────────
export default function VoiceScreen() {
  const [isListening,  setIsListening]  = useState(false);
  const [status,       setStatus]       = useState('Tap mic to speak');
  const [transcript,   setTranscript]   = useState('');
  const [parsed,       setParsed]       = useState(null);
  const [editMode,     setEditMode]     = useState(false);
  const [editAmt,      setEditAmt]      = useState('');
  const [editCat,      setEditCat]      = useState('');
  const [editPay,      setEditPay]      = useState('Cash');
  const [editNote,     setEditNote]     = useState('');
  const [savedAnim,    setSavedAnim]    = useState(false);
  const [settings,     setSettings]     = useState({});
  const [textInput,    setTextInput]    = useState('');

  useEffect(() => {
    getSettings().then(setSettings);
    // Request mic permission
    ExpoSpeechRecognitionModule.requestPermissionsAsync();
  }, []);

  // ── Speech recognition events ─────────────────────────────────────────────
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    setStatus('🎙️ Listening... speak now');
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript || '';
    if (text) {
      setTranscript(text);
      setStatus('🤖 Processing...');
      processText(text);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false);
    setStatus('❌ Could not hear — try again or type below');
  });

  // ── Start/stop listening ──────────────────────────────────────────────────
  const toggleListen = async () => {
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      setIsListening(false);
    } else {
      setParsed(null);
      setTranscript('');
      setStatus('🎙️ Starting...');
      ExpoSpeechRecognitionModule.start({
        lang: 'en-IN',
        interimResults: true,
        maxAlternatives: 1,
      });
      if (settings.haptics !== false) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  // ── Process text ──────────────────────────────────────────────────────────
  const processText = (text) => {
    if (!text.trim()) return;
    const result = parseExpense(text);
    if (result) {
      setParsed(result);
      setStatus('✅ Expense detected!');
      setEditAmt(String(result.amount));
      setEditCat(result.category);
      setEditPay(result.payment);
      setEditNote(result.note || '');
      if (settings.haptics !== false) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      setStatus('❌ Not detected. Try: "food 50" or "transport 30 upi"');
    }
  };

  // ── Save expense ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    const finalParsed = editMode
      ? { ...parsed, amount: parseInt(editAmt)||0, category: editCat,
          payment: editPay, note: editNote,
          categoryLabel: CATEGORIES.find(c=>c.key===editCat)?.label,
          categoryEmoji: CATEGORIES.find(c=>c.key===editCat)?.emoji,
          categoryColor: CATEGORIES.find(c=>c.key===editCat)?.color }
      : parsed;

    if (!finalParsed || !finalParsed.amount) {
      Alert.alert('Invalid', 'Please enter a valid amount.');
      return;
    }

    await saveExpense(finalParsed);

    if (settings.voiceConfirm !== false) {
      const cat = CATEGORIES.find(c => c.key === finalParsed.category);
      Speech.speak(
        `Saved ${finalParsed.amount} rupees for ${cat?.label || finalParsed.category}`,
        { language: 'en-IN', rate: 0.9 }
      );
    }

    setSavedAnim(true);
    setTimeout(() => {
      setSavedAnim(false);
      setParsed(null);
      setTranscript('');
      setTextInput('');
      setEditMode(false);
      setStatus('Tap mic to speak');
    }, 2000);

    if (settings.haptics !== false) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <LinearGradient colors={[COLORS.bg, '#050510']} style={styles.root}>
      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Voice Expense</Text>
        <Text style={styles.subtitle}>Speak or type your expense</Text>

        {/* Waveform */}
        <View style={styles.waveContainer}>
          <Waveform isListening={isListening} />
        </View>

        {/* Mic button */}
        <View style={styles.micContainer}>
          <MicButton isListening={isListening} onPress={toggleListen} />
        </View>

        {/* Status */}
        <Text style={styles.status}>{status}</Text>

        {/* Saved success */}
        {savedAnim && (
          <View style={styles.savedBanner}>
            <Text style={styles.savedText}>✅ Expense Saved!</Text>
          </View>
        )}

        {/* Transcript */}
        {transcript ? (
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptLabel}>HEARD:</Text>
            <Text style={styles.transcriptText}>"{transcript}"</Text>
          </View>
        ) : null}

        {/* Confirm card */}
        {parsed && !editMode && !savedAnim && (
          <ConfirmCard
            parsed={parsed}
            onConfirm={handleSave}
            onEdit={() => setEditMode(true)}
            onCancel={() => { setParsed(null); setStatus('Tap mic to speak'); }}
          />
        )}

        {/* Edit mode */}
        {editMode && (
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>✏️ Edit Expense</Text>
            <Text style={styles.editLabel}>AMOUNT (₹)</Text>
            <TextInput
              style={styles.editInput}
              value={editAmt}
              onChangeText={setEditAmt}
              keyboardType="numeric"
              placeholder="Enter amount"
              placeholderTextColor={COLORS.textMuted}
            />
            <Text style={styles.editLabel}>CATEGORY</Text>
            <CategoryPicker selected={editCat} onSelect={setEditCat} />
            <Text style={styles.editLabel}>PAYMENT METHOD</Text>
            <PaymentPicker selected={editPay} onSelect={setEditPay} />
            <Text style={styles.editLabel}>NOTE (optional)</Text>
            <TextInput
              style={styles.editInput}
              value={editNote}
              onChangeText={setEditNote}
              placeholder="e.g. petrol, fruits..."
              placeholderTextColor={COLORS.textMuted}
            />
            <View style={{ flexDirection:'row', gap: SPACING.sm, marginTop: SPACING.md }}>
              <TouchableOpacity style={[styles.cancelBtn,{flex:1}]}
                onPress={() => setEditMode(false)}>
                <Text style={{ color: COLORS.textSub, fontWeight:'700', textAlign:'center' }}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 2 }} onPress={handleSave}>
                <LinearGradient colors={COLORS.gradGreen} style={styles.saveBtn}>
                  <Text style={{ color: COLORS.bg, fontWeight:'900', fontSize: 15 }}>✓ Save Expense</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Manual text input */}
        {!parsed && !editMode && (
          <View style={styles.manualBox}>
            <Text style={styles.editLabel}>OR TYPE EXPENSE</Text>
            <View style={styles.manualInputRow}>
              <TextInput
                style={[styles.editInput, { flex: 1, marginBottom: 0 }]}
                placeholder='e.g. "food 50 upi" or "transport 30"'
                placeholderTextColor={COLORS.textMuted}
                value={textInput}
                onChangeText={setTextInput}
                onSubmitEditing={() => {
                  processText(textInput);
                  setTranscript(textInput);
                }}
                returnKeyType="done"
              />
            </View>
            <Text style={styles.manualHint}>Press ↵ to detect</Text>

            {/* Quick category buttons */}
            <Text style={[styles.editLabel, { marginTop: SPACING.md }]}>QUICK ADD</Text>
            <View style={styles.quickGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity key={cat.key}
                  style={[styles.quickBtn, { borderColor: cat.color + '60' }]}
                  onPress={() => {
                    setParsed({
                      category: cat.key, categoryLabel: cat.label,
                      categoryEmoji: cat.emoji, categoryColor: cat.color,
                      amount: 0, payment: 'Cash', note: '', confidence: 100,
                    });
                    setEditAmt('');
                    setEditCat(cat.key);
                    setEditPay('Cash');
                    setEditNote('');
                    setEditMode(true);
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{cat.emoji}</Text>
                  <Text style={[styles.quickLabel, { color: cat.color }]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  scroll:       { flex: 1, paddingHorizontal: SPACING.md },
  title:        { fontSize: 28, fontWeight: '900', color: COLORS.text,
                  marginTop: 56, marginBottom: 4 },
  subtitle:     { fontSize: 14, color: COLORS.textSub, marginBottom: SPACING.lg },
  waveContainer:{ height: 80, justifyContent:'center', marginBottom: SPACING.md },
  waveform:     { flexDirection:'row', alignItems:'center', justifyContent:'center',
                  height: 60, gap: 3 },
  waveBar:      { width: 4, height: 50, borderRadius: 2 },
  micContainer: { alignItems:'center', marginVertical: SPACING.lg },
  ring:         { position:'absolute', width: 120, height: 120, borderRadius: 60,
                  borderWidth: 2, borderColor: COLORS.pink, top: -8, left: -8 },
  micBtn:       { width: 104, height: 104, borderRadius: 52, alignItems:'center',
                  justifyContent:'center', elevation: 12 },
  micEmoji:     { fontSize: 40 },
  status:       { textAlign:'center', fontSize: 15, color: COLORS.textSub,
                  marginBottom: SPACING.md },
  savedBanner:  { backgroundColor: COLORS.green + '22', borderRadius: RADIUS.md,
                  padding: SPACING.md, alignItems:'center', marginBottom: SPACING.md,
                  borderWidth: 1, borderColor: COLORS.green },
  savedText:    { color: COLORS.green, fontSize: 18, fontWeight: '800' },
  transcriptBox:{ backgroundColor: COLORS.surfaceHigh, borderRadius: RADIUS.md,
                  padding: SPACING.md, marginBottom: SPACING.md },
  transcriptLabel:{ fontSize: 10, color: COLORS.textMuted, letterSpacing: 1.5 },
  transcriptText: { fontSize: 16, color: COLORS.cyan, fontStyle:'italic', marginTop: 4 },
  confirmCard:  { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
                  borderWidth: 1, padding: SPACING.md, marginBottom: SPACING.md },
  confirmTitle: { fontSize: 12, color: COLORS.textSub, letterSpacing: 1,
                  marginBottom: SPACING.md },
  confirmRow:   { flexDirection:'row', alignItems:'center', marginBottom: SPACING.md },
  confirmEmoji: { fontSize: 32, marginRight: SPACING.md },
  confirmCat:   { fontSize: 18, fontWeight: '800' },
  confirmNote:  { fontSize: 13, color: COLORS.textSub, marginTop: 2 },
  confirmAmt:   { fontSize: 28, fontWeight: '900', color: COLORS.gold },
  confirmMeta:  { flexDirection:'row', justifyContent:'space-between',
                  marginBottom: SPACING.md },
  confirmMetaText:{ fontSize: 13, color: COLORS.textSub },
  confirmBtns:  { flexDirection:'row', gap: SPACING.sm },
  cancelBtn:    { borderRadius: RADIUS.md, borderWidth:1, borderColor: COLORS.border,
                  paddingVertical: 12, paddingHorizontal: SPACING.md,
                  alignItems:'center', justifyContent:'center' },
  editBtn:      { borderRadius: RADIUS.md, borderWidth:1, borderColor: COLORS.gold+'60',
                  paddingVertical: 12, paddingHorizontal: SPACING.md,
                  alignItems:'center', justifyContent:'center' },
  saveBtn:      { borderRadius: RADIUS.md, paddingVertical: 14, alignItems:'center' },
  editCard:     { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
                  borderWidth:1, borderColor: COLORS.purple+'40',
                  padding: SPACING.md, marginBottom: SPACING.md },
  editTitle:    { fontSize: 16, fontWeight: '800', color: COLORS.text,
                  marginBottom: SPACING.md },
  editLabel:    { fontSize: 10, color: COLORS.textMuted, letterSpacing: 1.5,
                  marginBottom: SPACING.xs, marginTop: SPACING.sm },
  editInput:    { backgroundColor: COLORS.surfaceHigh, borderRadius: RADIUS.md,
                  borderWidth:1, borderColor: COLORS.border, color: COLORS.text,
                  padding: SPACING.md, fontSize: 15, marginBottom: SPACING.sm },
  catChip:      { flexDirection:'row', alignItems:'center', gap: SPACING.xs,
                  borderRadius: RADIUS.full, borderWidth:1, paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.xs, marginRight: SPACING.sm },
  catChipLabel: { fontSize: 12, fontWeight: '600' },
  payRow:       { flexDirection:'row', gap: SPACING.sm, flexWrap:'wrap' },
  payChip:      { flexDirection:'row', alignItems:'center', gap: 4,
                  borderRadius: RADIUS.md, borderWidth:1, paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.sm },
  payLabel:     { fontSize: 12, fontWeight: '600' },
  manualBox:    { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
                  borderWidth:1, borderColor: COLORS.border,
                  padding: SPACING.md, marginBottom: SPACING.xl },
  manualInputRow:{ flexDirection:'row', gap: SPACING.sm },
  manualHint:   { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  quickGrid:    { flexDirection:'row', flexWrap:'wrap', gap: SPACING.sm },
  quickBtn:     { width: '30%', alignItems:'center', borderRadius: RADIUS.md,
                  borderWidth:1, paddingVertical: SPACING.md,
                  backgroundColor: COLORS.surfaceHigh },
  quickLabel:   { fontSize: 11, fontWeight: '700', marginTop: 4, textAlign:'center' },
});
