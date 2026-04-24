import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import FoodCard from '../components/FoodCard';
import { getRecipes } from '../api/claude';

export default function ResultsScreen({ route, navigation }) {
  const { items = [] } = route.params ?? {};
  const [loading, setLoading] = useState(false);

  const sorted = [...items].sort((a, b) => a.daysLeft - b.daysLeft);

  async function handleGetRecipes() {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const result = await getRecipes(items);
      navigation.navigate('Recipes', { recipes: result.recipes });
    } catch (err) {
      Alert.alert('Failed to get recipes', err.message);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No items found. Try scanning your fridge.</Text>
        <TouchableOpacity style={styles.scanAgainBtn} onPress={() => navigation.navigate('Scanner')}>
          <Text style={styles.scanAgainText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sorted}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => <FoodCard item={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.header}>{sorted.length} items found</Text>
        }
      />
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.recipesBtn, loading && styles.disabled]}
          onPress={handleGetRecipes}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.recipesBtnText}>Get Recipes Before It Expires</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 24 },
  empty: { color: '#aaa', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  list: { padding: 16, paddingBottom: 100 },
  header: { color: '#888', fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 16,
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  recipesBtn: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabled: { backgroundColor: '#555' },
  recipesBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  scanAgainBtn: { backgroundColor: '#333', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  scanAgainText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
