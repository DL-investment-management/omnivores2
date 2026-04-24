import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { getSettings, saveSettings } from '../storage/db';
import HudScreen from '../components/HudScreen';

const INTERVALS = [4, 8, 15, 30, 60];

export default function SettingsScreen({ onBack }) {
  const [settings, setSettings] = useState(null);
  const [saved, setSaved]       = useState(false);

  useEffect(() => { getSettings().then(setSettings); }, []);

  async function update(key, value) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await saveSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (!settings) return null;

  return (
    <HudScreen title="Settings" subtitle="Configure your scanning preferences" onBack={onBack}>

      {/* Scan interval */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>⏱</Text>
          <View>
            <Text style={styles.cardTitle}>Auto-Scan Interval</Text>
            <Text style={styles.cardHint}>How often to scan in auto mode</Text>
          </View>
        </View>
        <View style={styles.pillRow}>
          {INTERVALS.map(s => {
            const active = settings.scanInterval === s;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => update('scanInterval', s)}
                activeOpacity={0.75}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{s}s</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Units */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>📅</Text>
          <View>
            <Text style={styles.cardTitle}>Expiry Display Units</Text>
            <Text style={styles.cardHint}>How remaining time is shown</Text>
          </View>
        </View>
        <View style={styles.pillRow}>
          {['days', 'hours'].map(u => {
            const active = settings.units === u;
            return (
              <TouchableOpacity
                key={u}
                style={[styles.pill, styles.pillWide, active && styles.pillActive]}
                onPress={() => update('units', u)}
                activeOpacity={0.75}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {u.charAt(0).toUpperCase() + u.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>🔔</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Expiry Alerts</Text>
            <Text style={styles.cardHint}>Get notified before items expire</Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={v => update('notificationsEnabled', v)}
            trackColor={{ true: 'rgba(0,212,255,0.5)', false: 'rgba(255,255,255,0.1)' }}
            thumbColor={settings.notificationsEnabled ? '#00D4FF' : '#555'}
          />
        </View>
      </View>

      {/* Alert threshold */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>⚠️</Text>
          <View>
            <Text style={styles.cardTitle}>Alert Threshold</Text>
            <Text style={styles.cardHint}>Warn me when items have this many days left</Text>
          </View>
        </View>
        <View style={styles.pillRow}>
          {[1, 2, 3, 5].map(d => {
            const active = settings.notifyThresholdDays === d;
            return (
              <TouchableOpacity
                key={d}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => update('notifyThresholdDays', d)}
                activeOpacity={0.75}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{d}d</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Saved toast */}
      {saved && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓  Settings saved</Text>
        </View>
      )}

    </HudScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  cardIcon: { fontSize: 22 },
  cardTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  cardHint: { color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 },

  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: 'rgba(0,212,255,0.04)',
    minWidth: 52,
    alignItems: 'center',
  },
  pillWide: { minWidth: 90 },
  pillActive: { borderColor: '#00D4FF', backgroundColor: 'rgba(0,212,255,0.15)' },
  pillText: { color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: '#00D4FF' },

  toast: {
    backgroundColor: 'rgba(0,255,136,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,136,0.3)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  toastText: { color: '#00FF88', fontSize: 14, fontWeight: '600' },
});
