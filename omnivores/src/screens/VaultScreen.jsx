import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native';
import { getScans, getFridges, getActiveFridge, setActiveFridge, saveFridges, logWaste } from '../storage/db';
import HudScreen from '../components/HudScreen';

const CONDITION_META = {
  fresh:   { color: '#00FF88', bg: 'rgba(0,255,136,0.1)',  label: 'Fresh',   emoji: '🟢' },
  good:    { color: '#00D4FF', bg: 'rgba(0,212,255,0.1)',  label: 'Good',    emoji: '🔵' },
  aging:   { color: '#FFB300', bg: 'rgba(255,179,0,0.1)',  label: 'Aging',   emoji: '🟡' },
  spoiled: { color: '#FF6B6B', bg: 'rgba(255,107,107,0.1)', label: 'Spoiled', emoji: '🔴' },
};

export default function VaultScreen({ onBack, onWaste }) {
  const [scans, setScans]       = useState([]);
  const [fridges, setFridges]   = useState([]);
  const [activeId, setActiveId] = useState('default');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const [f, a] = await Promise.all([getFridges(), getActiveFridge()]);
    setFridges(f); setActiveId(a);
    setScans(await getScans(a));
  }

  async function switchFridge(id) {
    await setActiveFridge(id);
    setActiveId(id);
    setScans(await getScans(id));
  }

  async function addFridge() {
    const name    = `Fridge ${fridges.length + 1}`;
    const id      = `fridge_${Date.now()}`;
    const updated = [...fridges, { id, name }];
    await saveFridges(updated);
    setFridges(updated);
  }

  async function markWaste(item) {
    await logWaste(item);
    Alert.alert('Logged', `${item.name} added to waste tracker.`);
  }

  async function shareScan(scan) {
    const lines = scan.items
      .map(i => `• ${i.name} — ${i.condition.toUpperCase()} (${i.daysLeft}d left)`)
      .join('\n');
    const text = `OMNIVORES FRIDGE REPORT\n${new Date(scan.timestamp).toLocaleString()}\n\n${lines}`;
    await Share.share({ message: text });
  }

  return (
    <HudScreen title="Fridge Vault" subtitle="Your scan history" onBack={onBack}>

      {/* Waste analytics link */}
      <TouchableOpacity style={styles.wasteCard} onPress={onWaste} activeOpacity={0.8}>
        <Text style={styles.wasteCardIcon}>📊</Text>
        <View style={styles.wasteCardText}>
          <Text style={styles.wasteCardTitle}>Waste Analytics</Text>
          <Text style={styles.wasteCardSub}>View your food waste trends</Text>
        </View>
        <Text style={styles.wasteCardArrow}>→</Text>
      </TouchableOpacity>

      {/* Fridge switcher */}
      <View style={styles.fridgeSection}>
        <Text style={styles.fridgeSectionLabel}>YOUR FRIDGES</Text>
        <View style={styles.fridgeRow}>
          {fridges.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[styles.fridgeBtn, f.id === activeId && styles.fridgeBtnActive]}
              onPress={() => switchFridge(f.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.fridgeBtnIcon}>❄️</Text>
              <Text style={[styles.fridgeBtnText, f.id === activeId && styles.fridgeBtnTextActive]}>
                {f.name}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addFridgeBtn} onPress={addFridge} activeOpacity={0.75}>
            <Text style={styles.addFridgeText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Empty state */}
      {scans.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📷</Text>
          <Text style={styles.emptyTitle}>No scans yet</Text>
          <Text style={styles.emptyHint}>Scan your fridge to start tracking</Text>
        </View>
      )}

      {/* Scan cards */}
      {scans.map((scan, i) => (
        <View key={scan.id} style={styles.scanCard}>
          <TouchableOpacity
            style={styles.scanHeader}
            onPress={() => setExpanded(expanded === i ? null : i)}
            activeOpacity={0.8}
          >
            <View style={styles.scanHeaderLeft}>
              <Text style={styles.scanDate}>{new Date(scan.timestamp).toLocaleString()}</Text>
              <Text style={styles.scanCount}>{scan.items.length} items detected</Text>
            </View>
            <View style={styles.scanHeaderRight}>
              <TouchableOpacity
                onPress={() => shareScan(scan)}
                style={styles.shareBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.shareBtnText}>↑ Share</Text>
              </TouchableOpacity>
              <Text style={styles.scanToggle}>{expanded === i ? '▲' : '▼'}</Text>
            </View>
          </TouchableOpacity>

          {/* Condition summary dots */}
          <View style={styles.conditionDots}>
            {Object.entries(CONDITION_META).map(([k, m]) => {
              const count = scan.items.filter(it => it.condition === k).length;
              if (!count) return null;
              return (
                <View key={k} style={[styles.conditionPill, { backgroundColor: m.bg, borderColor: m.color + '44' }]}>
                  <Text style={styles.conditionPillText}>{m.emoji} {count}</Text>
                </View>
              );
            })}
          </View>

          {expanded === i && (
            <View style={styles.scanBody}>
              {scan.items.map((item, j) => {
                const meta = CONDITION_META[item.condition] ?? { color: '#888', bg: 'rgba(136,136,136,0.1)', emoji: '⚪' };
                return (
                  <View key={j} style={styles.itemRow}>
                    <Text style={styles.itemEmoji}>{meta.emoji}</Text>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={[styles.itemCondition, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                    <Text style={styles.itemDays}>{item.daysLeft}d</Text>
                    <TouchableOpacity
                      onPress={() => markWaste(item)}
                      style={styles.wasteBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.wasteBtnText}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      ))}

    </HudScreen>
  );
}

const styles = StyleSheet.create({
  /* Waste card */
  wasteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,179,0,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.25)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  wasteCardIcon:  { fontSize: 26 },
  wasteCardText:  { flex: 1 },
  wasteCardTitle: { color: '#FFB300', fontSize: 14, fontWeight: '700' },
  wasteCardSub:   { color: 'rgba(255,179,0,0.55)', fontSize: 12, marginTop: 2 },
  wasteCardArrow: { color: '#FFB300', fontSize: 18, opacity: 0.7 },

  /* Fridge switcher */
  fridgeSection: { marginBottom: 20 },
  fridgeSectionLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: 2, marginBottom: 10 },
  fridgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fridgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,212,255,0.04)',
  },
  fridgeBtnActive: { borderColor: '#00D4FF', backgroundColor: 'rgba(0,212,255,0.12)' },
  fridgeBtnIcon: { fontSize: 14 },
  fridgeBtnText: { color: 'rgba(0,212,255,0.5)', fontSize: 12, fontWeight: '600' },
  fridgeBtnTextActive: { color: '#00D4FF' },
  addFridgeBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderStyle: 'dashed',
  },
  addFridgeText: { color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: '600' },

  /* Empty */
  empty: { paddingTop: 60, alignItems: 'center', gap: 10 },
  emptyIcon:  { fontSize: 48, opacity: 0.4 },
  emptyTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: '700' },
  emptyHint:  { color: 'rgba(255,255,255,0.2)', fontSize: 13 },

  /* Scan card */
  scanCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 10,
  },
  scanHeaderLeft: { gap: 3 },
  scanDate:  { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  scanCount: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  scanHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  shareBtn: {
    backgroundColor: 'rgba(0,212,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  shareBtnText: { color: '#00D4FF', fontSize: 11, fontWeight: '600' },
  scanToggle: { color: 'rgba(255,255,255,0.35)', fontSize: 12 },

  conditionDots: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexWrap: 'wrap',
  },
  conditionPill: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  conditionPillText: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },

  scanBody: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    gap: 12,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemEmoji: { fontSize: 18, width: 26 },
  itemInfo: { flex: 1 },
  itemName: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  itemCondition: { fontSize: 11, marginTop: 1 },
  itemDays: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'right',
  },
  wasteBtn: {
    backgroundColor: 'rgba(255,107,107,0.08)',
    borderRadius: 8,
    padding: 6,
  },
  wasteBtnText: { fontSize: 14 },
});
