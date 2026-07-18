import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { format, subDays } from 'date-fns';
import { COLORS, SPACING, RADIUS, CATEGORIES } from '../theme';
import { getAllExpenses, getMonthSummary, getBudgets } from '../services/storage';

const { width: SW } = Dimensions.get('window');

// ── Simple bar chart (no extra lib needed) ────────────────────────────────────
function BarChart({ data, maxVal, color }) {
  return (
    <View style={chart.container}>
      {data.map((item, i) => {
        const pct = maxVal > 0 ? item.value / maxVal : 0;
        return (
          <View key={i} style={chart.barWrap}>
            <Text style={chart.barVal}>
              {item.value > 0 ? `₹${item.value}` : ''}
            </Text>
            <View style={chart.barBg}>
              <View style={[chart.barFill, {
                height: `${Math.max(4, pct * 100)}%`,
                backgroundColor: color || item.color || COLORS.cyan,
              }]} />
            </View>
            <Text style={chart.barLabel}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}
const chart = StyleSheet.create({
  container: { flexDirection:'row', alignItems:'flex-end', height: 140,
               gap: 6, paddingTop: SPACING.sm },
  barWrap:   { flex: 1, alignItems:'center' },
  barVal:    { fontSize: 8, color: COLORS.textMuted, marginBottom: 2 },
  barBg:     { flex: 1, width: '100%', backgroundColor: COLORS.border,
               borderRadius: 4, overflow:'hidden', justifyContent:'flex-end' },
  barFill:   { width:'100%', borderRadius: 4 },
  barLabel:  { fontSize: 9, color: COLORS.textSub, marginTop: 4, textAlign:'center' },
});

// ── Donut ring ────────────────────────────────────────────────────────────────
function DonutStat({ pct, color, label, value }) {
  return (
    <View style={donut.wrap}>
      <View style={[donut.ring, { borderColor: color }]}>
        <Text style={[donut.pct, { color }]}>{Math.round(pct)}%</Text>
      </View>
      <Text style={donut.label}>{label}</Text>
      <Text style={donut.value}>₹{value.toLocaleString()}</Text>
    </View>
  );
}
const donut = StyleSheet.create({
  wrap:  { alignItems:'center', width: (SW - 64) / 3 },
  ring:  { width: 64, height: 64, borderRadius: 32, borderWidth: 4,
           alignItems:'center', justifyContent:'center', marginBottom: 6 },
  pct:   { fontSize: 16, fontWeight:'900' },
  label: { fontSize: 10, color: COLORS.textSub, textAlign:'center' },
  value: { fontSize: 12, fontWeight:'700', color: COLORS.text },
});

// ── Insight chip ──────────────────────────────────────────────────────────────
function Insight({ emoji, text, color }) {
  return (
    <View style={[ins.box, { borderColor: color + '40', backgroundColor: color + '11' }]}>
      <Text style={ins.emoji}>{emoji}</Text>
      <Text style={ins.text}>{text}</Text>
    </View>
  );
}
const ins = StyleSheet.create({
  box:   { flexDirection:'row', alignItems:'center', borderRadius: RADIUS.md,
           borderWidth: 1, padding: SPACING.sm, marginBottom: SPACING.sm, gap: SPACING.sm },
  emoji: { fontSize: 20 },
  text:  { flex: 1, fontSize: 13, color: COLORS.textSub, lineHeight: 18 },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function AnalyticsScreen() {
  const [monthSummary, setMonthSummary] = useState({});
  const [budgets,      setBudgets]      = useState({});
  const [last7,        setLast7]        = useState([]);
  const [allExp,       setAllExp]       = useState([]);
  const [tab,          setTab]          = useState('month'); // month | week

  useFocusEffect(useCallback(() => {
    const load = async () => {
      const month = format(new Date(), 'MMM-yyyy');
      const [ms, bud, all] = await Promise.all([
        getMonthSummary(month),
        getBudgets(),
        getAllExpenses(),
      ]);
      setMonthSummary(ms);
      setBudgets(bud);
      setAllExp(all);

      // Last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const key = format(d, 'yyyy-MM-dd');
        const dayExp = all.filter(e => e.dayKey === key);
        const total = dayExp.reduce((s, e) => s + Number(e.amount), 0);
        days.push({ label: format(d, 'EEE'), value: total, color: COLORS.cyan });
      }
      setLast7(days);
    };
    load();
  }, []));

  const maxDay = Math.max(...last7.map(d => d.value), 1);

  // Category donut data
  const total = monthSummary.total || 1;
  const catData = CATEGORIES.map(cat => ({
    ...cat, value: monthSummary[cat.key] || 0,
    pct: ((monthSummary[cat.key] || 0) / total) * 100,
  }));

  // Smart insights
  const insights = [];
  const topCat = catData.reduce((a, b) => a.value > b.value ? a : b, catData[0]);
  if (topCat?.value > 0)
    insights.push({ emoji: '📊', color: topCat.color,
      text: `Highest spending: ${topCat.label} at ₹${topCat.value.toLocaleString()} (${Math.round(topCat.pct)}% of total)` });

  const daysElapsed = new Date().getDate();
  const dailyAvg = daysElapsed > 0 ? Math.round((monthSummary.total||0) / daysElapsed) : 0;
  const projected = dailyAvg * 31;
  insights.push({ emoji: '📈', color: COLORS.gold,
    text: `Daily average: ₹${dailyAvg.toLocaleString()}. Projected month total: ₹${projected.toLocaleString()}` });

  const overCats = CATEGORIES.filter(c =>
    budgets[c.key] > 0 && (monthSummary[c.key]||0) > budgets[c.key]);
  if (overCats.length > 0)
    insights.push({ emoji: '⚠️', color: COLORS.pink,
      text: `Over budget: ${overCats.map(c=>c.label).join(', ')}` });
  else
    insights.push({ emoji: '✅', color: COLORS.green,
      text: 'All categories within budget! Great job 💪' });

  return (
    <LinearGradient colors={[COLORS.bg, '#050510']} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: SPACING.md }}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>July 2026 spending insights</Text>

        {/* Tab toggle */}
        <View style={styles.tabRow}>
          {['month','week'].map(t => (
            <TouchableOpacity key={t} onPress={() => setTab(t)}
              style={[styles.tab, tab===t && styles.tabActive]}>
              <Text style={[styles.tabLabel, tab===t && styles.tabLabelActive]}>
                {t === 'month' ? '📅 Month' : '📆 Last 7 Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bar chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {tab === 'month' ? '📂 Spending by Category' : '📆 Last 7 Days'}
          </Text>
          {tab === 'week' ? (
            <BarChart
              data={last7}
              maxVal={maxDay}
              color={COLORS.cyan}
            />
          ) : (
            <BarChart
              data={CATEGORIES.map(c => ({
                label: c.emoji,
                value: monthSummary[c.key] || 0,
                color: c.color,
              }))}
              maxVal={Math.max(...CATEGORIES.map(c => monthSummary[c.key]||0), 1)}
            />
          )}
        </View>

        {/* Category breakdown donuts */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Category Split</Text>
          <View style={{ flexDirection:'row', flexWrap:'wrap', gap: SPACING.md,
            justifyContent:'center', paddingTop: SPACING.sm }}>
            {catData.filter(c => c.value > 0).map(cat => (
              <DonutStat key={cat.key} pct={cat.pct}
                color={cat.color} label={cat.label} value={cat.value} />
            ))}
          </View>
        </View>

        {/* Budget vs Actual */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Budget vs Actual</Text>
          {CATEGORIES.map(cat => {
            const spent  = monthSummary[cat.key] || 0;
            const budget = budgets[cat.key] || 0;
            const over   = budget > 0 && spent > budget;
            const pct    = budget > 0 ? Math.min(1, spent / budget) : 0;
            return (
              <View key={cat.key} style={styles.budRow}>
                <Text style={{ fontSize: 16, width: 28 }}>{cat.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
                    <Text style={styles.budLabel}>{cat.label}</Text>
                    <Text style={[styles.budAmt, { color: over ? COLORS.pink : COLORS.green }]}>
                      ₹{spent.toLocaleString()} {budget>0 ? `/ ₹${budget.toLocaleString()}` : ''}
                    </Text>
                  </View>
                  {budget > 0 && (
                    <View style={styles.budBarBg}>
                      <View style={[styles.budBarFill, {
                        width: `${pct * 100}%`,
                        backgroundColor: over ? COLORS.pink : cat.color,
                      }]} />
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Smart Insights */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🤖 Smart Insights</Text>
          {insights.map((ins, i) => (
            <Insight key={i} {...ins} />
          ))}
        </View>

        {/* Payment method breakdown */}
        <View style={[styles.card, { marginBottom: SPACING.xl }]}>
          <Text style={styles.cardTitle}>💳 Payment Methods</Text>
          {['Cash', 'UPI', 'Card', 'Bank'].map(pm => {
            const pmExp = allExp.filter(e =>
              e.month === format(new Date(), 'MMM-yyyy') && e.payment === pm);
            const pmTotal = pmExp.reduce((s, e) => s + Number(e.amount), 0);
            if (pmTotal === 0) return null;
            return (
              <View key={pm} style={styles.payRow}>
                <Text style={styles.payLabel}>{pm}</Text>
                <View style={styles.payBarBg}>
                  <View style={[styles.payBarFill, {
                    width: `${(pmTotal / (monthSummary.total||1)) * 100}%`,
                  }]} />
                </View>
                <Text style={styles.payAmt}>₹{pmTotal.toLocaleString()}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  title:       { fontSize: 28, fontWeight:'900', color: COLORS.text, marginTop: 56, marginBottom: 4 },
  subtitle:    { fontSize: 14, color: COLORS.textSub, marginBottom: SPACING.lg },
  tabRow:      { flexDirection:'row', gap: SPACING.sm, marginBottom: SPACING.md },
  tab:         { flex:1, paddingVertical: SPACING.sm, borderRadius: RADIUS.md,
                 borderWidth:1, borderColor: COLORS.border, alignItems:'center' },
  tabActive:   { borderColor: COLORS.cyan, backgroundColor: COLORS.cyan + '22' },
  tabLabel:    { fontSize: 13, color: COLORS.textSub, fontWeight:'600' },
  tabLabelActive:{ color: COLORS.cyan },
  card:        { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
                 borderWidth:1, borderColor: COLORS.border,
                 padding: SPACING.md, marginBottom: SPACING.md },
  cardTitle:   { fontSize: 13, fontWeight:'700', color: COLORS.textSub,
                 letterSpacing:1, marginBottom: SPACING.sm },
  budRow:      { flexDirection:'row', alignItems:'center', gap: SPACING.sm,
                 marginBottom: SPACING.sm },
  budLabel:    { fontSize: 13, color: COLORS.text },
  budAmt:      { fontSize: 12, fontWeight:'700' },
  budBarBg:    { height: 6, backgroundColor: COLORS.border, borderRadius: 3,
                 overflow:'hidden', marginTop: 4 },
  budBarFill:  { height:'100%', borderRadius: 3 },
  payRow:      { flexDirection:'row', alignItems:'center', gap: SPACING.sm,
                 marginBottom: SPACING.sm },
  payLabel:    { fontSize: 13, color: COLORS.text, width: 50 },
  payBarBg:    { flex:1, height: 8, backgroundColor: COLORS.border,
                 borderRadius: 4, overflow:'hidden' },
  payBarFill:  { height:'100%', backgroundColor: COLORS.purple, borderRadius: 4 },
  payAmt:      { fontSize: 12, fontWeight:'700', color: COLORS.gold, width: 70, textAlign:'right' },
});
