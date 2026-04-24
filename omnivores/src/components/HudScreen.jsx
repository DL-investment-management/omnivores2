import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';

const { width: W } = Dimensions.get('window');

export default function HudScreen({ title, onBack, children }) {
  return (
    <View style={styles.root}>
      {/* Grid */}
      <View style={styles.grid} pointerEvents="none">
        {Array.from({ length: 14 }).map((_, i) => (
          <View key={i} style={[styles.gridLine, { top: `${(100 / 14) * i}%` }]} />
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>‹ BACK</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerLine} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {children}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: '100vh', backgroundColor: '#000A1A' },
  grid: { ...StyleSheet.absoluteFillObject, pointerEvents: 'none' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,212,255,0.04)' },
  header: { paddingTop: 24, paddingHorizontal: 24, paddingBottom: 16 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#00D4FF', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  title: { color: '#00D4FF', fontSize: 14, fontWeight: '700', letterSpacing: 3, marginBottom: 10 },
  headerLine: { height: 1, backgroundColor: 'rgba(0,212,255,0.2)' },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 16 },
});
