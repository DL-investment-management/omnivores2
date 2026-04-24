import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getWasteLog } from '../storage/db';
import HudScreen from '../components/HudScreen';

const CONDITION_COLORS = { fresh: '#00FF88', good: '#00D4FF', aging: '#FFB300', spoiled: '#FF3D3D' };

export default function WasteScreen({ onBack }) {
  const [log, setLog] = useState([]);

  useEffect(() => { getWasteLog().then(setLog); }, []);

  // Group by week
  const byWeek = log.reduce((acc, entry) => {
    const week = getWeekLabel(entry.discardedAt);
    if (!acc[week]) acc[week] = [];
    acc[week].push(entry);
    return acc;
  }, {});

  const totalWasted = log.length;
  const spoiledCount = log.filter(e => e.condition === 'spoiled').length;

  return (
    <HudScreen title="// WASTE ANALYTICS" onBack={onBack}>
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalWasted}</Text>
          <Text style={styles.statLabel}>TOTAL DISCARDED</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#FF3D3D' }]}>{spoiledCount}</Text>
          <Text style={styles.statLabel}>SPOILED</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#FFB300' }]}>{totalWasted - spoiledCount}</Text>
          <Text style={styles.statLabel}>PREVENTABLE</Text>
        </View>
      </View>

      {log.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>NO WASTE LOGGED{'\n'}TAP 🗑 ON VAULT ITEMS TO TRACK</Text>
        </View>
      )}

      {Object.entries(byWeek).map(([week, entries]) => (
        <View key={week} style={styles.weekGroup}>
          <Text style={styles.weekLabel}>{week}</Text>
          {entries.map((entry, i) => (
            <View key={i} style={styles.entryRow}>
              <View style={[styles.dot, { backgroundColor: CONDITION_COLORS[entry.condition] ?? '#888' }]} />
              <Text style={styles.entryName}>{entry.name}</Text>
              <Text style={styles.entryCondition}>{entry.condition?.toUpperCase()}</Text>
              <Text style={styles.entryDate}>{new Date(entry.discardedAt).toLocaleDateString()}</Text>
            </View>
          ))}
        </View>
      ))}
    </HudScreen>
  );
}

function getWeekLabel(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / (7 * 24 * 60 * 60 * 1000));
  if (diff === 0) return 'THIS WEEK';
  if (diff === 1) return 'LAST WEEK';
  return `${diff} WEEKS AGO`;
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statBox: { flex: 1, borderWidth: 1, borderColor: 'rgba(0,212,255,0.15)', padding: 14, alignItems: 'center' },
  statValue: { color: '#00D4FF', fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  statLabel: { color: 'rgba(0,212,255,0.4)', fontSize: 8, letterSpacing: 1.5, marginTop: 4, textAlign: 'center' },
  empty: { paddingTop: 60, alignItems: 'center' },
  emptyText: { color: 'rgba(0,212,255,0.3)', fontSize: 11, letterSpacing: 1.5, textAlign: 'center', lineHeight: 22 },
  weekGroup: { marginBottom: 20 },
  weekLabel: { color: 'rgba(0,212,255,0.35)', fontSize: 9, letterSpacing: 2, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,212,255,0.08)', paddingBottom: 6 },
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,212,255,0.06)' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  entryName: { color: '#E0F7FF', fontSize: 12, flex: 1 },
  entryCondition: { color: 'rgba(0,212,255,0.35)', fontSize: 9, letterSpacing: 1 },
  entryDate: { color: 'rgba(0,212,255,0.25)', fontSize: 9 },
});
