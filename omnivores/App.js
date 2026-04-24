import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import ScannerScreen from './src/screens/ScannerScreen';

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <>
      <StatusBar style="light" hidden />
      {started
        ? <ScannerScreen onBack={() => setStarted(false)} />
        : <HomeScreen onStart={() => setStarted(true)} />
      }
    </>
  );
}
