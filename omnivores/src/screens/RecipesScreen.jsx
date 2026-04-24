import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import RecipeCard from '../components/RecipeCard';

export default function RecipesScreen({ route, navigation }) {
  const { recipes = [] } = route.params ?? {};

  if (recipes.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No recipes yet. Scan your fridge first.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Scanner')}>
          <Text style={styles.btnText}>Scan Fridge</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.header}>Use what you have before it's gone</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 24 },
  empty: { color: '#aaa', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  list: { padding: 16 },
  header: { color: '#888', fontSize: 13, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 },
  btn: { backgroundColor: '#4CAF50', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
