import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function RecipeCard({ recipe }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setExpanded(e => !e)} activeOpacity={0.8}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{recipe.name}</Text>
            <Text style={styles.time}>{recipe.timeMinutes}m</Text>
          </View>
          {recipe.usesBefore?.length > 0 && (
            <Text style={styles.usesBefore}>Uses: {recipe.usesBefore.join(', ')}</Text>
          )}
          <Text style={styles.toggle}>{expanded ? '▲ Hide steps' : '▼ Show steps'}</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          <Text style={styles.sectionLabel}>Ingredients</Text>
          {recipe.ingredients.map((ing, i) => (
            <Text key={i} style={styles.ingredient}>• {ing}</Text>
          ))}
          <Text style={[styles.sectionLabel, { marginTop: 12 }]}>Steps</Text>
          {recipe.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Text style={styles.stepNum}>{i + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: { padding: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { color: '#fff', fontSize: 17, fontWeight: '700', flex: 1 },
  time: { color: '#4CAF50', fontSize: 14, fontWeight: '600' },
  usesBefore: { color: '#FF9800', fontSize: 13, marginBottom: 8 },
  toggle: { color: '#888', fontSize: 13 },
  body: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#2a2a2a', paddingTop: 12 },
  sectionLabel: { color: '#aaa', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  ingredient: { color: '#ccc', fontSize: 14, marginBottom: 3 },
  stepRow: { flexDirection: 'row', marginBottom: 8, gap: 10 },
  stepNum: { color: '#4CAF50', fontWeight: '700', fontSize: 14, width: 20 },
  stepText: { color: '#ccc', fontSize: 14, flex: 1, lineHeight: 20 },
});
