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
    <HudScreen title="// SYSTEM SETTINGS" onBack={onBack}>

      {/* Auto-scan interval */}
      <Text style={styles.sectionLabel}>AUTO-SCAN INTERVAL</Text>
      <View style={styles.intervalRow}>
        {INTERVALS.map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.intervalBtn, settings.scanInterval === s && styles.intervalBtnActive]}
            onPress={() => update('scanInterval', s)}
          >
            <Text style={[styles.intervalText, settings.scanInterval === s && styles.intervalTextActive]}>
              {s}s
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Units */}
      <Text style={[styles.sectionLabel, { marginTop: 28 }]}>EXPIRY DISPLAY UNITS</Text>
      <View style={styles.intervalRow}>
        {['days', 'hours'].map(u => (
          <TouchableOpacity
            key={u}
            style={[styles.intervalBtn, settings.units === u && styles.intervalBtnActive]}
            onPress={() => update('units', u)}
          >
            <Text style={[styles.intervalText, settings.units === u && styles.intervalTextActive]}>
              {u.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications */}
      <Text style={[styles.sectionLabel, { marginTop: 28 }]}>EXPIRY ALERTS</Text>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>ENABLE NOTIFICATIONS</Text>
        <Switch
          value={settings.notificationsEnabled}
          onValueChange={v => update('notificationsEnabled', v)}
          trackColor={{ true: 'rgba(0,212,255,0.4)', false: 'rgba(255,255,255,0.1)' }}
          thumbColor={settings.notificationsEnabled ? '#00D4FF' : '#444'}
        />
      </View>

      <Text style={[styles.sectionLabel, { marginTop: 24 }]}>ALERT THRESHOLD</Text>
      <View style={styles.intervalRow}>
        {[1, 2, 3, 5].map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.intervalBtn, settings.notifyThresholdDays === d && styles.intervalBtnActive]}
            onPress={() => update('notifyThresholdDays', d)}
          >
            <Text style={[styles.intervalText, settings.notifyThresholdDays === d && styles.intervalTextActive]}>
              {d}D
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {saved && (
        <View style={styles.savedBadge}>
          <Text style={styles.savedText}>✓ SETTINGS SAVED</Text>
        </View>
      )}
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { color: 'rgba(0,212,255,0.45)', fontSize: 9, letterSpacing: 2, marginBottom: 12 },
  intervalRow: { flexDirection: 'row', gap: 8 },
  intervalBtn: { borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)', paddingHorizontal: 18, paddingVertical: 9 },
  intervalBtnActive: { borderColor: '#00D4FF', backgroundColor: 'rgba(0,212,255,0.12)' },
  intervalText: { color: 'rgba(0,212,255,0.4)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  intervalTextActive: { color: '#00D4FF' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,212,255,0.15)', padding: 14 },
  toggleLabel: { color: '#E0F7FF', fontSize: 11, letterSpacing: 1 },
  savedBadge: { marginTop: 28, borderWidth: 1, borderColor: '#00FF88', padding: 12, alignItems: 'center' },
  savedText: { color: '#00FF88', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
});
