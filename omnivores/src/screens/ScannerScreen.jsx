import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Animated, Easing, Dimensions,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { useCamera } from '../hooks/useCamera';
import { analyzeFridge, getRecipes } from '../api/claude';
import FoodOverlay from '../components/FoodOverlay';
import RecipeSheet from '../components/RecipeSheet';
import { saveScan, getActiveFridge, getProfile, getSettings } from '../storage/db';

const { width: W, height: H } = Dimensions.get('window');

function HudRing({ size, color, duration, delay = 0 }) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration, delay, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderColor: color, transform: [{ rotate }] }]} />
  );
}

function ScanLine({ scanning }) {
  const pos = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!scanning) { pos.setValue(0); return; }
    Animated.loop(
      Animated.timing(pos, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true })
    ).start();
    return () => pos.setValue(0);
  }, [scanning]);
  const translateY = pos.interpolate({ inputRange: [0, 1], outputRange: [-H / 2, H / 2] });
  if (!scanning) return null;
  return (
    <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
  );
}

export default function ScannerScreen({ onBack, onItemsScanned, onGrocery, onMealPlan }) {
  const { cameraRef, permission, requestPermission, capture } = useCamera();
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [statusMsg, setStatusMsg] = useState('SYSTEM READY');
  const [scanIntervalMs, setScanIntervalMs] = useState(8000);

  // Load scan interval from settings on mount
  useEffect(() => {
    getSettings().then(s => {
      if (s?.scanInterval) setScanIntervalMs(s.scanInterval * 1000);
    }).catch(() => {});
  }, []);

  const glowAnim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!autoScan) return;
    const id = setInterval(() => { if (!scanning) runScan(); }, scanIntervalMs);
    return () => clearInterval(id);
  }, [autoScan, scanning, scanIntervalMs]);

  async function runScan() {
    if (scanning) return;
    setScanning(true);
    setStatusMsg('SCANNING...');
    try {
      const base64 = await capture();
      if (!base64) return;
      setStatusMsg('ANALYZING...');
      const [profile, fridgeId] = await Promise.all([getProfile(), getActiveFridge()]);
      const result = await analyzeFridge(base64, profile);
      const detected = result.items ?? [];
      setItems(detected);
      setRecipes([]);
      onItemsScanned?.(detected);
      await saveScan(fridgeId, detected);
      const urgent = detected.filter(i => i.daysLeft <= 2 && i.daysLeft > 0);
      setStatusMsg(urgent.length > 0 ? `⚠ ${urgent.length} ITEMS EXPIRING SOON` : `${detected.length} ITEMS DETECTED`);
    } catch (err) {
      setStatusMsg('SCAN ERROR');
      console.warn('Scan error:', err.message);
    } finally {
      setScanning(false);
    }
  }

  async function handleGetRecipes() {
    if (items.length === 0 || loadingRecipes) return;
    setLoadingRecipes(true);
    setStatusMsg('COMPUTING RECIPES...');
    try {
      const result = await getRecipes(items);
      setRecipes(result.recipes ?? []);
      setStatusMsg('RECIPE MATRIX LOADED');
    } catch (err) {
      setStatusMsg('RECIPE ERROR');
      console.warn('Recipe error:', err.message);
    } finally {
      setLoadingRecipes(false);
    }
  }

  return (
    <View style={styles.root}>
      {/* Camera */}
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      {/* Blue tint overlay */}
      <View style={styles.tint} pointerEvents="none" />

      {/* Scan line */}
      <ScanLine scanning={scanning} />

      {/* Corner HUD brackets */}
      <View style={[styles.cornerBracket, styles.bracketTL]} pointerEvents="none">
        <View style={[styles.bracketH, { backgroundColor: '#00D4FF' }]} />
        <View style={[styles.bracketV, { backgroundColor: '#00D4FF' }]} />
      </View>
      <View style={[styles.cornerBracket, styles.bracketTR]} pointerEvents="none">
        <View style={[styles.bracketH, { backgroundColor: '#00D4FF' }]} />
        <View style={[styles.bracketV, { backgroundColor: '#00D4FF', alignSelf: 'flex-end' }]} />
      </View>
      <View style={[styles.cornerBracket, styles.bracketBL]} pointerEvents="none">
        <View style={[styles.bracketV, { backgroundColor: '#00D4FF' }]} />
        <View style={[styles.bracketH, { backgroundColor: '#00D4FF' }]} />
      </View>
      <View style={[styles.cornerBracket, styles.bracketBR]} pointerEvents="none">
        <View style={[styles.bracketV, { backgroundColor: '#00D4FF', alignSelf: 'flex-end' }]} />
        <View style={[styles.bracketH, { backgroundColor: '#00D4FF' }]} />
      </View>

      {/* Center reticle rings */}
      <View style={styles.reticle} pointerEvents="none">
        <HudRing size={180} color="rgba(0,212,255,0.15)" duration={8000} />
        <HudRing size={130} color="rgba(0,212,255,0.25)" duration={5000} />
        <View style={styles.crosshair}>
          <View style={styles.crossH} />
          <View style={styles.crossV} />
        </View>
        <View style={styles.centerDot} />
      </View>

      {/* Status bar top center */}
      <View style={styles.statusBar} pointerEvents="none">
        <Animated.View style={[styles.statusDot, { opacity: glowAnim, backgroundColor: scanning ? '#FFB300' : '#00FF88' }]} />
        <Text style={styles.statusText}>{statusMsg}</Text>
      </View>

      {/* Food overlays */}
      <FoodOverlay items={items} />

      {/* Back to home */}
      {onBack && (
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>‹ HOME</Text>
        </TouchableOpacity>
      )}

      {/* Auto-scan toggle */}
      <TouchableOpacity
        style={[styles.autoBtn, autoScan && styles.autoBtnActive]}
        onPress={() => setAutoScan(v => !v)}
      >
        <Text style={styles.autoBtnText}>{autoScan ? '⟳ AUTO: ON' : '⟳ AUTO: OFF'}</Text>
      </TouchableOpacity>

      {/* Bottom controls */}
      <View style={styles.controls}>
        {items.length > 0 && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={onGrocery}>
              <Text style={styles.actionBtnText}>🛒 LIST</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={onMealPlan}>
              <Text style={styles.actionBtnText}>📅 PLAN</Text>
            </TouchableOpacity>
          </View>
        )}
        {items.length > 0 && (
          <TouchableOpacity
            style={[styles.recipesBtn, loadingRecipes && styles.btnDisabled]}
            onPress={handleGetRecipes}
            disabled={loadingRecipes}
          >
            {loadingRecipes
              ? <ActivityIndicator color="#00D4FF" size="small" />
              : <Text style={styles.recipesBtnText}>[ COMPUTE RECIPES ]</Text>
            }
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.scanBtn, scanning && styles.btnDisabled]}
          onPress={runScan}
          disabled={scanning}
        >
          <View style={styles.scanBtnInner}>
            {scanning
              ? <ActivityIndicator color="#00D4FF" size="small" />
              : <Text style={styles.scanBtnText}>SCAN</Text>
            }
          </View>
        </TouchableOpacity>

        {/* Bottom HUD info bar */}
        <View style={styles.infoBar} pointerEvents="none">
          <Text style={styles.infoText}>OMNIVORES v1.0</Text>
          <Text style={styles.infoText}>●</Text>
          <Text style={styles.infoText}>{items.length} ITEMS</Text>
        </View>
      </View>

      {/* Recipe sheet */}
      <RecipeSheet recipes={recipes} onClose={() => setRecipes([])} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000820', padding: 24 },

  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 30, 80, 0.18)',
  },
  scanLine: {
    position: 'absolute',
    left: 0, right: 0,
    height: 2,
    backgroundColor: 'rgba(0, 212, 255, 0.4)',
    top: H / 2,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },

  // Corner brackets
  cornerBracket: { position: 'absolute', width: 28, height: 28 },
  bracketTL: { top: 20, left: 20, justifyContent: 'flex-start' },
  bracketTR: { top: 20, right: 20, justifyContent: 'flex-start' },
  bracketBL: { bottom: 20, left: 20, justifyContent: 'flex-end' },
  bracketBR: { bottom: 20, right: 20, justifyContent: 'flex-end' },
  bracketH: { height: 2, width: 28 },
  bracketV: { width: 2, height: 14, marginTop: 2 },

  // Reticle
  reticle: {
    position: 'absolute',
    top: H / 2 - 90,
    left: W / 2 - 90,
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  crosshair: { position: 'absolute', width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  crossH: { position: 'absolute', width: 40, height: 1, backgroundColor: 'rgba(0,212,255,0.5)' },
  crossV: { position: 'absolute', width: 1, height: 40, backgroundColor: 'rgba(0,212,255,0.5)' },
  centerDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#00D4FF', position: 'absolute' },

  // Status
  statusBar: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,8,25,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { color: '#00D4FF', fontSize: 11, fontWeight: '700', letterSpacing: 2 },

  backBtn: {
    position: 'absolute',
    top: 52,
    left: 16,
    backgroundColor: 'rgba(0,8,25,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  backText: { color: '#00D4FF', fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },

  // Auto btn
  autoBtn: {
    position: 'absolute',
    top: 52,
    right: 16,
    backgroundColor: 'rgba(0,8,25,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  autoBtnActive: { borderColor: '#00D4FF', backgroundColor: 'rgba(0,212,255,0.1)' },
  autoBtnText: { color: '#00D4FF', fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },

  // Controls
  controls: {
    position: 'absolute',
    bottom: 36,
    left: 0, right: 0,
    alignItems: 'center',
    gap: 12,
  },
  scanBtn: {
    width: 72, height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#00D4FF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,30,80,0.55)',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 10,
  },
  scanBtnInner: { alignItems: 'center', justifyContent: 'center' },
  scanBtnText: { color: '#00D4FF', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  btnDisabled: { opacity: 0.3 },

  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  actionBtn: {
    backgroundColor: 'rgba(0,8,25,0.7)',
    borderWidth: 1, borderColor: 'rgba(0,212,255,0.35)',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  actionBtnText: { color: '#00D4FF', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  recipesBtn: {
    backgroundColor: 'rgba(0,8,25,0.7)',
    borderWidth: 1,
    borderColor: '#00D4FF',
    paddingHorizontal: 22,
    paddingVertical: 10,
    minWidth: 180,
    alignItems: 'center',
  },
  recipesBtnText: { color: '#00D4FF', fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },

  infoBar: { flexDirection: 'row', gap: 10, marginTop: 4 },
  infoText: { color: 'rgba(0,212,255,0.35)', fontSize: 9, letterSpacing: 1.5 },

  // Permission screen
  hudBox: {
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.4)',
    padding: 32,
    alignItems: 'center',
    position: 'relative',
    width: 280,
  },
  accentCorner: { position: 'absolute', width: 12, height: 12 },
  accentTL: { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#00D4FF' },
  accentTR: { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#00D4FF' },
  accentBL: { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#00D4FF' },
  accentBR: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#00D4FF' },
  hudTitle: { color: '#00D4FF', fontSize: 14, fontWeight: '700', letterSpacing: 3, marginBottom: 14 },
  hudSub: { color: '#7ECFEF', fontSize: 11, textAlign: 'center', letterSpacing: 1, lineHeight: 18, marginBottom: 24 },
  hudBtn: { borderWidth: 1, borderColor: '#00D4FF', paddingHorizontal: 20, paddingVertical: 10 },
  hudBtnText: { color: '#00D4FF', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
});
