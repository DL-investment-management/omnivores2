import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Easing, Dimensions, Linking,
} from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

function Ring({ size, duration, delay = 0, opacity = 0.18 }) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration, delay, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={[styles.ring, {
      width: size, height: size, borderRadius: size / 2,
      opacity, transform: [{ rotate }],
    }]} />
  );
}

function TypeWriter({ text, style, speed = 55, onDone }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(id); onDone?.(); }
    }, speed);
    return () => clearInterval(id);
  }, [text]);
  return <Text style={style}>{displayed}<Text style={{ opacity: 0.5 }}>_</Text></Text>;
}

function BootLine({ text, delay, color = '#00D4FF' }) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 200, delay, useNativeDriver: true }).start();
  }, []);
  return <Animated.Text style={[styles.bootLine, { color, opacity: fade }]}>{text}</Animated.Text>;
}

export default function HomeScreen({ onStart }) {
  const [phase, setPhase] = useState('boot'); // boot → title → ready
  const btnScale = useRef(new Animated.Value(0)).current;
  const arcOpacity = useRef(new Animated.Value(0)).current;
  const arcScale = useRef(new Animated.Value(0.6)).current;
  const glowPulse = useRef(new Animated.Value(0.5)).current;

  const BOOT_LINES = [
    { text: '> INITIALIZING OMNIVORES SYSTEM...', delay: 200 },
    { text: '> LOADING VISION PROTOCOLS...', delay: 700 },
    { text: '> GEMINI NEURAL LINK: ESTABLISHED', delay: 1200 },
    { text: '> FOOD ANALYSIS MODULE: ONLINE', delay: 1700 },
    { text: '> RECIPE ENGINE: ONLINE', delay: 2100 },
    { text: '> ALL SYSTEMS NOMINAL', delay: 2500, color: '#00FF88' },
  ];

  useEffect(() => {
    // After boot lines finish, transition to title
    const t = setTimeout(() => {
      setPhase('title');
      Animated.parallel([
        Animated.spring(arcScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(arcOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]).start();
    }, 3200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== 'ready') return;
    Animated.spring(btnScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [phase]);

  return (
    <View style={styles.root}>

      {/* Background grid */}
      <View style={styles.grid} pointerEvents="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={[styles.gridLine, { top: (H / 12) * i }]} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={[styles.gridCol, { left: (W / 8) * i }]} />
        ))}
      </View>

      {/* Corner brackets */}
      {[styles.bTL, styles.bTR, styles.bBL, styles.bBR].map((pos, i) => (
        <View key={i} style={[styles.bracket, pos]} pointerEvents="none">
          <View style={styles.bH} /><View style={styles.bV} />
        </View>
      ))}

      {/* Main content — flex: 1 to push nav to bottom */}
      <View style={styles.main}>
        {phase === 'boot' && (
          <View style={styles.bootContainer}>
            {BOOT_LINES.map((l, i) => <BootLine key={i} {...l} />)}
          </View>
        )}

        {phase !== 'boot' && (
          <Animated.View style={[styles.center, { opacity: arcOpacity, transform: [{ scale: arcScale }] }]}>
            <View style={styles.ringsWrap} pointerEvents="none">
              <Ring size={320} duration={20000} opacity={0.08} />
              <Ring size={240} duration={12000} delay={500} opacity={0.12} />
              <Ring size={160} duration={7000} delay={200} opacity={0.2} />
              <Ring size={90} duration={4000} opacity={0.3} />
              <View style={styles.arcOuter}>
                <View style={styles.arcMid}>
                  <View style={styles.arcInner} />
                </View>
              </View>
            </View>

            <View style={styles.titleWrap}>
              <Text style={styles.eyebrow}>// STARK KITCHEN TECH</Text>
              {phase === 'title' && (
                <TypeWriter text="OMNIVORES" style={styles.title} speed={80} onDone={() => setPhase('ready')} />
              )}
              {phase === 'ready' && <Text style={styles.title}>OMNIVORES</Text>}
              <Text style={styles.subtitle}>FRIDGE INTELLIGENCE SYSTEM</Text>
            </View>

            <View style={styles.statsRow}>
              {[
                { label: 'SCAN MODE', value: 'REAL-TIME' },
                { label: 'AI ENGINE', value: 'GEMINI 2.0' },
                { label: 'STATUS', value: 'ONLINE' },
              ].map((s, i) => (
                <View key={i} style={styles.statBox}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {phase === 'ready' && (
              <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                <TouchableOpacity style={styles.launchBtn} onPress={onStart} activeOpacity={0.8}>
                  <Animated.View style={[styles.launchGlow, { opacity: glowPulse }]} />
                  <Text style={styles.launchText}>[ INITIALIZE SCAN ]</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        )}
      </View>

      {/* Bottom nav — sits at bottom of flex column */}
      <View style={styles.navBar}>
        <View style={styles.navDivider} />
        <View style={styles.navTabs}>
          {[
            { icon: '◈', label: 'PROFILE',      onPress: () => {} },
            { icon: '✉', label: 'CONTACT',      onPress: () => Linking.openURL('mailto:donaldliang45@gmail.com') },
            { icon: '❄', label: 'FRIDGE VAULT', onPress: () => {} },
            { icon: '⚙', label: 'SETTINGS',     onPress: () => {} },
          ].map((tab, i) => (
            <TouchableOpacity key={i} style={styles.navTab} onPress={tab.onPress} activeOpacity={0.7}>
              <Text style={styles.navIcon}>{tab.icon}</Text>
              <Text style={styles.navLabel}>{tab.label}</Text>
              <View style={styles.navUnderline} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000A1A',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Grid background
  grid: { ...StyleSheet.absoluteFillObject },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,212,255,0.04)' },
  gridCol: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(0,212,255,0.04)' },

  // Corner brackets
  bracket: { position: 'absolute', width: 24, height: 24 },
  bTL: { top: 24, left: 24 },
  bTR: { top: 24, right: 24, alignItems: 'flex-end' },
  bBL: { bottom: 24, left: 24, justifyContent: 'flex-end' },
  bBR: { bottom: 24, right: 24, alignItems: 'flex-end', justifyContent: 'flex-end' },
  bH: { height: 2, width: 24, backgroundColor: '#00D4FF', opacity: 0.5 },
  bV: { width: 2, height: 14, backgroundColor: '#00D4FF', opacity: 0.5 },

  // Boot screen
  bootContainer: {
    padding: 32,
    width: '100%',
    maxWidth: 480,
  },
  bootLine: {
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 6,
  },

  // Main content
  center: { alignItems: 'center', width: '100%', paddingHorizontal: 32 },

  // Rings + arc reactor
  ringsWrap: {
    width: 320, height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#00D4FF',
  },
  arcOuter: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 2, borderColor: '#00D4FF',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,212,255,0.08)',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
  },
  arcMid: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 1, borderColor: 'rgba(0,212,255,0.6)',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,212,255,0.05)',
  },
  arcInner: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#00D4FF',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },

  // Title
  titleWrap: { alignItems: 'center', marginBottom: 32 },
  eyebrow: { color: 'rgba(0,212,255,0.45)', fontSize: 10, letterSpacing: 3, marginBottom: 8 },
  title: {
    color: '#00D4FF',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 10,
    textShadowColor: '#00D4FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: { color: 'rgba(0,212,255,0.5)', fontSize: 11, letterSpacing: 4, marginTop: 8 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  statBox: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 90,
  },
  statValue: { color: '#00D4FF', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  statLabel: { color: 'rgba(0,212,255,0.4)', fontSize: 8, letterSpacing: 1.5, marginTop: 3 },

  // Launch button
  launchBtn: {
    borderWidth: 1,
    borderColor: '#00D4FF',
    paddingHorizontal: 36,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 40,
  },
  launchGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,212,255,0.12)',
  },
  launchText: {
    color: '#00D4FF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 3,
  },

  // Bottom nav
  navBar: {
    paddingBottom: 28,
    paddingTop: 4,
    width: '100%',
  },
  navDivider: {
    height: 1,
    backgroundColor: 'rgba(0,212,255,0.15)',
    marginHorizontal: 40,
    marginBottom: 20,
  },
  navTabs: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  navTab: {
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  navIcon: {
    fontSize: 18,
    color: '#00D4FF',
    opacity: 0.8,
  },
  navLabel: {
    color: 'rgba(0,212,255,0.55)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  navUnderline: {
    height: 1,
    width: 20,
    backgroundColor: 'rgba(0,212,255,0.25)',
    marginTop: 2,
  },
});
