import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeScreen     from './src/screens/HomeScreen';
import ScannerScreen  from './src/screens/ScannerScreen';
import VaultScreen    from './src/screens/VaultScreen';
import ProfileScreen  from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import GroceryScreen  from './src/screens/GroceryScreen';
import MealPlanScreen from './src/screens/MealPlanScreen';
import WasteScreen    from './src/screens/WasteScreen';

export default function App() {
  const [screen, setScreen]   = useState('home');
  const [lastItems, setLastItems] = useState([]);

  const go = (s) => setScreen(s);

  function renderScreen() {
    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            onStart={() => go('scanner')}
            onNav={(s) => go(s)}
          />
        );
      case 'scanner':
        return (
          <ScannerScreen
            onBack={() => go('home')}
            onItemsScanned={setLastItems}
            onGrocery={() => go('grocery')}
            onMealPlan={() => go('mealplan')}
          />
        );
      case 'vault':    return <VaultScreen    onBack={() => go('home')} onWaste={() => go('waste')} />;
      case 'profile':  return <ProfileScreen  onBack={() => go('home')} />;
      case 'settings': return <SettingsScreen onBack={() => go('home')} />;
      case 'grocery':  return <GroceryScreen  onBack={() => go('scanner')} items={lastItems} />;
      case 'mealplan': return <MealPlanScreen onBack={() => go('scanner')} items={lastItems} />;
      case 'waste':    return <WasteScreen    onBack={() => go('vault')} />;
      default:         return <HomeScreen onStart={() => go('scanner')} onNav={go} />;
    }
  }

  return (
    <>
      <StatusBar style="light" hidden />
      {renderScreen()}
    </>
  );
}
