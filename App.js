import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import OnboardingScreen from './src/screens/OnboardingScreen';
import SwipeScreen from './src/screens/SwipeScreen';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      setInitialRoute(favorites ? 'Home' : 'Onboarding');
    } catch {
      setInitialRoute('Onboarding');
    }
  };

  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#0A0A0A" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0A0A' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Swipe" component={SwipeScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}