import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Share } from 'react-native';
import { getGroceryList } from '../api/claude';
import HudScreen from '../components/HudScreen';

const CATEGORY_META = {
  produce: { color: '#00FF88', emoji: '🥦' },
  dairy:   { color: '#00D4FF', emoji: '🧀' },
  meat:    { color: '#FF6B6B', emoji: '🥩' },
  pantry:  { color: '#FFB300', emoji: '🫙'  },
  frozen:  { color: '#88CCFF', emoji: '🧊' },
  other:   { color: '#AAAAAA', emoji: '🛍'  },
};

const PRIORITY_META = {
  urgent:       { color: '#FF6B6B', bg: 'rgba(255,107,107,0.1)', label: 'Urgent'  },
  soon:         { color: '#FFB300', bg: 'rgba(255,179,0,0.1)',   label: 'Soon'    },
  'when-needed':{ color: '#00D4FF', bg: 'rgba(0,212,255,0.08)', label: 'Anytime' },
};

export default function GroceryScreen({ items = [], onBack }) {
  const [groceries, setGroceries] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [checked, setChecked]     = useState({});

  async function generate() {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const result = await getGroceryList(items);
      setGroceries(result.groceries ?? []);
      setChecked({});
    } catch (e) { console.warn(e); }
    finally { setLoading(false); }
  }

  async function shareList() {
    const text = groceries
      .filter((_, i) => !checked[i])
      .map(g => `• ${g.name} [${g.category}] — ${g.reason}`)
      .join('\n');
    await Share.share({ message: `Omnivores Grocery List\n\n${text}` });
  }

  const uncheckedCount = groceries.filter((_, i) => !checked[i]).length;

  const grouped = groceries.reduce((acc, g, i) => {
    if (!acc[g.category]) acc[g.category] = [];
    acc[g.category].push({ ...g, idx: i });
    return acc;
  }, {});

  return (
    <HudScreen title="Grocery List" subtitle="AI-generated restocking suggestions" onBack={onBack}>

      {/* Generate / Share row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.generateBtn, (loading || items.length === 0) && styles.btnDisabled]}
          onPress={generate}
          disabled={loading || items.length === 0}
          activeOpacity={0.82}
        >
          {loading
            ? <ActivityIndicator color="#00D4FF" size="small" />
            : <>
                <Text style={styles.generateIcon}>✨</Text>
                <Text style={styles.generateText}>Generate List</Text>
              </>
          }
        </TouchableOpacity>

        {groceries.length > 0 && (
          <TouchableOpacity style={styles.shareBtn} onPress={shareList} activeOpacity={0.8}>
            <Text style={styles.shareBtnText}>↑ Share ({uncheckedCount})</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* No items hint */}
      {items.length === 0 && (
        <View style={styles.hint}>
          <Text style={styles.hintIcon}>📷</Text>
          <Text style={styles.hintText}>Scan your fridge first to generate a list</Text>
        </View>
      )}

      {/* Progress bar */}
      {groceries.length > 0 && (
        <View style={styles.progressWrap}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {
              width: `${((groceries.length - uncheckedCount) / groceries.length) * 100}%`
            }]} />
          </View>
          <Text style={styles.progressText}>
            {groceries.length - uncheckedCount} / {groceries.length} checked
          </Text>
        </View>
      )}

      {/* Grouped items */}
      {Object.entries(grouped).map(([cat, catItems]) => {
        const meta = CATEGORY_META[cat] ?? CATEGORY_META.other;
        return (
          <View key={cat} style={styles.group}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupEmoji}>{meta.emoji}</Text>
              <Text style={[styles.groupLabel, { color: meta.color }]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
              <Text style={styles.groupCount}>{catItems.length}</Text>
            </View>

            {catItems.map(g => {
              const done = !!checked[g.idx];
              const priority = PRIORITY_META[g.priority] ?? PRIORITY_META['when-needed'];
              return (
                <TouchableOpacity
                  key={g.idx}
                  style={[styles.groceryRow, done && styles.groceryRowDone]}
                  onPress={() => setChecked(c => ({ ...c, [g.idx]: !c[g.idx] }))}
                  activeOpacity={0.75}
                >
                  <View style={[styles.checkbox, done && styles.checkboxDone]}>
                    {done && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.groceryInfo}>
                    <Text style={[styles.groceryName, done && styles.strikethrough]}>{g.name}</Text>
                    <Text style={styles.groceryReason}>{g.reason}</Text>
                  </View>
                  <View style={[styles.priorityBadge, { backgroundColor: priority.bg, borderColor: priority.color + '55' }]}>
                    <Text style={[styles.priorityText, { color: priority.color }]}>{priority.label}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}

    </HudScreen>
  );
}

const styles = StyleSheet.create({
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 20, alignItems: 'center' },
  generateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,212,255,0.1)',
    borderWidth: 1.5,
    borderColor: '#00D4FF',
    borderRadius: 14,
    paddingVertical: 14,
  },
  btnDisabled: { opacity: 0.35 },
  generateIcon: { fontSize: 18 },
  generateText: { color: '#00D4FF', fontSize: 15, fontWeight: '700' },
  shareBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  shareBtnText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },

  hint: { alignItems: 'center', paddingTop: 48, gap: 10 },
  hintIcon: { fontSize: 40, opacity: 0.5 },
  hintText: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },

  progressWrap: { marginBottom: 20, gap: 8 },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#00D4FF', borderRadius: 2 },
  progressText: { color: 'rgba(255,255,255,0.35)', fontSize: 11, textAlign: 'right' },

  group: { marginBottom: 20 },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  groupEmoji: { fontSize: 18 },
  groupLabel: { flex: 1, fontSize: 13, fontWeight: '700' },
  groupCount: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  groceryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 12,
    marginBottom: 6,
  },
  groceryRowDone: { opacity: 0.4 },
  checkbox: {
    width: 22, height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(0,212,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,212,255,0.04)',
  },
  checkboxDone: { backgroundColor: '#00D4FF', borderColor: '#00D4FF' },
  checkmark: { color: '#060B18', fontSize: 13, fontWeight: '900' },
  groceryInfo: { flex: 1 },
  groceryName: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  strikethrough: { textDecorationLine: 'line-through', color: 'rgba(255,255,255,0.3)' },
  groceryReason: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 },
  priorityBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  priorityText: { fontSize: 10, fontWeight: '700' },
});
