import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { COLORS, SPACING, RADIUS, CATEGORIES } from '../theme';
import { getAllExpenses, deleteExpense } from '../services/storage';

function ExpenseItem({ exp, onDelete }) {
  const cat = CATEGORIES.find(c => c.key === exp.category);
  return (
    <View style={styles.item}>
      <Text style={styles.itemEmoji}>{cat?.emoji || '💰'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemCat}>{cat?.label || exp.category}</Text>
        <Text style={styles.itemMeta}>
          {exp.payment} · {exp.date}
          {exp.note ? ` · ${exp.note}` : ''}
        </Text>
      </View>
      <View style={{ alignItems:'flex-end' }}>
        <Text style={[styles.itemAmt, { color: cat?.color || COLORS.gold }]}>
          ₹{Number(exp.amount).toLocaleString()}
        </Text>
        <TouchableOpacity onPress={() => onDelete(exp.id)}>
          <Text style={styles.deleteBtn}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const [expenses, setExpenses] = useState([]);
  const [filter,   setFilter]   = useState('all');

  useFocusEffect(useCallback(() => {
    getAllExpenses().then(setExpenses);
  }, []));

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Remove this expense?', [
      { text: 'Cancel' },
      { text: 'Delete', style:'destructive', onPress: async () => {
        await deleteExpense(id);
        getAllExpenses().then(setExpenses);
      }},
    ]);
  };

  const today    = format(new Date(), 'yyyy-MM-dd');
  const month    = format(new Date(), 'MMM-yyyy');
  const filtered = expenses.filter(e => {
    if (filter === 'today') return e.dayKey === today;
    if (filter === 'month') return e.month === month;
    return true;
  });

  const grouped = filtered.reduce((acc, exp) => {
    const key = exp.date || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(exp);
    return acc;
  }, {});

  const total = filtered.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <LinearGradient colors={[COLORS.bg, '#050510']} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: SPACING.md }}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>History</Text>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {[['all','All'],['today','Today'],['month','This Month']].map(([k,l]) => (
            <TouchableOpacity key={k} onPress={() => setFilter(k)}
              style={[styles.filterTab, filter===k && styles.filterActive]}>
              <Text style={[styles.filterLabel, filter===k && { color: COLORS.cyan }]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>TOTAL ({filtered.length} entries)</Text>
          <Text style={styles.totalAmt}>₹{total.toLocaleString()}</Text>
        </View>

        {/* Grouped list */}
        {Object.entries(grouped).map(([date, exps]) => (
          <View key={date} style={{ marginBottom: SPACING.md }}>
            <Text style={styles.dateHeader}>{date}</Text>
            <View style={styles.group}>
              {exps.map(exp => (
                <ExpenseItem key={exp.id} exp={exp} onDelete={handleDelete} />
              ))}
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>📭</Text>
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySub}>Tap 🎙️ Voice to add your first expense</Text>
          </View>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  title:       { fontSize: 28, fontWeight:'900', color: COLORS.text, marginTop: 56, marginBottom: SPACING.md },
  filterRow:   { flexDirection:'row', gap: SPACING.sm, marginBottom: SPACING.md },
  filterTab:   { flex:1, paddingVertical: SPACING.sm, borderRadius: RADIUS.md,
                 borderWidth:1, borderColor: COLORS.border, alignItems:'center' },
  filterActive:{ borderColor: COLORS.cyan, backgroundColor: COLORS.cyan+'22' },
  filterLabel: { fontSize: 12, color: COLORS.textSub, fontWeight:'600' },
  totalBox:    { backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
                 borderWidth:1, borderColor: COLORS.gold+'40',
                 padding: SPACING.md, marginBottom: SPACING.md,
                 flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  totalLabel:  { fontSize: 11, color: COLORS.textMuted, letterSpacing:1 },
  totalAmt:    { fontSize: 22, fontWeight:'900', color: COLORS.gold },
  dateHeader:  { fontSize: 12, color: COLORS.textMuted, letterSpacing:1,
                 marginBottom: SPACING.xs, fontWeight:'700' },
  group:       { backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
                 borderWidth:1, borderColor: COLORS.border, overflow:'hidden' },
  item:        { flexDirection:'row', alignItems:'center', padding: SPACING.md,
                 borderBottomWidth:1, borderBottomColor: COLORS.border },
  itemEmoji:   { fontSize: 22, marginRight: SPACING.sm },
  itemCat:     { fontSize: 14, fontWeight:'700', color: COLORS.text },
  itemMeta:    { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  itemAmt:     { fontSize: 16, fontWeight:'900' },
  deleteBtn:   { fontSize: 12, color: COLORS.textMuted, marginTop: 4, padding: 4 },
  empty:       { alignItems:'center', paddingVertical: 60 },
  emptyText:   { fontSize: 18, fontWeight:'700', color: COLORS.textSub, marginTop: SPACING.md },
  emptySub:    { fontSize: 13, color: COLORS.textMuted, marginTop: SPACING.sm },
});
