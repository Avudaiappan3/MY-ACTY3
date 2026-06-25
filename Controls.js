// src/components/Controls.js — All Custom Input Controls

import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, ScrollView, Switch, Modal,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Slider from "@react-native-community/slider";
import { Colors, Typography, Spacing, Radius } from "../utils/colors";

// ══════════════════════════════════════════
//  TIME PICKER
// ══════════════════════════════════════════
export const TimePicker = ({ value, onChange, label }) => {
  const [hour,   setHour]   = useState(value ? parseInt(value.split(":")[0]) : 6);
  const [minute, setMinute] = useState(value ? parseInt(value.split(":")[1]) : 0);
  const [isPM,   setIsPM]   = useState(hour >= 12);

  const update = (h, m, pm) => {
    const h24 = pm ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
    const str = `${String(h24).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
    onChange?.(str);
  };

  const adjHour = (d) => {
    const nh = Math.max(1, Math.min(12, hour + d));
    setHour(nh); update(nh, minute, isPM);
  };
  const adjMin = (d) => {
    const nm = (minute + d + 60) % 60;
    setMinute(nm); update(hour, nm, isPM);
  };
  const togglePM = () => {
    const np = !isPM; setIsPM(np); update(hour, minute, np);
  };

  return (
    <View style={ctrl.wrap}>
      {label && <Text style={ctrl.label}>{label}</Text>}
      <View style={ctrl.timePicker}>
        {/* Hour */}
        <View style={ctrl.timeCol}>
          <TouchableOpacity onPress={() => adjHour(1)} style={ctrl.timeBtn}>
            <Text style={ctrl.timeArrow}>▲</Text>
          </TouchableOpacity>
          <Text style={ctrl.timeVal}>{String(hour).padStart(2,"0")}</Text>
          <TouchableOpacity onPress={() => adjHour(-1)} style={ctrl.timeBtn}>
            <Text style={ctrl.timeArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <Text style={ctrl.timeSep}>:</Text>

        {/* Minute */}
        <View style={ctrl.timeCol}>
          <TouchableOpacity onPress={() => adjMin(5)} style={ctrl.timeBtn}>
            <Text style={ctrl.timeArrow}>▲</Text>
          </TouchableOpacity>
          <Text style={ctrl.timeVal}>{String(minute).padStart(2,"0")}</Text>
          <TouchableOpacity onPress={() => adjMin(-5)} style={ctrl.timeBtn}>
            <Text style={ctrl.timeArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* AM/PM */}
        <TouchableOpacity onPress={togglePM} style={ctrl.ampmBtn}>
          <Text style={ctrl.ampmText}>{isPM ? "PM" : "AM"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ══════════════════════════════════════════
//  WATER COUNTER (8 glass icons)
// ══════════════════════════════════════════
export const WaterCounter = ({ value = 0, onChange, label }) => {
  const glasses = 8;
  return (
    <View style={ctrl.wrap}>
      {label && <Text style={ctrl.label}>{label}</Text>}
      <View style={ctrl.waterRow}>
        {Array.from({ length: glasses }).map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onChange?.(i < value ? i : i + 1)}
            style={ctrl.glassWrap}
          >
            <Text style={{ fontSize: 28, opacity: i < value ? 1 : 0.25 }}>💧</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={ctrl.waterCount}>{value} / {glasses} glasses</Text>
    </View>
  );
};

// ══════════════════════════════════════════
//  NUMBER SPINNER
// ══════════════════════════════════════════
export const NumberSpinner = ({
  value = 0, onChange, label, min = 0, max = 500, step = 1, suffix = ""
}) => {
  const dec = () => onChange?.(Math.max(min, value - step));
  const inc = () => onChange?.(Math.min(max, value + step));

  return (
    <View style={ctrl.wrap}>
      {label && <Text style={ctrl.label}>{label}</Text>}
      <View style={ctrl.spinner}>
        <TouchableOpacity onPress={dec} style={ctrl.spinBtn}>
          <Text style={ctrl.spinArrow}>−</Text>
        </TouchableOpacity>
        <TextInput
          style={ctrl.spinVal}
          value={String(value)}
          onChangeText={(t) => {
            const n = parseInt(t) || 0;
            onChange?.(Math.max(min, Math.min(max, n)));
          }}
          keyboardType="numeric"
          selectTextOnFocus
        />
        {suffix ? <Text style={ctrl.spinSuffix}>{suffix}</Text> : null}
        <TouchableOpacity onPress={inc} style={ctrl.spinBtn}>
          <Text style={ctrl.spinArrow}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ══════════════════════════════════════════
//  MOOD SELECTOR (5 emoji)
// ══════════════════════════════════════════
export const MoodSelector = ({ value, onChange, label }) => {
  const moods = [
    { emoji: "😔", label: "Bad",   val: "bad"   },
    { emoji: "😐", label: "Okay",  val: "okay"  },
    { emoji: "🙂", label: "Good",  val: "good"  },
    { emoji: "😊", label: "Happy", val: "happy" },
    { emoji: "🤩", label: "Great", val: "great" },
  ];

  return (
    <View style={ctrl.wrap}>
      {label && <Text style={ctrl.label}>{label}</Text>}
      <View style={ctrl.moodRow}>
        {moods.map((m) => (
          <TouchableOpacity
            key={m.val}
            onPress={() => onChange?.(m.val)}
            style={[
              ctrl.moodBtn,
              value === m.val && { borderColor: Colors.cyan, backgroundColor: Colors.cyan + "20" }
            ]}
          >
            <Text style={ctrl.moodEmoji}>{m.emoji}</Text>
            <Text style={[ctrl.moodLabel, value === m.val && { color: Colors.cyan }]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ══════════════════════════════════════════
//  DURATION SLIDER
// ══════════════════════════════════════════
export const DurationSlider = ({
  value = 0, onChange, label, min = 0, max = 12, step = 0.5,
  unit = "hrs", warnAt, warnMsg
}) => {
  const isWarn = warnAt && value >= warnAt;

  return (
    <View style={ctrl.wrap}>
      {label && (
        <View style={ctrl.sliderTop}>
          <Text style={ctrl.label}>{label}</Text>
          <Text style={[ctrl.sliderVal, isWarn && { color: Colors.warning }]}>
            {value} {unit}
          </Text>
        </View>
      )}
      <Slider
        style={ctrl.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={isWarn ? Colors.warning : Colors.violet}
        maximumTrackTintColor={Colors.border}
        thumbTintColor={isWarn ? Colors.warning : Colors.cyan}
      />
      <View style={ctrl.sliderLabels}>
        <Text style={ctrl.sliderMinMax}>{min}{unit}</Text>
        <Text style={ctrl.sliderMinMax}>{max}{unit}</Text>
      </View>
      {isWarn && warnMsg && (
        <Text style={ctrl.warnText}>⚠️ {warnMsg}</Text>
      )}
    </View>
  );
};

// ══════════════════════════════════════════
//  POMODORO COUNTER
// ══════════════════════════════════════════
export const PomodoroCounter = ({ value = 0, onChange, label, max = 12 }) => (
  <View style={ctrl.wrap}>
    {label && <Text style={ctrl.label}>{label}</Text>}
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={ctrl.pomodoroRow}>
        {Array.from({ length: max }).map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onChange?.(i < value ? i : i + 1)}
          >
            <Text style={{ fontSize: 26, opacity: i < value ? 1 : 0.2, marginHorizontal: 3 }}>
              🍅
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
    <Text style={ctrl.pomodoroCount}>
      {value} sessions = {value * 25} minutes
    </Text>
  </View>
);

// ══════════════════════════════════════════
//  TAG INPUT (topics, activities)
// ══════════════════════════════════════════
export const TagInput = ({ value = [], onChange, label, placeholder }) => {
  const [text, setText] = useState("");

  const addTag = () => {
    const t = text.trim();
    if (t && !value.includes(t)) {
      onChange?.([...value, t]);
    }
    setText("");
  };

  const removeTag = (tag) => onChange?.(value.filter(v => v !== tag));

  return (
    <View style={ctrl.wrap}>
      {label && <Text style={ctrl.label}>{label}</Text>}
      <View style={ctrl.tagInputRow}>
        <TextInput
          style={ctrl.tagInput}
          value={text}
          onChangeText={setText}
          placeholder={placeholder || "Type and press +"}
          placeholderTextColor={Colors.textMuted}
          onSubmitEditing={addTag}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={addTag} style={ctrl.tagAddBtn}>
          <Text style={ctrl.tagAddText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={ctrl.tagChips}>
        {value.map((tag) => (
          <View key={tag} style={ctrl.tagChip}>
            <Text style={ctrl.tagChipText}>{tag}</Text>
            <TouchableOpacity onPress={() => removeTag(tag)}>
              <Text style={ctrl.tagChipX}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

// ══════════════════════════════════════════
//  DROPDOWN SELECTOR
// ══════════════════════════════════════════
export const DropdownSelector = ({ value, onChange, label, options = [] }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={ctrl.wrap}>
      {label && <Text style={ctrl.label}>{label}</Text>}
      <TouchableOpacity
        style={ctrl.dropdownBtn}
        onPress={() => setOpen(true)}
      >
        <Text style={ctrl.dropdownVal}>{value || "Select..."}</Text>
        <Text style={ctrl.dropdownArrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={ctrl.modalOverlay}
          onPress={() => setOpen(false)}
        >
          <View style={ctrl.modalBox}>
            <Text style={ctrl.modalTitle}>{label}</Text>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[ctrl.modalOpt, value === opt && ctrl.modalOptActive]}
                onPress={() => { onChange?.(opt); setOpen(false); }}
              >
                <Text style={[
                  ctrl.modalOptText,
                  value === opt && { color: Colors.cyan }
                ]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ══════════════════════════════════════════
//  TOGGLE SWITCH
// ══════════════════════════════════════════
export const ToggleSwitch = ({ value, onChange, label, desc }) => (
  <View style={ctrl.toggleRow}>
    <View style={{ flex: 1 }}>
      {label && <Text style={ctrl.label}>{label}</Text>}
      {desc  && <Text style={ctrl.toggleDesc}>{desc}</Text>}
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: Colors.border, true: Colors.violet }}
      thumbColor={value ? Colors.cyan : Colors.textSec}
      ios_backgroundColor={Colors.border}
    />
  </View>
);

// ══════════════════════════════════════════
//  MULTI-LINE TEXT INPUT
// ══════════════════════════════════════════
export const MultiLineInput = ({ value, onChange, label, placeholder, lines = 4 }) => (
  <View style={ctrl.wrap}>
    {label && <Text style={ctrl.label}>{label}</Text>}
    <TextInput
      style={[ctrl.multiInput, { height: lines * 24 + 24 }]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={Colors.textMuted}
      multiline
      numberOfLines={lines}
      textAlignVertical="top"
    />
  </View>
);

// ══════════════════════════════════════════
//  DURATION PRESET BUTTONS
// ══════════════════════════════════════════
export const DurationPresets = ({ value, onChange, label, presets, unit = "min" }) => (
  <View style={ctrl.wrap}>
    {label && <Text style={ctrl.label}>{label}</Text>}
    <View style={ctrl.presetRow}>
      {presets.map((p) => (
        <TouchableOpacity
          key={p}
          onPress={() => onChange?.(p)}
          style={[ctrl.presetBtn, value === p && ctrl.presetActive]}
        >
          <Text style={[ctrl.presetText, value === p && { color: Colors.cyan }]}>
            {p}{unit}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ══════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════
const ctrl = StyleSheet.create({
  wrap:    { marginBottom: Spacing.md },
  label:   { fontSize: 13, fontWeight: "600", color: Colors.textSec, marginBottom: 8 },

  // Time
  timePicker: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card,
    borderRadius: Radius.md, padding: 12, borderWidth: 1, borderColor: Colors.border },
  timeCol:    { alignItems: "center", flex: 1 },
  timeBtn:    { padding: 8 },
  timeArrow:  { color: Colors.cyan, fontSize: 16 },
  timeVal:    { fontSize: 32, fontWeight: "700", color: Colors.textPrim, width: 60, textAlign: "center" },
  timeSep:    { fontSize: 28, color: Colors.textSec, marginHorizontal: 8 },
  ampmBtn:    { backgroundColor: Colors.violet, borderRadius: Radius.md,
    paddingHorizontal: 14, paddingVertical: 10, marginLeft: 12 },
  ampmText:   { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Water
  waterRow:   { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  glassWrap:  { padding: 4 },
  waterCount: { color: Colors.textSec, fontSize: 12, marginTop: 6 },

  // Spinner
  spinner:    { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, overflow: "hidden" },
  spinBtn:    { backgroundColor: Colors.violet, paddingHorizontal: 20, paddingVertical: 14,
    alignItems: "center", justifyContent: "center" },
  spinArrow:  { color: "#fff", fontSize: 22, fontWeight: "700" },
  spinVal:    { flex: 1, textAlign: "center", fontSize: 24, fontWeight: "700",
    color: Colors.textPrim },
  spinSuffix: { color: Colors.textSec, fontSize: 13, marginRight: 10 },

  // Mood
  moodRow:    { flexDirection: "row", justifyContent: "space-between" },
  moodBtn:    { alignItems: "center", padding: 10, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, flex: 1, marginHorizontal: 3 },
  moodEmoji:  { fontSize: 28 },
  moodLabel:  { fontSize: 10, color: Colors.textSec, marginTop: 4 },

  // Slider
  sliderTop:    { flexDirection: "row", justifyContent: "space-between" },
  sliderVal:    { fontSize: 14, fontWeight: "700", color: Colors.cyan },
  slider:       { width: "100%", height: 40 },
  sliderLabels: { flexDirection: "row", justifyContent: "space-between" },
  sliderMinMax: { fontSize: 11, color: Colors.textMuted },
  warnText:     { color: Colors.warning, fontSize: 12, marginTop: 4 },

  // Pomodoro
  pomodoroRow:   { flexDirection: "row", flexWrap: "wrap" },
  pomodoroCount: { color: Colors.textSec, fontSize: 12, marginTop: 6 },

  // Tag input
  tagInputRow: { flexDirection: "row", gap: 8 },
  tagInput:    { flex: 1, backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, padding: 12,
    color: Colors.textPrim, fontSize: 13 },
  tagAddBtn:   { backgroundColor: Colors.violet, borderRadius: Radius.md,
    width: 46, alignItems: "center", justifyContent: "center" },
  tagAddText:  { color: "#fff", fontSize: 22, fontWeight: "700" },
  tagChips:    { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  tagChip:     { flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: Colors.violet + "30", borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.violet + "60" },
  tagChipText: { color: Colors.cyan, fontSize: 12 },
  tagChipX:    { color: Colors.textSec, fontSize: 12 },

  // Dropdown
  dropdownBtn:  { flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, padding: 14 },
  dropdownVal:  { color: Colors.textPrim, fontSize: 14 },
  dropdownArrow:{ color: Colors.textSec, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center", alignItems: "center" },
  modalBox:     { backgroundColor: Colors.cardHover, borderRadius: Radius.lg,
    width: "80%", padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  modalTitle:   { fontSize: 15, fontWeight: "700", color: Colors.textPrim,
    marginBottom: 12, textAlign: "center" },
  modalOpt:     { padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalOptActive:{ backgroundColor: Colors.violet + "20" },
  modalOptText: { color: Colors.textPrim, fontSize: 14 },

  // Toggle
  toggleRow:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 10 },
  toggleDesc:  { fontSize: 11, color: Colors.textMuted, marginTop: 2 },

  // Multi-line
  multiInput: { backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, padding: 12,
    color: Colors.textPrim, fontSize: 13 },

  // Presets
  presetRow:    { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  presetBtn:    { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  presetActive: { borderColor: Colors.cyan, backgroundColor: Colors.cyan + "20" },
  presetText:   { color: Colors.textSec, fontSize: 13 },
});
