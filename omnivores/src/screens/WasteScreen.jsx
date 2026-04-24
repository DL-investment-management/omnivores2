import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getWasteLog } from '../storage/db';
import HudScreen from '../components/HudScreen';

const CONDITION_META = {
  fresh:   { color: '#00FF88', emoji: '🟢' },
  good:    { color: '#00D4FF', emoji: '🔵' },
  aging:   { color: '#FFB300', emoji: '🟡' },
  spoiled: { color: '#FF6B6B', emoji: '🔴' },
};

export default function WasteScreen({ onBack }) {
  const [log, setLog] = useState([]);

  useEffect(() => { getWasteLog().then(setLog); }, []);

  const byWeek = log.reduce((acc, entry) => {
    const week = getWeekLabel(entry.discardedAt);
    if (!acc[week]) acc[week] = [];
    acc[week].push(entry);
    return acc;
  }, {});

  const totalWasted  = log.length;
  const spoiledCount = log.filter(e => e.condition === 'spoiled').length;
  const preventable  = totalWasted - spoiledCount;

  return (
    <HudScreen title="Waste Analytics" subtitle="Track and reduce your food waste" onBack={onBack}>

      {/* Stat cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardNeutral]}>
          <Text style={styles.statValue}>{totalWasted}</Text>
          <Text style={styles.statEmoji}>🗑</Text>
          <Text style={styles.statLabel}>Total{'\n'}Discarded</Text>
        </View>
        <View style={[styles.statCard, styles.statCardDanger]}>
          <Text style={[styles.statValue, { color: '#FF6B6B' }]}>{spoiledCount}</Text>
          <Text style={styles.statEmoji}>😬</Text>
          <Text style={styles.statLabel}>Already{'\n'}Spoiled</Text>
        </View>
        <View style={[styles.statCard, styles.statCardWarn]}>
          <Text style={[styles.statValue, { color: '#FFB300' }]}>{preventable}</Text>
          <Text style={styles.statEmoji}>💡</Text>
          <Text style={styles.statLabel}>Could've{'\n'}Been Saved</Text>
        </View>
      </View>

      {/* Tip */}
      {preventable > 0 && (
        <View style={styles.tip}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            {preventable} item{preventable !== 1 ? 's were' : ' was'} still usable when discarded.
            Try the Recipe Engine to use ingredients before they expire.
          </Text>
        </View>
      )}

      {/* Empty */}
      {log.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={styles.emptyTitle}>No waste logged yet</Text>
          <Text style={styles.emptyHint}>Tap 🗑 on Vault items to start tracking</Text>
        </View>
      )}

      {/* Weekly groups */}
      {Object.entries(byWeek).map(([week, entries]) => (
        <View key={week} style={styles.weekGroup}>
          <Text style={styles.weekLabel}>{week}</Text>
          {entries.map((entry, i) => {
            const meta = CONDITION_META[entry.condition] ?? { color: '#888', emoji: '⚪' };
            return (
              <View key={i} style={styles.entryRow}>
                <Text style={styles.entryEmoji}>{meta.emoji}</Text>
                <View style={styles.entryInfo}>
                  <Text style={styles.entryName}>{entry.name}</Text>
                  <Text style={[styles.entryCondition, { color: meta.color }]}>
                    {entry.condition
                      ? entry.condition.charAt(0).toUpperCase() + entry.condition.slice(1)
                      : ''}
                  </Text>
                </View>
                <Text style={styles.entryDate}>
                  {new Date(entry.discardedAt).toLocaleDateString()}
                </Text>
              </View>
            );
          })}
        </View>
      ))}

    </HudScreen>
  );
}

function getWeekLabel(iso) {
  const d    = new Date(iso);
  const now  = new Date();
  const diff = Math.floor((now - d) / (7 * 24 * 60 * 60 * 1000));
  if (diff === 0) return 'This Week';
  if (diff === 1) return 'Last Week';
  return `${diff} Weeks Ago`;
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statCardNeutral: { borderColor: 'rgba(0,212,255,0.15)',   backgroundColor: 'rgba(0,212,255,0.05)'   },
  statCardDanger:  { borderColor: 'rgba(255,107,107,0.2)',  backgroundColor: 'rgba(255,107,107,0.05)' },
  statCardWarn:    { borderColor: 'rgba(255,179,0,0.2)',    backgroundColor: 'rgba(255,179,0,0.05)'   },
  statValue: { color: '#00D4FF', fontSize: 28, fontWeight: '900' },
  statEmoji: { fontSize: 18 },
  statLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 10, textAlign: 'center', fontWeight: '600', lineHeight: 15 },

  tip: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(255,179,0,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.2)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  tipIcon: { fontSize: 18, marginTop: 1 },
  tipText: { flex: 1, color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 18 },

  empty: { paddingTop: 60, alignItems: 'center', gap: 10 },
  emptyIcon:  { fontSize: 52 },
  emptyTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: '700' },
  emptyHint:  { color: 'rgba(255,255,255,0.25)', fontSize: 13 },

  weekGroup: { marginBottom: 24 },
  weekLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  entryEmoji: { fontSize: 18 },
  entryInfo:  { flex: 1 },
  entryName:  { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  entryCondition: { fontSize: 11, marginTop: 2 },
  entryDate: { color: 'rgba(255,255,255,0.25)', fontSize: 11 },
});
