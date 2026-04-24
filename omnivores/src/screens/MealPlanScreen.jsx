import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getMealPlan } from '../api/claude';
import HudScreen from '../components/HudScreen';

const MEAL_META = {
  breakfast: { icon: '🌅', label: 'Breakfast' },
  lunch:     { icon: '☀️',  label: 'Lunch'     },
  dinner:    { icon: '🌙', label: 'Dinner'    },
};

export default function MealPlanScreen({ items = [], onBack }) {
  const [plan, setPlan]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  async function generate() {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const result = await getMealPlan(items);
      setPlan(result.plan ?? []);
      setActiveDay(0);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); }
  }

  const day = plan[activeDay];

  return (
    <HudScreen title="Meal Planner" subtitle="7-day plan using your fridge" onBack={onBack}>

      {/* Generate button */}
      <TouchableOpacity
        style={[styles.generateBtn, (loading || items.length === 0) && styles.btnDisabled]}
        onPress={generate}
        disabled={loading || items.length === 0}
        activeOpacity={0.82}
      >
        {loading
          ? <ActivityIndicator color="#00D4FF" size="small" />
          : <>
              <Text style={styles.generateIcon}>✨</Text>
              <Text style={styles.generateText}>Generate 7-Day Plan</Text>
            </>
        }
      </TouchableOpacity>

      {items.length === 0 && (
        <View style={styles.hint}>
          <Text style={styles.hintIcon}>📷</Text>
          <Text style={styles.hintText}>Scan your fridge first</Text>
        </View>
      )}

      {plan.length > 0 && (
        <>
          {/* Day selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayScroll}
          >
            {plan.map((d, i) => {
              const active = activeDay === i;
              const hasExpiring = d.usesBefore?.length > 0;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.dayTab, active && styles.dayTabActive]}
                  onPress={() => setActiveDay(i)}
                  activeOpacity={0.75}
                >
                  {hasExpiring && <View style={styles.urgentDot} />}
                  <Text style={[styles.dayTabText, active && styles.dayTabTextActive]}>
                    {d.day.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Day card */}
          {day && (
            <View style={styles.dayCard}>
              <Text style={styles.dayTitle}>{day.day}</Text>

              {['breakfast', 'lunch', 'dinner'].map(meal => {
                const meta = MEAL_META[meal];
                return (
                  <View key={meal} style={styles.mealRow}>
                    <View style={styles.mealIconWrap}>
                      <Text style={styles.mealIcon}>{meta.icon}</Text>
                    </View>
                    <View style={styles.mealInfo}>
                      <Text style={styles.mealLabel}>{meta.label}</Text>
                      <Text style={styles.mealValue}>{day[meal]}</Text>
                    </View>
                  </View>
                );
              })}

              {day.usesBefore?.length > 0 && (
                <View style={styles.expiryBanner}>
                  <Text style={styles.expiryBannerIcon}>⚡</Text>
                  <View style={styles.expiryBannerText}>
                    <Text style={styles.expiryBannerTitle}>Uses expiring items</Text>
                    <Text style={styles.expiryBannerItems}>{day.usesBefore.join(' · ')}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Week overview */}
          <Text style={styles.overviewLabel}>WEEK AT A GLANCE</Text>
          <View style={styles.overviewGrid}>
            {plan.map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.overviewCard, activeDay === i && styles.overviewCardActive]}
                onPress={() => setActiveDay(i)}
                activeOpacity={0.75}
              >
                <Text style={styles.overviewDay}>{d.day.slice(0, 3).toUpperCase()}</Text>
                <Text style={styles.overviewMeal} numberOfLines={1}>{d.dinner}</Text>
                {d.usesBefore?.length > 0 && (
                  <View style={styles.overviewDot} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

    </HudScreen>
  );
}

const styles = StyleSheet.create({
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,212,255,0.1)',
    borderWidth: 1.5,
    borderColor: '#00D4FF',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 24,
  },
  btnDisabled: { opacity: 0.35 },
  generateIcon: { fontSize: 18 },
  generateText: { color: '#00D4FF', fontSize: 15, fontWeight: '700' },

  hint: { alignItems: 'center', paddingTop: 48, gap: 10 },
  hintIcon: { fontSize: 40, opacity: 0.5 },
  hintText: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },

  /* Day selector */
  dayScroll: { gap: 8, paddingBottom: 4, marginBottom: 20 },
  dayTab: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  dayTabActive: { borderColor: '#00D4FF', backgroundColor: 'rgba(0,212,255,0.12)' },
  dayTabText: { color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: '700' },
  dayTabTextActive: { color: '#00D4FF' },
  urgentDot: {
    position: 'absolute',
    top: 4, right: 4,
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: '#FFB300',
  },

  /* Day card */
  dayCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
  },
  dayTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 18 },
  mealRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  mealIconWrap: {
    width: 40, height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  mealIcon: { fontSize: 20 },
  mealInfo: { flex: 1 },
  mealLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  mealValue: { color: '#FFFFFF', fontSize: 14, lineHeight: 20 },

  expiryBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(255,179,0,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.25)',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    alignItems: 'flex-start',
  },
  expiryBannerIcon: { fontSize: 16, marginTop: 1 },
  expiryBannerText: { flex: 1 },
  expiryBannerTitle: { color: '#FFB300', fontSize: 12, fontWeight: '700', marginBottom: 3 },
  expiryBannerItems: { color: 'rgba(255,179,0,0.65)', fontSize: 12 },

  /* Week overview */
  overviewLabel: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  overviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  overviewCard: {
    flex: 1,
    minWidth: 80,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 10,
    position: 'relative',
  },
  overviewCardActive: { borderColor: '#00D4FF', backgroundColor: 'rgba(0,212,255,0.07)' },
  overviewDay:  { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', marginBottom: 4 },
  overviewMeal: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  overviewDot: {
    position: 'absolute',
    top: 6, right: 6,
    width: 5, height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFB300',
  },
});
