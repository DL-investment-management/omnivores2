import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Easing, Dimensions, Linking, ScrollView,
} from 'react-native';

const { width: W } = Dimensions.get('window');

/* ── Spinning ring ─────────────────────────────────────────────────────────── */
function Ring({ size, duration, delay = 0, opacity = 0.18, reverse = false }) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration, delay, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);
  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? ['360deg', '0deg'] : ['0deg', '360deg'],
  });
  return (
    <Animated.View style={[styles.ring, {
      width: size, height: size, borderRadius: size / 2,
      opacity, transform: [{ rotate }],
    }]} />
  );
}

/* ── Typewriter ────────────────────────────────────────────────────────────── */
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
  return <Text style={style}>{displayed}<Text style={{ opacity: 0.4 }}>|</Text></Text>;
}

/* ── Boot line ─────────────────────────────────────────────────────────────── */
function BootLine({ text, delay, color = 'rgba(0,212,255,0.7)' }) {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 250, delay, useNativeDriver: true }).start();
  }, []);
  return <Animated.Text style={[styles.bootLine, { color, opacity: fade }]}>{text}</Animated.Text>;
}

/* ── Data ──────────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: '📷', title: 'Real-Time Scan',      desc: 'Live camera analysis of fridge contents in seconds' },
  { icon: '⏱',  title: 'Expiry Tracking',     desc: 'AI estimates exact days left on every item' },
  { icon: '🟢', title: 'Condition Rating',    desc: 'Fresh → Good → Aging → Critical status for each item' },
  { icon: '🍳', title: 'Recipe Engine',       desc: 'Personalized recipes that use what\'s expiring first' },
  { icon: '🗄',  title: 'Fridge Vault',        desc: 'Save, compare and track scans over time' },
  { icon: '🛒', title: 'Smart Grocery List',  desc: 'AI-generated restocking list based on your fridge' },
];

const BOOT_LINES = [
  { text: '▸  Initializing Omnivores…',         delay: 200 },
  { text: '▸  Vision protocols loaded',          delay: 700 },
  { text: '▸  Gemini neural link: established',  delay: 1200 },
  { text: '▸  Food analysis module: online',     delay: 1700 },
  { text: '▸  Recipe engine: online',            delay: 2100 },
  { text: '✓  All systems nominal',              delay: 2500, color: '#00FF88' },
];

const NAV_TABS = [
  { icon: '👤', label: 'Profile',      key: 'profile' },
  { icon: '✉️',  label: 'Contact',      key: 'contact' },
  { icon: '❄️',  label: 'Vault',        key: 'vault' },
  { icon: '⚙️',  label: 'Settings',    key: 'settings' },
];

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function HomeScreen({ onStart, onNav }) {
  const [phase, setPhase] = useState('boot');
  const btnScale   = useRef(new Animated.Value(0)).current;
  const arcOpacity = useRef(new Animated.Value(0)).current;
  const arcScale   = useRef(new Animated.Value(0.7)).current;
  const glowPulse  = useRef(new Animated.Value(0.6)).current;
  const [activeNav, setActiveNav] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('title');
      Animated.parallel([
        Animated.spring(arcScale,   { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
        Animated.timing(arcOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
    }, 3200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== 'ready') return;
    Animated.spring(btnScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1,   duration: 1100, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.6, duration: 1100, useNativeDriver: true }),
      ])
    ).start();
  }, [phase]);

  function handleNav(key) {
    setActiveNav(key);
    if (key === 'contact') {
      Linking.openURL('mailto:donaldliang45@gmail.com');
      setTimeout(() => setActiveNav(null), 600);
    } else {
      onNav?.(key);
    }
  }

  return (
    <View style={styles.root}>
      {/* Subtle grid */}
      <View style={styles.gridOverlay} pointerEvents="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLine, { top: `${(100 / 12) * i}%` }]} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={`v${i}`} style={[styles.gridCol, { left: `${(100 / 8) * i}%` }]} />
        ))}
      </View>

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Boot phase ── */}
        {phase === 'boot' && (
          <View style={styles.bootContainer}>
            <View style={styles.bootCard}>
              {BOOT_LINES.map((l, i) => <BootLine key={i} {...l} />)}
            </View>
          </View>
        )}

        {/* ── Hero ── */}
        {phase !== 'boot' && (
          <Animated.View style={[styles.hero, { opacity: arcOpacity, transform: [{ scale: arcScale }] }]}>

            {/* Arc reactor */}
            <View style={styles.ringsWrap} pointerEvents="none">
              <Ring size={280} duration={22000} opacity={0.06} />
              <Ring size={210} duration={14000} delay={400} opacity={0.10} reverse />
              <Ring size={150} duration={8000}  delay={200} opacity={0.18} />
              <Ring size={88}  duration={4500}  opacity={0.30} />
              <View style={styles.arcOuter}>
                <View style={styles.arcMid}>
                  <View style={styles.arcInner} />
                </View>
              </View>
            </View>

            {/* Text */}
            <Text style={styles.eyebrow}>FRIDGE INTELLIGENCE SYSTEM</Text>
            {phase === 'title' && (
              <TypeWriter text="OMNIVORES" style={styles.title} speed={75} onDone={() => setPhase('ready')} />
            )}
            {phase === 'ready' && <Text style={styles.title}>OMNIVORES</Text>}
            <Text style={styles.tagline}>Know what's in your fridge. Never waste food again.</Text>

            {/* Stats pills */}
            <View style={styles.statsRow}>
              {[
                { label: 'AI Engine',  value: 'Gemini 2.0' },
                { label: 'Scan Mode',  value: 'Real-Time' },
                { label: 'Status',     value: '● Online',  green: true },
              ].map((s, i) => (
                <View key={i} style={styles.statPill}>
                  <Text style={[styles.statValue, s.green && { color: '#00FF88' }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* CTA button */}
            {phase === 'ready' && (
              <Animated.View style={[styles.ctaWrap, { transform: [{ scale: btnScale }] }]}>
                <TouchableOpacity style={styles.ctaBtn} onPress={onStart} activeOpacity={0.82}>
                  <Animated.View style={[styles.ctaGlow, { opacity: glowPulse }]} />
                  <Text style={styles.ctaIcon}>📷</Text>
                  <Text style={styles.ctaText}>Scan My Fridge</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {/* ── Features grid ── */}
        {phase === 'ready' && (
          <View style={styles.featuresSection}>
            <Text style={styles.sectionLabel}>WHAT IT DOES</Text>
            <View style={styles.featuresGrid}>
              {FEATURES.map((f, i) => (
                <View key={i} style={styles.featureCard}>
                  <Text style={styles.featureEmoji}>{f.icon}</Text>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Nav bar ── */}
      <View style={styles.navBar}>
        {NAV_TABS.map((tab) => {
          const active = activeNav === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.navTab, active && styles.navTabActive]}
              onPress={() => handleNav(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.navIcon}>{tab.icon}</Text>
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, minHeight: '100vh', backgroundColor: '#060B18' },

  gridOverlay: { ...StyleSheet.absoluteFillObject },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,212,255,0.03)' },
  gridCol:  { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(0,212,255,0.03)' },

  scroll: { alignItems: 'center', paddingTop: 48, paddingBottom: 24 },

  /* Boot */
  bootContainer: { width: '100%', maxWidth: 460, paddingHorizontal: 24, marginTop: 80 },
  bootCard: {
    backgroundColor: 'rgba(0,212,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.12)',
    borderRadius: 16,
    padding: 24,
  },
  bootLine: { fontFamily: 'monospace', fontSize: 13, letterSpacing: 0.5, marginBottom: 8 },

  /* Hero */
  hero: { alignItems: 'center', width: '100%', paddingHorizontal: 24 },

  ringsWrap: { width: 280, height: 280, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  ring: { position: 'absolute', borderWidth: 1, borderStyle: 'dashed', borderColor: '#00D4FF' },

  arcOuter: {
    width: 54, height: 54, borderRadius: 27,
    borderWidth: 2, borderColor: '#00D4FF',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,212,255,0.10)',
    shadowColor: '#00D4FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 18,
  },
  arcMid: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(0,212,255,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  arcInner: {
    width: 16, height: 16, borderRadius: 8, backgroundColor: '#00D4FF',
    shadowColor: '#00D4FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 12,
  },

  eyebrow: { color: 'rgba(0,212,255,0.5)', fontSize: 11, letterSpacing: 3, marginBottom: 10, textTransform: 'uppercase' },
  title: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 8,
    textShadowColor: '#00D4FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
    marginBottom: 10,
  },
  tagline: { color: 'rgba(255,255,255,0.45)', fontSize: 14, textAlign: 'center', marginBottom: 28, lineHeight: 20 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' },
  statPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,212,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 90,
  },
  statValue: { color: '#00D4FF', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  statLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 3 },

  ctaWrap: { width: '100%', maxWidth: 340, marginBottom: 12 },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#00D4FF',
    paddingVertical: 18,
    backgroundColor: 'rgba(0,212,255,0.08)',
    overflow: 'hidden',
    position: 'relative',
  },
  ctaGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,212,255,0.14)' },
  ctaIcon: { fontSize: 22 },
  ctaText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },

  /* Features */
  featuresSection: { width: '100%', maxWidth: 880, paddingHorizontal: 20, marginTop: 12 },
  sectionLabel: {
    color: 'rgba(0,212,255,0.4)',
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featureCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: 18,
  },
  featureEmoji: { fontSize: 24, marginBottom: 10 },
  featureTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  featureDesc:  { color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 18 },

  /* Nav */
  navBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(6,11,24,0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 10,
    paddingBottom: 18,
    paddingHorizontal: 8,
    zIndex: 100,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  navTabActive: { backgroundColor: 'rgba(0,212,255,0.1)' },
  navIcon:  { fontSize: 20, marginBottom: 4 },
  navLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '600' },
  navLabelActive: { color: '#00D4FF' },
});
