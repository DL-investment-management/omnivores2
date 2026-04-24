import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Scan History (Fridge Vault) ──────────────────────────────────────────────
export async function saveScan(fridgeId = 'default', items) {
  const key = `vault_${fridgeId}`;
  const existing = await getScans(fridgeId);
  const entry = { id: Date.now(), timestamp: new Date().toISOString(), items };
  await AsyncStorage.setItem(key, JSON.stringify([entry, ...existing].slice(0, 50)));
}

export async function getScans(fridgeId = 'default') {
  const raw = await AsyncStorage.getItem(`vault_${fridgeId}`);
  return raw ? JSON.parse(raw) : [];
}

// ─── Waste Tracker ────────────────────────────────────────────────────────────
export async function logWaste(item) {
  const raw = await AsyncStorage.getItem('waste_log');
  const log = raw ? JSON.parse(raw) : [];
  await AsyncStorage.setItem('waste_log', JSON.stringify([
    { ...item, discardedAt: new Date().toISOString() }, ...log
  ].slice(0, 200)));
}

export async function getWasteLog() {
  const raw = await AsyncStorage.getItem('waste_log');
  return raw ? JSON.parse(raw) : [];
}

// ─── Multi-fridge ─────────────────────────────────────────────────────────────
export async function getFridges() {
  const raw = await AsyncStorage.getItem('fridges');
  return raw ? JSON.parse(raw) : [{ id: 'default', name: 'My Fridge' }];
}

export async function saveFridges(fridges) {
  await AsyncStorage.setItem('fridges', JSON.stringify(fridges));
}

export async function getActiveFridge() {
  const raw = await AsyncStorage.getItem('active_fridge');
  return raw ?? 'default';
}

export async function setActiveFridge(id) {
  await AsyncStorage.setItem('active_fridge', id);
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export async function getProfile() {
  const raw = await AsyncStorage.getItem('profile');
  return raw ? JSON.parse(raw) : { name: '', dietary: [], allergens: [] };
}

export async function saveProfile(profile) {
  await AsyncStorage.setItem('profile', JSON.stringify(profile));
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export async function getSettings() {
  const raw = await AsyncStorage.getItem('settings');
  return raw ? JSON.parse(raw) : {
    scanInterval: 8,
    units: 'days',
    notificationsEnabled: true,
    notifyThresholdDays: 2,
  };
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem('settings', JSON.stringify(settings));
}
