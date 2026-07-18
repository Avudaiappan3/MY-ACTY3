import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { COLORS, SPACING, RADIUS, SHADOW, CATEGORIES } from '../theme';
import {
  getTodaySummary, getMonthSummary, getBudgets,
  getStreak, getTodayExpenses, getSettings,
} from '../services/storage';

// ── Neon card ─────────────────────────────────────────────────────────────────
function NeonCard({ children, glowColor = COLORS.cyan, style }) {
  return (
    <View style={[styles.card, { borderColor: glowColor + '40',
      shadowColor: glowColor }, style]}>
      {children}
    </View>
  );
}

// ── Category row ──────────────────────────────────────────────────────────────
function CategoryRow({ cat, spent, budget }) {
  const pct  = budget > 0 ? Math.min(1, spent / budget) : 0;
  const over = budget > 0 && spent > budget;
  const barW = useAnimatedWidth(pct);

  return (
    <View style={styles.catRow}>
      <Text style={styles.catEmoji}>{cat.emoji}</Text>
      <View style={styles.catMid}>
        <View style={styles.catLabelRow}>
          <Text style={styles.catLabel}>{cat.label}</Text>
          <Text style={[styles.catAmt, { color: over ? COLORS.pink : COLORS.text }]}>
            ₹{spent.toLocaleString()}
          </Text>
        </View>
        <View style={styles.barBg}>
          <Animated.View style={[styles.barFill, {
            width: barW,
            backgroundColor: over ? COLORS.pink : cat.color,
          }]} />
        </View>
        {budget > 0 && (
          <Text style={styles.budgetLabel}>
            {over ? `⚠️ Over by ₹${(spent-budget).toLocaleString()}` : `Budget: ₹${budget.toLocaleString()}`}
          </Text>
        )}
      </View>
    </View>
  );
}

function useAnimatedWidth(pct) {
  const anim = React.useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 800,
      useNativeDriver: false }).start();
  }, [pct]);
  return anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const [todaySummary,  setTodaySummary]  = useState(null);
  const [monthSummary,  setMonthSummary]  = useState(null);
  const [budgets,       setBudgets]       = useState({});
  const [streak,        setStreak]        = useState({ count: 0 });
  const [recentExpenses,setRecentExpenses]= useState([]);
  const [settings,      setSettings]      = useState({});
  const [refreshing,    setRefreshing]    = useState(false);

  const load = async () => {
    const today = format(new Date(), 'MMM-yyyy');
    const [ts, ms, bud, str, recent, sett] = await Promise.all([
      getTodaySummary(),
      getMonthSummary(today),
      getBudgets(),
      getStreak(),
      getTodayExpenses(),
      getSettings(),
    ]);
    setTodaySummary(ts);
    setMonthSummary(ms);
    setBudgets(bud);
    setStreak(str);
    setRecentExpenses(recent.slice(0, 5));
    setSettings(sett);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <LinearGradient colors={[COLORS.bg, '#050510']} style={styles.root}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}
          tintColor={COLORS.cyan} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()} 👋</Text>
            <Text style={styles.name}>{settings.name || 'Avudaiappan'}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakCount}>{streak.count}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </View>

        {/* Today Total Card */}
        <NeonCard glowColor={COLORS.cyan} style={styles.totalCard}>
          <LinearGradient colors={['#001A33', '#000D1A']} style={styles.totalGrad}>
            <Text style={styles.totalLabel}>TODAY'S SPENDING</Text>
            <Text style={styles.totalAmt}>
              ₹{(todaySummary?.total || 0).toLocaleString()}
            </Text>
            <Text style={styles.totalDate}>{format(new Date(), 'EEEE, dd MMM yyyy')}</Text>
            <TouchableOpacity
              style={styles.addVoiceBtn}
              onPress={() => navigation.navigate('Voice')}
            >
              <LinearGradient colors={COLORS.gradCyan} style={styles.addVoiceBtnInner}>
                <Text style={styles.addVoiceBtnText}>🎙️  Add Expense</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </NeonCard>

        {/* Month Summary */}
        <NeonCard glowColor={COLORS.purple} style={{ marginTop: SPACING.md }}>
          <Text style={styles.sectionTitle}>📅 July 2026 — Month Total</Text>
          <Text style={[styles.totalAmt, { fontSize: 28, color: COLORS.gold }]}>
            ₹{(monthSummary?.total || 0).toLocaleString()}
          </Text>
          <Text style={[styles.totalLabel, { marginTop: 4 }]}>
            Budget: ₹{(budgets.monthly || 2500).toLocaleString()}
            {'  '}
            {monthSummary?.total > budgets.monthly
              ? `⚠️ Over by ₹${((monthSummary?.total||0) - budgets.monthly).toLocaleString()}`
              : `✅ ₹${(budgets.monthly - (monthSummary?.total||0)).toLocaleString()} left`}
          </Text>
        </NeonCard>

        {/* Category Breakdown */}
        <NeonCard glowColor={COLORS.purple} style={{ marginTop: SPACING.md }}>
          <Text style={styles.sectionTitle}>📂 Today by Category</Text>
          {CATEGORIES.map(cat => (
            <CategoryRow
              key={cat.key}
              cat={cat}
              spent={todaySummary?.[cat.key] || 0}
              budget={budgets[cat.key] || 0}
            />
          ))}
        </NeonCard>

        {/* Recent Expenses */}
        {recentExpenses.length > 0 && (
          <NeonCard glowColor={COLORS.gold} style={{ marginTop: SPACING.md }}>
            <Text style={styles.sectionTitle}>🕐 Recent Entries</Text>
            {recentExpenses.map(exp => (
              <View key={exp.id} style={styles.recentRow}>
                <Text style={styles.recentEmoji}>
                  {CATEGORIES.find(c => c.key === exp.category)?.emoji || '💰'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentCat}>
                    {CATEGORIES.find(c => c.key === exp.category)?.label || exp.category}
                    {exp.note ? `  · ${exp.note}` : ''}
                  </Text>
                  <Text style={styles.recentTime}>
                    {exp.payment} · {format(new Date(exp.timestamp), 'hh:mm a')}
                  </Text>
                </View>
                <Text style={styles.recentAmt}>₹{Number(exp.amount).toLocaleString()}</Text>
              </View>
            ))}
          </NeonCard>
        )}

        {/* Quick tip */}
        <NeonCard glowColor={COLORS.green} style={{ marginTop: SPACING.md, marginBottom: SPACING.xl }}>
          <Text style={styles.tipText}>
            💡 Tip: Say <Text style={{ color: COLORS.cyan }}>"food 50 upi"</Text> to quickly log your expense with voice!
          </Text>
        </NeonCard>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  scroll:       { flex: 1, paddingHorizontal: SPACING.md },
  header:       { flexDirection:'row', justifyContent:'space-between',
                  alignItems:'center', paddingTop: 56, paddingBottom: SPACING.md },
  greeting:     { fontSize: 14, color: COLORS.textSub },
  name:         { fontSize: 22, fontWeight: '800', color: COLORS.text, marginTop: 2 },
  streakBadge:  { alignItems:'center', backgroundColor: COLORS.surface,
                  borderRadius: RADIUS.md, padding: SPACING.sm,
                  borderWidth: 1, borderColor: COLORS.orange + '60' },
  streakFire:   { fontSize: 20 },
  streakCount:  { fontSize: 22, fontWeight: '900', color: COLORS.orange },
  streakLabel:  { fontSize: 10, color: COLORS.textSub },

  card:         { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
                  borderWidth: 1, padding: SPACING.md,
                  shadowOffset:{width:0,height:0}, shadowOpacity:0.3, shadowRadius:12, elevation:8 },
  totalCard:    { padding: 0, overflow:'hidden' },
  totalGrad:    { padding: SPACING.lg, borderRadius: RADIUS.lg },
  totalLabel:   { fontSize: 11, fontWeight: '700', color: COLORS.cyan,
                  letterSpacing: 1.5 },
  totalAmt:     { fontSize: 42, fontWeight: '900', color: COLORS.text, marginTop: 4 },
  totalDate:    { fontSize: 13, color: COLORS.textSub, marginTop: 4 },
  addVoiceBtn:  { marginTop: SPACING.md, borderRadius: RADIUS.full, overflow:'hidden' },
  addVoiceBtnInner: { paddingVertical: 14, alignItems:'center' },
  addVoiceBtnText:  { fontSize: 16, fontWeight: '800', color: COLORS.bg },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSub,
                  letterSpacing: 1, marginBottom: SPACING.md },

  catRow:       { flexDirection:'row', alignItems:'center', marginBottom: SPACING.sm },
  catEmoji:     { fontSize: 22, width: 36 },
  catMid:       { flex: 1 },
  catLabelRow:  { flexDirection:'row', justifyContent:'space-between', marginBottom: 4 },
  catLabel:     { fontSize: 13, fontWeight: '600', color: COLORS.text },
  catAmt:       { fontSize: 13, fontWeight: '700' },
  barBg:        { height: 6, backgroundColor: COLORS.border,
                  borderRadius: RADIUS.full, overflow:'hidden' },
  barFill:      { height: '100%', borderRadius: RADIUS.full },
  budgetLabel:  { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },

  recentRow:    { flexDirection:'row', alignItems:'center', paddingVertical: SPACING.sm,
                  borderBottomWidth: 1, borderBottomColor: COLORS.border },
  recentEmoji:  { fontSize: 20, marginRight: SPACING.sm },
  recentCat:    { fontSize: 13, fontWeight: '600', color: COLORS.text },
  recentTime:   { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  recentAmt:    { fontSize: 15, fontWeight: '800', color: COLORS.gold },

  tipText:      { fontSize: 13, color: COLORS.textSub, lineHeight: 20 },
});
