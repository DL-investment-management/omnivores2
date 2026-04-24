import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function HudScreen({ title, subtitle, onBack, headerRight, children }) {
  return (
    <View style={styles.root}>
      {/* Subtle grid */}
      <View style={styles.grid} pointerEvents="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={[styles.gridLine, { top: `${(100 / 12) * i}%` }]} />
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ) : <View style={styles.backPlaceholder} />}
          {headerRight || null}
        </View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.headerLine} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: '100vh', backgroundColor: '#060B18' },

  grid: { ...StyleSheet.absoluteFillObject, pointerEvents: 'none' },
  gridLine: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(0,212,255,0.03)',
  },

  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 0,
    backgroundColor: 'rgba(6,11,24,0.95)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,212,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  backArrow: { color: '#00D4FF', fontSize: 16, lineHeight: 18 },
  backText:  { color: '#00D4FF', fontSize: 13, fontWeight: '600' },
  backPlaceholder: { width: 80 },

  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(0,212,255,0.55)',
    fontSize: 13,
    marginBottom: 8,
  },
  headerLine: {
    height: 1,
    backgroundColor: 'rgba(0,212,255,0.12)',
    marginTop: 16,
    marginBottom: 0,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 20 },
});
