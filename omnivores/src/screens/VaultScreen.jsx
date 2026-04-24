import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native';
import { getScans, getFridges, getActiveFridge, setActiveFridge, saveFridges, logWaste } from '../storage/db';
import HudScreen from '../components/HudScreen';

const CONDITION_COLORS = { fresh: '#00FF88', good: '#00D4FF', aging: '#FFB300', spoiled: '#FF3D3D' };

export default function VaultScreen({ onBack, onWaste }) {
  const [scans, setScans]     = useState([]);
  const [fridges, setFridges] = useState([]);
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
    const name = `Fridge ${fridges.length + 1}`;
    const id   = `fridge_${Date.now()}`;
    const updated = [...fridges, { id, name }];
    await saveFridges(updated);
    setFridges(updated);
  }

  async function markWaste(item) {
    await logWaste(item);
    Alert.alert('Logged', `${item.name} added to waste tracker.`);
  }

  async function shareScan(scan) {
    const lines = scan.items.map(i => `• ${i.name} — ${i.condition.toUpperCase()} (${i.daysLeft}d left)`).join('\n');
    const text = `OMNIVORES FRIDGE REPORT\n${new Date(scan.timestamp).toLocaleString()}\n\n${lines}`;
    await Share.share({ message: text });
  }

  return (
    <HudScreen title="// FRIDGE VAULT" onBack={onBack}>
      {/* Waste tracker link */}
      <TouchableOpacity style={styles.wasteLink} onPress={onWaste}>
        <Text style={styles.wasteLinkText}>📊 VIEW WASTE ANALYTICS →</Text>
      </TouchableOpacity>

      {/* Fridge switcher */}
      <View style={styles.fridgeRow}>
        {fridges.map(f => (
          <TouchableOpacity
            key={f.id}
            style={[styles.fridgeBtn, f.id === activeId && styles.fridgeBtnActive]}
            onPress={() => switchFridge(f.id)}
          >
            <Text style={[styles.fridgeBtnText, f.id === activeId && styles.fridgeBtnTextActive]}>
              ❄ {f.name}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.addFridgeBtn} onPress={addFridge}>
          <Text style={styles.addFridgeText}>+ ADD</Text>
        </TouchableOpacity>
      </View>

      {scans.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>NO SCAN HISTORY{'\n'}INITIALIZE A SCAN TO BEGIN</Text>
        </View>
      )}

      {scans.map((scan, i) => (
        <TouchableOpacity key={scan.id} style={styles.scanCard} onPress={() => setExpanded(expanded === i ? null : i)}>
          <View style={styles.scanHeader}>
            <View>
              <Text style={styles.scanDate}>{new Date(scan.timestamp).toLocaleString()}</Text>
              <Text style={styles.scanCount}>{scan.items.length} ITEMS DETECTED</Text>
            </View>
            <TouchableOpacity onPress={() => shareScan(scan)} style={{ marginRight: 10 }}>
              <Text style={styles.shareIcon}>↑</Text>
            </TouchableOpacity>
            <Text style={styles.scanToggle}>{expanded === i ? '▲' : '▼'}</Text>
          </View>

          {expanded === i && (
            <View style={styles.scanBody}>
              {scan.items.map((item, j) => (
                <View key={j} style={styles.itemRow}>
                  <View style={[styles.itemDot, { backgroundColor: CONDITION_COLORS[item.condition] ?? '#888' }]} />
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDays}>{item.daysLeft}D</Text>
                  <TouchableOpacity onPress={() => markWaste(item)} style={styles.wasteBtn}>
                    <Text style={styles.wasteBtnText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  fridgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  fridgeBtn: { borderWidth: 1, borderColor: 'rgba(0,212,255,0.25)', paddingHorizontal: 12, paddingVertical: 6 },
  fridgeBtnActive: { borderColor: '#00D4FF', backgroundColor: 'rgba(0,212,255,0.1)' },
  fridgeBtnText: { color: 'rgba(0,212,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  fridgeBtnTextActive: { color: '#00D4FF' },
  addFridgeBtn: { borderWidth: 1, borderColor: 'rgba(0,212,255,0.15)', paddingHorizontal: 12, paddingVertical: 6 },
  addFridgeText: { color: 'rgba(0,212,255,0.4)', fontSize: 10, letterSpacing: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { color: 'rgba(0,212,255,0.3)', fontSize: 12, letterSpacing: 2, textAlign: 'center', lineHeight: 22 },
  scanCard: { borderWidth: 1, borderColor: 'rgba(0,212,255,0.15)', marginBottom: 10, padding: 14 },
  scanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scanDate: { color: '#00D4FF', fontSize: 11, letterSpacing: 1 },
  scanCount: { color: 'rgba(0,212,255,0.4)', fontSize: 9, letterSpacing: 1.5, marginTop: 3 },
  scanToggle: { color: 'rgba(0,212,255,0.4)', fontSize: 10 },
  scanBody: { marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,212,255,0.1)', paddingTop: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 7 },
  itemDot: { width: 6, height: 6, borderRadius: 3 },
  itemName: { color: '#E0F7FF', fontSize: 12, flex: 1 },
  itemDays: { color: 'rgba(0,212,255,0.5)', fontSize: 10, fontWeight: '700' },
  wasteBtn: { padding: 4 },
  wasteBtnText: { fontSize: 13 },
  shareIcon: { color: '#00D4FF', fontSize: 14, opacity: 0.6 },
  wasteLink: { borderWidth: 1, borderColor: 'rgba(255,179,0,0.2)', padding: 10, marginBottom: 16 },
  wasteLinkText: { color: '#FFB300', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
});
