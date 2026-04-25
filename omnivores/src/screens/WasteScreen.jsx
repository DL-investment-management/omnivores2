import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
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


  // Group by week label and ISO week (for chart)
  const byWeek = log.reduce((acc, entry) => {
    const week = getWeekLabel(entry.discardedAt);
    if (!acc[week]) acc[week] = [];
    acc[week].push(entry);
    return acc;
  }, {});

  // For chart: group by ISO week (YYYY-WW)
  const byIsoWeek = log.reduce((acc, entry) => {
    const d = new Date(entry.discardedAt);
    const y = d.getFullYear();
    const w = getIsoWeek(d);
    const key = `${y}-W${w}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  // Prepare chart data (last 8 weeks)
  const weekKeys = Object.keys(byIsoWeek).sort().slice(-8);
  const wasteCounts = weekKeys.map(k => byIsoWeek[k].length);
  const spoiledCounts = weekKeys.map(k => byIsoWeek[k].filter(e => e.condition === 'spoiled').length);
  const preventableCounts = weekKeys.map((k, i) => wasteCounts[i] - spoiledCounts[i]);

  // Pie chart data
  const spoiledTotal = log.filter(e => e.condition === 'spoiled').length;
  const preventableTotal = log.length - spoiledTotal;
  const pieData = [
    { name: 'Spoiled', count: spoiledTotal, color: '#FF6B6B', legendFontColor: '#FF6B6B', legendFontSize: 13 },
    { name: 'Preventable', count: preventableTotal, color: '#FFB300', legendFontColor: '#FFB300', legendFontSize: 13 },
  ];

  // Best/worst week
  const bestWeek = weekKeys.length ? weekKeys[wasteCounts.indexOf(Math.min(...wasteCounts))] : null;
  const worstWeek = weekKeys.length ? weekKeys[wasteCounts.indexOf(Math.max(...wasteCounts))] : null;

  const totalWasted  = log.length;
  const spoiledCount = log.filter(e => e.condition === 'spoiled').length;
  const preventable  = totalWasted - spoiledCount;

  return (
    <HudScreen title="Waste Analytics" subtitle="Track and reduce your food waste" onBack={onBack}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
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

        {/* Charts */}
        {log.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#FFF', fontWeight: '700', marginBottom: 8, fontSize: 13 }}>Waste Trend (last 8 weeks)</Text>
            <LineChart
              data={{
                labels: weekKeys.map(w => w.slice(5)),
                datasets: [
                  { data: wasteCounts, color: () => '#00D4FF', strokeWidth: 2, withDots: true },
                  { data: spoiledCounts, color: () => '#FF6B6B', strokeWidth: 2, withDots: true },
                  { data: preventableCounts, color: () => '#FFB300', strokeWidth: 2, withDots: true },
                ],
                legend: ['Total', 'Spoiled', 'Preventable'],
              }}
              width={Dimensions.get('window').width - 36}
              height={180}
              chartConfig={{
                backgroundColor: '#222',
                backgroundGradientFrom: '#222',
                backgroundGradientTo: '#222',
                decimalPlaces: 0,
                color: (o, i) => ['#00D4FF', '#FF6B6B', '#FFB300'][i] || '#FFF',
                labelColor: () => '#FFF',
                propsForDots: { r: '3', strokeWidth: '2', stroke: '#222' },
                propsForBackgroundLines: { stroke: 'rgba(255,255,255,0.07)' },
              }}
              bezier
              style={{ borderRadius: 12 }}
            />
          </View>
        )}
        {log.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#FFF', fontWeight: '700', marginBottom: 8, fontSize: 13 }}>Spoilage Breakdown</Text>
            <PieChart
              data={pieData.filter(d => d.count > 0)}
              width={Dimensions.get('window').width - 36}
              height={140}
              chartConfig={{
                color: (o, i) => ['#FF6B6B', '#FFB300'][i] || '#FFF',
                labelColor: () => '#FFF',
              }}
              accessor={'count'}
              backgroundColor={'transparent'}
              paddingLeft={'0'}
              absolute
              style={{ borderRadius: 12 }}
            />
          </View>
        )}
        {/* Best/worst week highlights */}
        {log.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 18 }}>
            {bestWeek && (
              <View style={[styles.streakCard, { borderColor: '#00FF88' }]}> 
                <Text style={{ color: '#00FF88', fontWeight: 'bold', fontSize: 12 }}>Best Week</Text>
                <Text style={{ color: '#FFF', fontSize: 16 }}>{bestWeek.slice(5)}</Text>
                <Text style={{ color: '#FFF', fontSize: 12 }}>{wasteCounts[weekKeys.indexOf(bestWeek)]} items</Text>
              </View>
            )}
            {worstWeek && (
              <View style={[styles.streakCard, { borderColor: '#FF6B6B' }]}> 
                <Text style={{ color: '#FF6B6B', fontWeight: 'bold', fontSize: 12 }}>Worst Week</Text>
                <Text style={{ color: '#FFF', fontSize: 16 }}>{worstWeek.slice(5)}</Text>
                <Text style={{ color: '#FFF', fontSize: 12 }}>{wasteCounts[weekKeys.indexOf(worstWeek)]} items</Text>
              </View>
            )}
          </View>
        )}

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
      </ScrollView>
    </HudScreen>
  );
}

// Helper: ISO week number
function getIsoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
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
  streakCard: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 0,
    backgroundColor: 'rgba(0,255,136,0.04)',
    gap: 2,
  },
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
