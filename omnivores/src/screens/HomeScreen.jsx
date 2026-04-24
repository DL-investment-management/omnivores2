import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Easing, Dimensions, Linking, ScrollView,
} from 'react-native';

const { width: W } = Dimensions.get('window');

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

const FEATURES = [
  { icon: '⬡', title: 'REAL-TIME SCAN',    desc: 'Live camera analysis of your fridge contents' },
  { icon: '⬡', title: 'EXPIRY TRACKING',   desc: 'AI estimates days left on every item' },
  { icon: '⬡', title: 'CONDITION RATING',  desc: 'Fresh → Good → Aging → Critical status' },
  { icon: '⬡', title: 'RECIPE ENGINE',     desc: '3 recipes generated from items expiring soonest' },
  { icon: '⬡', title: 'FRIDGE VAULT',      desc: 'Save and compare scans over time' },
  { icon: '⬡', title: 'AUTO-SCAN MODE',    desc: 'Continuous scan every 8 seconds' },
];

const BOOT_LINES = [
  { text: '> INITIALIZING OMNIVORES SYSTEM...', delay: 200 },
  { text: '> LOADING VISION PROTOCOLS...',      delay: 700 },
  { text: '> GEMINI NEURAL LINK: ESTABLISHED',  delay: 1200 },
  { text: '> FOOD ANALYSIS MODULE: ONLINE',     delay: 1700 },
  { text: '> RECIPE ENGINE: ONLINE',            delay: 2100 },
  { text: '> ALL SYSTEMS NOMINAL',              delay: 2500, color: '#00FF88' },
];

export default function HomeScreen({ onStart, onNav }) {
  const [phase, setPhase] = useState('boot');
  const btnScale  = useRef(new Animated.Value(0)).current;
  const arcOpacity = useRef(new Animated.Value(0)).current;
  const arcScale   = useRef(new Animated.Value(0.6)).current;
  const glowPulse  = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('title');
      Animated.parallel([
        Animated.spring(arcScale,   { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
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
        Animated.timing(glowPulse, { toValue: 1,   duration: 1000, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [phase]);

  return (
    <View style={styles.root}>
      {/* Grid */}
      <View style={styles.gridOverlay} pointerEvents="none">
        {Array.from({ length: 14 }).map((_, i) => <View key={`h${i}`} style={[styles.gridLine, { top: `${(100 / 14) * i}%` }]} />)}
        {Array.from({ length: 10 }).map((_, i) => <View key={`v${i}`} style={[styles.gridCol,  { left: `${(100 / 10) * i}%` }]} />)}
      </View>

      {/* Corner brackets */}
      <View style={[styles.bracket, styles.bTL]}><View style={styles.bH} /><View style={styles.bV} /></View>
      <View style={[styles.bracket, styles.bTR]}><View style={styles.bH} /><View style={[styles.bV, { alignSelf: 'flex-end' }]} /></View>
      <View style={[styles.bracket, styles.bBL]}><View style={styles.bV} /><View style={styles.bH} /></View>
      <View style={[styles.bracket, styles.bBR]}><View style={[styles.bV, { alignSelf: 'flex-end' }]} /><View style={styles.bH} /></View>

      {/* Scrollable main content */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Boot phase */}
        {phase === 'boot' && (
          <View style={styles.bootContainer}>
            {BOOT_LINES.map((l, i) => <BootLine key={i} {...l} />)}
          </View>
        )}

        {/* Hero */}
        {phase !== 'boot' && (
          <Animated.View style={[styles.hero, { opacity: arcOpacity, transform: [{ scale: arcScale }] }]}>
            <View style={styles.ringsWrap} pointerEvents="none">
              <Ring size={260} duration={20000} opacity={0.08} />
              <Ring size={190} duration={12000} delay={500} opacity={0.14} />
              <Ring size={130} duration={7000}  delay={200} opacity={0.22} />
              <Ring size={72}  duration={4000}  opacity={0.35} />
              <View style={styles.arcOuter}><View style={styles.arcMid}><View style={styles.arcInner} /></View></View>
            </View>

            <Text style={styles.eyebrow}>// STARK KITCHEN TECH</Text>
            {phase === 'title' && (
              <TypeWriter text="OMNIVORES" style={styles.title} speed={80} onDone={() => setPhase('ready')} />
            )}
            {phase === 'ready' && <Text style={styles.title}>OMNIVORES</Text>}
            <Text style={styles.subtitle}>FRIDGE INTELLIGENCE SYSTEM</Text>

            <View style={styles.statsRow}>
              {[
                { label: 'SCAN MODE', value: 'REAL-TIME' },
                { label: 'AI ENGINE', value: 'GEMINI 2.0' },
                { label: 'STATUS',    value: 'ONLINE' },
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

        {/* Features list */}
        {phase === 'ready' && (
          <View style={styles.featuresSection}>
            <View style={styles.featuresDivider} />
            <Text style={styles.featuresHeader}>// SYSTEM CAPABILITIES</Text>
            <View style={styles.featuresGrid}>
              {FEATURES.map((f, i) => (
                <View key={i} style={styles.featureCard}>
                  <View style={styles.featureCardTL} /><View style={styles.featureCardBR} />
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Nav bar — absolutely pinned to bottom */}
      <View style={styles.navBar}>
        <View style={styles.navDivider} />
        <View style={styles.navTabs}>
          {[
            { icon: '◈', label: 'PROFILE',      onPress: () => onNav?.('profile') },
            { icon: '✉', label: 'CONTACT',      onPress: () => Linking.openURL('mailto:donaldliang45@gmail.com') },
            { icon: '❄', label: 'FRIDGE VAULT', onPress: () => onNav?.('vault') },
            { icon: '⚙', label: 'SETTINGS',     onPress: () => onNav?.('settings') },
          ].map((tab, i) => (
            <TouchableOpacity key={i} style={styles.navTab} onPress={tab.onPress} activeOpacity={0.7}>
              <Text style={styles.navIcon}>{tab.icon}</Text>
              <Text style={styles.navLabel}>{tab.label}</Text>
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
    minHeight: '100vh',
    backgroundColor: '#000A1A',
  },

  gridOverlay: { ...StyleSheet.absoluteFillObject, pointerEvents: 'none' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,212,255,0.04)' },
  gridCol:  { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(0,212,255,0.04)' },

  bracket: { position: 'absolute', width: 24, height: 24, zIndex: 10 },
  bTL: { top: 20, left: 20 },
  bTR: { top: 20, right: 20, alignItems: 'flex-end' },
  bBL: { bottom: 80, left: 20, justifyContent: 'flex-end' },
  bBR: { bottom: 80, right: 20, alignItems: 'flex-end', justifyContent: 'flex-end' },
  bH: { height: 2, width: 24, backgroundColor: '#00D4FF', opacity: 0.5 },
  bV: { width: 2, height: 14, backgroundColor: '#00D4FF', opacity: 0.5 },

  scroll: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },

  bootContainer: { padding: 32, width: '100%', maxWidth: 480, marginTop: 80 },
  bootLine: { fontFamily: 'monospace', fontSize: 12, letterSpacing: 1, marginBottom: 6 },

  // Hero
  hero: { alignItems: 'center', width: '100%', paddingHorizontal: 32 },
  ringsWrap: { width: 260, height: 260, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  ring: { position: 'absolute', borderWidth: 1, borderStyle: 'dashed', borderColor: '#00D4FF' },
  arcOuter: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#00D4FF',
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,212,255,0.08)',
    shadowColor: '#00D4FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 14,
  },
  arcMid: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,212,255,0.6)', justifyContent: 'center', alignItems: 'center' },
  arcInner: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#00D4FF', shadowColor: '#00D4FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10 },

  eyebrow: { color: 'rgba(0,212,255,0.45)', fontSize: 10, letterSpacing: 3, marginBottom: 8 },
  title: { color: '#00D4FF', fontSize: 48, fontWeight: '900', letterSpacing: 10, textShadowColor: '#00D4FF', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  subtitle: { color: 'rgba(0,212,255,0.5)', fontSize: 11, letterSpacing: 4, marginTop: 6, marginBottom: 28 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statBox: { alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)', paddingHorizontal: 14, paddingVertical: 10, minWidth: 90 },
  statValue: { color: '#00D4FF', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  statLabel: { color: 'rgba(0,212,255,0.4)', fontSize: 8, letterSpacing: 1.5, marginTop: 3 },

  launchBtn: { borderWidth: 1, borderColor: '#00D4FF', paddingHorizontal: 36, paddingVertical: 16, alignItems: 'center', position: 'relative', overflow: 'hidden', marginBottom: 16 },
  launchGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,212,255,0.12)' },
  launchText: { color: '#00D4FF', fontSize: 14, fontWeight: '700', letterSpacing: 3 },

  // Features
  featuresSection: { width: '100%', maxWidth: 860, paddingHorizontal: 32, marginTop: 20 },
  featuresDivider: { height: 1, backgroundColor: 'rgba(0,212,255,0.15)', marginBottom: 20 },
  featuresHeader: { color: 'rgba(0,212,255,0.45)', fontSize: 10, letterSpacing: 3, marginBottom: 20 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featureCard: {
    flex: 1, minWidth: 220,
    backgroundColor: 'rgba(0,20,50,0.5)',
    borderWidth: 1, borderColor: 'rgba(0,212,255,0.15)',
    padding: 16, position: 'relative',
  },
  featureCardTL: { position: 'absolute', top: -1, left: -1, width: 8, height: 8, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#00D4FF' },
  featureCardBR: { position: 'absolute', bottom: -1, right: -1, width: 8, height: 8, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#00D4FF' },
  featureIcon:  { color: '#00D4FF', fontSize: 16, marginBottom: 8, opacity: 0.7 },
  featureTitle: { color: '#E0F7FF', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  featureDesc:  { color: 'rgba(0,212,255,0.4)', fontSize: 11, lineHeight: 16 },

  // Nav bar
  navBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,8,20,0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,212,255,0.2)',
    paddingBottom: 16,
    zIndex: 100,
  },
  navDivider: { height: 1, backgroundColor: 'rgba(0,212,255,0.08)', marginBottom: 0 },
  navTabs: { flexDirection: 'row', justifyContent: 'space-evenly', paddingTop: 12, paddingHorizontal: 16 },
  navTab: { alignItems: 'center', gap: 4, paddingHorizontal: 20, paddingVertical: 4 },
  navIcon:  { fontSize: 18, color: '#00D4FF', opacity: 0.8 },
  navLabel: { color: 'rgba(0,212,255,0.6)', fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
});
