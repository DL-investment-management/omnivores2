import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { getProfile, saveProfile } from '../storage/db';
import HudScreen from '../components/HudScreen';

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Kosher'];
const ALLERGEN_OPTIONS = ['Nuts', 'Dairy', 'Eggs', 'Gluten', 'Soy', 'Shellfish', 'Fish', 'Sesame'];

export default function ProfileScreen({ onBack }) {
  const [name, setName]         = useState('');
  const [dietary, setDietary]   = useState([]);
  const [allergens, setAllergens] = useState([]);
  const [saved, setSaved]       = useState(false);

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
    <HudScreen title="// PILOT PROFILE" onBack={onBack}>
      <Text style={styles.label}>DISPLAY NAME</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="ENTER NAME..."
        placeholderTextColor="rgba(0,212,255,0.25)"
      />

      <Text style={[styles.label, { marginTop: 24 }]}>DIETARY PROTOCOLS</Text>
      <View style={styles.chips}>
        {DIETARY_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, dietary.includes(opt) && styles.chipActive]}
            onPress={() => toggle(dietary, setDietary, opt)}
          >
            <Text style={[styles.chipText, dietary.includes(opt) && styles.chipTextActive]}>{opt.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { marginTop: 24 }]}>ALLERGEN ALERTS</Text>
      <View style={styles.chips}>
        {ALLERGEN_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, styles.allergenChip, allergens.includes(opt) && styles.allergenActive]}
            onPress={() => toggle(allergens, setAllergens, opt)}
          >
            <Text style={[styles.chipText, allergens.includes(opt) && styles.allergenTextActive]}>{opt.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>{saved ? '✓ SAVED' : '[ SAVE PROFILE ]'}</Text>
      </TouchableOpacity>
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  label: { color: 'rgba(0,212,255,0.45)', fontSize: 9, letterSpacing: 2, marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: 'rgba(0,212,255,0.25)',
    color: '#E0F7FF', fontSize: 13, padding: 12,
    backgroundColor: 'rgba(0,20,50,0.4)',
    ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)', paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { borderColor: '#00D4FF', backgroundColor: 'rgba(0,212,255,0.12)' },
  allergenChip: { borderColor: 'rgba(255,61,61,0.2)' },
  allergenActive: { borderColor: '#FF3D3D', backgroundColor: 'rgba(255,61,61,0.1)' },
  chipText: { color: 'rgba(0,212,255,0.4)', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  chipTextActive: { color: '#00D4FF' },
  allergenTextActive: { color: '#FF3D3D' },
  saveBtn: { marginTop: 32, borderWidth: 1, borderColor: '#00D4FF', padding: 14, alignItems: 'center' },
  saveBtnText: { color: '#00D4FF', fontSize: 12, fontWeight: '700', letterSpacing: 2 },
});
