import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getMealPlan } from '../api/claude';
import HudScreen from '../components/HudScreen';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEAL_ICONS = { breakfast: '☀', lunch: '⬡', dinner: '◈' };

export default function MealPlanScreen({ items = [], onBack }) {
  const [plan, setPlan]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  async function generate() {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const result = await getMealPlan(items);
      setPlan(result.plan ?? []);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); }
  }

  const day = plan[activeDay];

  return (
    <HudScreen title="// 7-DAY MEAL MATRIX" onBack={onBack}>
      <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={generate} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#00D4FF" size="small" />
          : <Text style={styles.btnText}>[ COMPUTE MEAL PLAN ]</Text>
        }
      </TouchableOpacity>

      {items.length === 0 && <Text style={styles.hint}>SCAN YOUR FRIDGE FIRST</Text>}

      {plan.length > 0 && (
        <>
          {/* Day tabs */}
          <View style={styles.dayTabs}>
            {plan.map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.dayTab, activeDay === i && styles.dayTabActive]}
                onPress={() => setActiveDay(i)}
              >
                <Text style={[styles.dayTabText, activeDay === i && styles.dayTabTextActive]}>
                  {d.day.slice(0, 3).toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {day && (
            <View style={styles.dayCard}>
              <View style={styles.dayCardTL} /><View style={styles.dayCardBR} />
              <Text style={styles.dayTitle}>{day.day.toUpperCase()}</Text>

              {['breakfast', 'lunch', 'dinner'].map(meal => (
                <View key={meal} style={styles.mealRow}>
                  <Text style={styles.mealIcon}>{MEAL_ICONS[meal]}</Text>
                  <View>
                    <Text style={styles.mealLabel}>{meal.toUpperCase()}</Text>
                    <Text style={styles.mealValue}>{day[meal]}</Text>
                  </View>
                </View>
              ))}

              {day.usesBefore?.length > 0 && (
                <View style={styles.usesBefore}>
                  <Text style={styles.usesBeforeLabel}>⚠ USES EXPIRING:</Text>
                  <Text style={styles.usesBeforeText}>{day.usesBefore.join(' · ')}</Text>
                </View>
              )}
            </View>
          )}
        </>
      )}
    </HudScreen>
  );
}

const styles = StyleSheet.create({
  btn: { borderWidth: 1, borderColor: '#00D4FF', paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center', marginBottom: 20 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#00D4FF', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  hint: { color: 'rgba(0,212,255,0.3)', fontSize: 10, letterSpacing: 1.5 },
  dayTabs: { flexDirection: 'row', gap: 6, marginBottom: 20, flexWrap: 'wrap' },
  dayTab: { borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)', paddingHorizontal: 12, paddingVertical: 7 },
  dayTabActive: { borderColor: '#00D4FF', backgroundColor: 'rgba(0,212,255,0.1)' },
  dayTabText: { color: 'rgba(0,212,255,0.4)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  dayTabTextActive: { color: '#00D4FF' },
  dayCard: { borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)', padding: 20, position: 'relative' },
  dayCardTL: { position: 'absolute', top: -1, left: -1, width: 10, height: 10, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#00D4FF' },
  dayCardBR: { position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#00D4FF' },
  dayTitle: { color: '#00D4FF', fontSize: 13, fontWeight: '700', letterSpacing: 3, marginBottom: 16 },
  mealRow: { flexDirection: 'row', gap: 14, marginBottom: 14, alignItems: 'flex-start' },
  mealIcon: { color: '#00D4FF', fontSize: 16, opacity: 0.6, marginTop: 2 },
  mealLabel: { color: 'rgba(0,212,255,0.4)', fontSize: 9, letterSpacing: 2, marginBottom: 3 },
  mealValue: { color: '#E0F7FF', fontSize: 12, lineHeight: 18 },
  usesBefore: { borderTopWidth: 1, borderTopColor: 'rgba(0,212,255,0.12)', paddingTop: 12, marginTop: 4 },
  usesBeforeLabel: { color: '#FFB300', fontSize: 9, letterSpacing: 1.5, marginBottom: 4 },
  usesBeforeText: { color: 'rgba(255,179,0,0.6)', fontSize: 11 },
});
