import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { getProfile, saveProfile } from '../storage/db';
import HudScreen from '../components/HudScreen';

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Kosher'];
const ALLERGEN_OPTIONS = ['Nuts', 'Dairy', 'Eggs', 'Gluten', 'Soy', 'Shellfish', 'Fish', 'Sesame'];

export default function ProfileScreen({ onBack }) {
  const [name, setName]           = useState('');
  const [dietary, setDietary]     = useState([]);
  const [allergens, setAllergens] = useState([]);
  const [saved, setSaved]         = useState(false);

  useEffect(() => {
    getProfile().then(p => {
      setName(p?.name ?? '');
      setDietary(p?.dietary ?? []);
      setAllergens(p?.allergens ?? []);
    });
  }, []);

  function toggle(arr, setArr, val) {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  }

  async function handleSave() {
    await saveProfile({ name, dietary, allergens });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <HudScreen title="Your Profile" subtitle="Personalize your scan results" onBack={onBack}>

      {/* Avatar row */}
      <View style={styles.avatarRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
        <View style={styles.avatarMeta}>
          <Text style={styles.avatarHint}>Display name shown on reports</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name…"
            placeholderTextColor="rgba(255,255,255,0.2)"
          />
        </View>
      </View>

      {/* Dietary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🥗</Text>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
        </View>
        <Text style={styles.sectionHint}>Recipes and analysis will respect your diet</Text>
        <View style={styles.chips}>
          {DIETARY_OPTIONS.map(opt => {
            const on = dietary.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.chip, on && styles.chipActive]}
                onPress={() => toggle(dietary, setDietary, opt)}
                activeOpacity={0.75}
              >
                {on && <Text style={styles.chipCheck}>✓ </Text>}
                <Text style={[styles.chipText, on && styles.chipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Allergens */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>⚠️</Text>
          <Text style={styles.sectionTitle}>Allergen Alerts</Text>
        </View>
        <Text style={styles.sectionHint}>You'll be warned if a recipe contains these</Text>
        <View style={styles.chips}>
          {ALLERGEN_OPTIONS.map(opt => {
            const on = allergens.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.chip, styles.allergenChip, on && styles.allergenActive]}
                onPress={() => toggle(allergens, setAllergens, opt)}
                activeOpacity={0.75}
              >
                {on && <Text style={[styles.chipCheck, { color: '#FF6B6B' }]}>✓ </Text>}
                <Text style={[styles.chipText, on && styles.allergenTextActive]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Save */}
      <TouchableOpacity
        style={[styles.saveBtn, saved && styles.saveBtnDone]}
        onPress={handleSave}
        activeOpacity={0.82}
      >
        <Text style={[styles.saveBtnText, saved && styles.saveBtnTextDone]}>
          {saved ? '✓  Profile Saved!' : 'Save Profile'}
        </Text>
      </TouchableOpacity>

    </HudScreen>
  );
}

const styles = StyleSheet.create({
  /* Avatar row */
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(0,212,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarEmoji: { fontSize: 26 },
  avatarMeta: { flex: 1, gap: 6 },
  avatarHint: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },

  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
    borderRadius: 10,
    color: '#FFFFFF',
    fontSize: 14,
    padding: 10,
    backgroundColor: 'rgba(0,20,50,0.4)',
    ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
  },

  /* Sections */
  section: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  sectionHint: { color: 'rgba(255,255,255,0.35)', fontSize: 12, marginBottom: 14 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,212,255,0.04)',
  },
  chipActive: { borderColor: '#00D4FF', backgroundColor: 'rgba(0,212,255,0.14)' },
  allergenChip: { borderColor: 'rgba(255,107,107,0.25)', backgroundColor: 'rgba(255,107,107,0.04)' },
  allergenActive: { borderColor: '#FF6B6B', backgroundColor: 'rgba(255,107,107,0.14)' },
  chipCheck: { color: '#00D4FF', fontSize: 11, fontWeight: '700' },
  chipText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#00D4FF' },
  allergenTextActive: { color: '#FF6B6B' },

  saveBtn: {
    backgroundColor: 'rgba(0,212,255,0.1)',
    borderWidth: 1.5,
    borderColor: '#00D4FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDone: { borderColor: '#00FF88', backgroundColor: 'rgba(0,255,136,0.1)' },
  saveBtnText: { color: '#00D4FF', fontSize: 15, fontWeight: '700' },
  saveBtnTextDone: { color: '#00FF88' },
});
