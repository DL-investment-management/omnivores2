import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CONDITION_COLORS = {
  fresh: '#4CAF50',
  good: '#8BC34A',
  aging: '#FF9800',
  spoiled: '#F44336',
};

const CONDITION_LABELS = {
  fresh: '🟢 Fresh',
  good: '🟡 Good',
  aging: '🟠 Aging',
  spoiled: '🔴 Spoiled',
};

export default function FoodCard({ item }) {
  const color = CONDITION_COLORS[item.condition] ?? '#888';
  const label = CONDITION_LABELS[item.condition] ?? item.condition;
  const allergen = item.allergenAlert;

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.row}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={[styles.days, item.daysLeft <= 1 && styles.urgent]}>
          {item.daysLeft === 0 ? 'Expired' : `${item.daysLeft}d left`}
        </Text>
      </View>
      <Text style={[styles.condition, { color }]}>{label}</Text>
      {allergen && (
        <Text style={{ color: '#FF6B6B', fontWeight: 'bold', marginBottom: 2 }}>⚠ Allergen Alert</Text>
      )}
      {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1 },
  days: { color: '#aaa', fontSize: 14, fontWeight: '500' },
  urgent: { color: '#F44336', fontWeight: '700' },
  condition: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  notes: { color: '#888', fontSize: 13, marginTop: 4 },
});
