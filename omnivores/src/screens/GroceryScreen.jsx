import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Share } from 'react-native';
import { getGroceryList } from '../api/claude';
import HudScreen from '../components/HudScreen';

const CATEGORY_COLORS = {
  produce: '#00FF88', dairy: '#00D4FF', meat: '#FF3D3D',
  pantry: '#FFB300', frozen: '#88CCFF', other: '#888',
};
const PRIORITY_COLORS = { urgent: '#FF3D3D', soon: '#FFB300', 'when-needed': '#00D4FF' };

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
      .map(g => `• ${g.name} [${g.category.toUpperCase()}] — ${g.reason}`)
      .join('\n');
    await Share.share({ message: `OMNIVORES GROCERY LIST\n\n${text}` });
  }

  const grouped = groceries.reduce((acc, g, i) => {
    if (!acc[g.category]) acc[g.category] = [];
    acc[g.category].push({ ...g, idx: i });
    return acc;
  }, {});

  return (
    <HudScreen title="// GROCERY MATRIX" onBack={onBack}>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={generate} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#00D4FF" size="small" />
            : <Text style={styles.btnText}>[ GENERATE LIST ]</Text>
          }
        </TouchableOpacity>
        {groceries.length > 0 && (
          <TouchableOpacity style={styles.shareBtn} onPress={shareList}>
            <Text style={styles.shareBtnText}>↑ SHARE</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 && (
        <Text style={styles.hint}>SCAN YOUR FRIDGE FIRST TO GENERATE A LIST</Text>
      )}

      {Object.entries(grouped).map(([cat, items]) => (
        <View key={cat} style={styles.group}>
          <Text style={[styles.groupLabel, { color: CATEGORY_COLORS[cat] ?? '#888' }]}>
            {cat.toUpperCase()}
          </Text>
          {items.map(g => (
            <TouchableOpacity
              key={g.idx}
              style={[styles.groceryRow, checked[g.idx] && styles.groceryRowChecked]}
              onPress={() => setChecked(c => ({ ...c, [g.idx]: !c[g.idx] }))}
            >
              <View style={[styles.checkbox, checked[g.idx] && styles.checkboxDone]}>
                {checked[g.idx] && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.groceryMeta}>
                <Text style={[styles.groceryName, checked[g.idx] && styles.strikethrough]}>{g.name}</Text>
                <Text style={styles.groceryReason}>{g.reason}</Text>
              </View>
              <View style={[styles.priorityBadge, { borderColor: PRIORITY_COLORS[g.priority] ?? '#888' }]}>
                <Text style={[styles.priorityText, { color: PRIORITY_COLORS[g.priority] ?? '#888' }]}>
                  {g.priority.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  btn: { borderWidth: 1, borderColor: '#00D4FF', paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#00D4FF', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  shareBtn: { borderWidth: 1, borderColor: 'rgba(0,212,255,0.3)', paddingHorizontal: 16, paddingVertical: 10 },
  shareBtnText: { color: 'rgba(0,212,255,0.6)', fontSize: 11, letterSpacing: 1 },
  hint: { color: 'rgba(0,212,255,0.3)', fontSize: 10, letterSpacing: 1.5, marginTop: 20 },
  group: { marginBottom: 20 },
  groupLabel: { fontSize: 9, letterSpacing: 2, marginBottom: 8 },
  groceryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(0,212,255,0.12)', padding: 12, marginBottom: 6 },
  groceryRowChecked: { opacity: 0.4 },
  checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: 'rgba(0,212,255,0.4)', justifyContent: 'center', alignItems: 'center' },
  checkboxDone: { backgroundColor: 'rgba(0,212,255,0.2)', borderColor: '#00D4FF' },
  checkmark: { color: '#00D4FF', fontSize: 11 },
  groceryMeta: { flex: 1 },
  groceryName: { color: '#E0F7FF', fontSize: 12, fontWeight: '600' },
  strikethrough: { textDecorationLine: 'line-through', color: 'rgba(255,255,255,0.3)' },
  groceryReason: { color: 'rgba(0,212,255,0.35)', fontSize: 10, marginTop: 2 },
  priorityBadge: { borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  priorityText: { fontSize: 8, fontWeight: '700', letterSpacing: 1 },
});
