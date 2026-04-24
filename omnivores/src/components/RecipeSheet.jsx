import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, ScrollView,
  TouchableOpacity, Dimensions, PanResponder,
} from 'react-native';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_PEEK = 110;

export default function RecipeSheet({ recipes = [], onClose }) {
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const [expanded, setExpanded] = useState(false);
  const [openRecipe, setOpenRecipe] = useState(null);

  useEffect(() => {
    if (recipes.length > 0) {
      setExpanded(false);
      setOpenRecipe(null);
      Animated.spring(translateY, {
        toValue: SCREEN_H - SHEET_PEEK,
        useNativeDriver: true,
        tension: 55,
        friction: 10,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_H,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [recipes]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => {
        const base = expanded ? 0 : SCREEN_H - SHEET_PEEK;
        const next = base + g.dy;
        if (next >= 0) translateY.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy < -50) {
          setExpanded(true);
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 55, friction: 10 }).start();
        } else if (g.dy > 60) {
          if (expanded) {
            setExpanded(false);
            Animated.spring(translateY, { toValue: SCREEN_H - SHEET_PEEK, useNativeDriver: true, tension: 55, friction: 10 }).start();
          } else {
            onClose?.();
          }
        } else {
          Animated.spring(translateY, {
            toValue: expanded ? 0 : SCREEN_H - SHEET_PEEK,
            useNativeDriver: true, tension: 55, friction: 10,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
      {/* Corner accents */}
      <View style={[styles.accentTL, styles.accent]} />
      <View style={[styles.accentTR, styles.accent]} />

      <View {...panResponder.panHandlers} style={styles.handle}>
        <View style={styles.pill} />
        <View style={styles.titleRow}>
          <Text style={styles.titleLabel}>// RECIPE MATRIX</Text>
          <Text style={styles.titleCount}>{recipes.length} PROTOCOLS LOADED</Text>
        </View>
        <View style={styles.divider} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {recipes.map((recipe, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.recipeRow, openRecipe === i && styles.recipeRowOpen]}
            onPress={() => setOpenRecipe(openRecipe === i ? null : i)}
            activeOpacity={0.85}
          >
            <View style={styles.recipeHeader}>
              <View style={styles.recipeIndex}>
                <Text style={styles.indexText}>{String(i + 1).padStart(2, '0')}</Text>
              </View>
              <View style={styles.recipeMeta}>
                <Text style={styles.recipeName}>{recipe.name.toUpperCase()}</Text>
                {recipe.usesBefore?.length > 0 && (
                  <Text style={styles.usesBefore}>⚠ USES: {recipe.usesBefore.join(' · ').toUpperCase()}</Text>
                )}
              </View>
              <Text style={styles.recipeTime}>{recipe.timeMinutes}M</Text>
              <Text style={styles.toggleArrow}>{openRecipe === i ? '▲' : '▼'}</Text>
            </View>

            {openRecipe === i && (
              <View style={styles.recipeBody}>
                <View style={styles.sectionDivider} />
                <Text style={styles.sectionLabel}>[ COMPONENTS ]</Text>
                {recipe.ingredients.map((ing, j) => (
                  <Text key={j} style={styles.ingredient}>›  {ing}</Text>
                ))}
                <Text style={[styles.sectionLabel, { marginTop: 12 }]}>[ SEQUENCE ]</Text>
                {recipe.steps.map((step, j) => (
                  <View key={j} style={styles.stepRow}>
                    <Text style={styles.stepNum}>{String(j + 1).padStart(2, '0')}</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}
        <View style={{ height: 50 }} />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: SCREEN_H,
    backgroundColor: 'rgba(0, 8, 25, 0.82)',
    borderTopWidth: 1,
    borderTopColor: '#00D4FF',
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    top: 0,
    width: 20, height: 20,
    borderTopWidth: 2,
  },
  accentTL: { left: 0, borderLeftWidth: 2, borderColor: '#00D4FF' },
  accentTR: { right: 0, borderRightWidth: 2, borderColor: '#00D4FF' },
  handle: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  pill: {
    width: 36, height: 3,
    backgroundColor: '#00D4FF',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
    opacity: 0.6,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  titleLabel: { color: '#00D4FF', fontSize: 13, fontWeight: '700', letterSpacing: 2 },
  titleCount: { color: '#004D80', fontSize: 10, letterSpacing: 1 },
  divider: { height: 1, backgroundColor: '#00D4FF', opacity: 0.2, marginBottom: 4 },

  scroll: { flex: 1 },
  recipeRow: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 255, 0.12)',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  recipeRowOpen: { backgroundColor: 'rgba(0, 212, 255, 0.05)' },
  recipeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  recipeIndex: {
    width: 28, height: 28,
    borderWidth: 1,
    borderColor: '#00D4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexText: { color: '#00D4FF', fontSize: 10, fontWeight: '700' },
  recipeMeta: { flex: 1 },
  recipeName: { color: '#E0F7FF', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  usesBefore: { color: '#FFB300', fontSize: 10, marginTop: 2, letterSpacing: 0.5 },
  recipeTime: { color: '#00D4FF', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  toggleArrow: { color: '#004D80', fontSize: 10, marginLeft: 6 },

  recipeBody: { marginTop: 12 },
  sectionDivider: { height: 1, backgroundColor: '#00D4FF', opacity: 0.15, marginBottom: 10 },
  sectionLabel: { color: '#004D80', fontSize: 9, letterSpacing: 2, marginBottom: 6 },
  ingredient: { color: '#7ECFEF', fontSize: 12, marginBottom: 3, letterSpacing: 0.3 },
  stepRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  stepNum: { color: '#00D4FF', fontSize: 10, fontWeight: '700', width: 20, marginTop: 1 },
  stepText: { color: '#A8D8EA', fontSize: 12, flex: 1, lineHeight: 18 },
});
