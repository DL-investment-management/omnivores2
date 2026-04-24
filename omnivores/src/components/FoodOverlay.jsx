import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const CONDITION_COLORS = {
  fresh: '#00FF88',
  good: '#00D4FF',
  aging: '#FFB300',
  spoiled: '#FF3D3D',
};

const CONDITION_LABEL = {
  fresh: 'NOMINAL',
  good: 'STABLE',
  aging: 'DEGRADING',
  spoiled: 'CRITICAL',
};

function HudChip({ item, index }) {
  const slideAnim = useRef(new Animated.Value(-40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const color = CONDITION_COLORS[item.condition] ?? '#00D4FF';
  const label = CONDITION_LABEL[item.condition] ?? item.condition.toUpperCase();

  return (
    <Animated.View style={[styles.chip, { borderColor: color, opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
      {/* Corner brackets */}
      <View style={[styles.cornerTL, { borderColor: color }]} />
      <View style={[styles.cornerBR, { borderColor: color }]} />

      <View style={styles.chipInner}>
        <Text style={[styles.chipName, { color: '#E0F7FF' }]}>{item.name.toUpperCase()}</Text>
        <View style={styles.chipRow}>
          <Text style={[styles.chipStatus, { color }]}>{label}</Text>
          <Text style={[styles.chipDays, { color }]}>
            {item.daysLeft === 0 ? '⚠ EXPIRED' : `${item.daysLeft}D`}
          </Text>
        </View>
      </View>

      {/* Pulse dot */}
      <View style={[styles.dot, { backgroundColor: color }]} />
    </Animated.View>
  );
}

export default function FoodOverlay({ items = [] }) {
  if (items.length === 0) return null;
  const sorted = [...items].sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <View style={styles.container}>
      {sorted.map((item, i) => (
        <HudChip key={`${item.name}-${i}`} item={item} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 72,
    left: 16,
    right: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(0, 20, 50, 0.55)',
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: -1, left: -1,
    width: 8, height: 8,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderColor: '#00D4FF',
  },
  cornerBR: {
    position: 'absolute',
    bottom: -1, right: -1,
    width: 8, height: 8,
    borderBottomWidth: 2, borderRightWidth: 2,
    borderColor: '#00D4FF',
  },
  chipInner: { paddingRight: 16 },
  chipRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  chipName: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  chipStatus: { fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  chipDays: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  dot: {
    position: 'absolute',
    top: 8, right: 10,
    width: 5, height: 5,
    borderRadius: 3,
  },
});
