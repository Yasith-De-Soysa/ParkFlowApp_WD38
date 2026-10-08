import React from 'react';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './screens/SelectParking';
import ChooseSlot from './screens/ChooseSlot';
import ConfirmReservation from './screens/ConfirmReservation';
import SecureCheckout from './screens/SecureCheckout';
import PaymentSuccess from './screens/PaymentSuccess';

const Stack = createNativeStackNavigator();

export default function App() {
  const [hasOpened, setHasOpened] = useState<boolean | null>(null);

  useEffect(() => {
    NavigationBar.setVisibilityAsync('visible').catch((error) => {
      console.error('Unable to show the native navigation bar:', error);
    });
    NavigationBar.setStyle('dark');

    AsyncStorage.getItem('parkflow.onboarding.completed')
      .then((value) => setHasOpened(value === 'true'))
      .catch((error) => {
        console.error('Unable to read onboarding state:', error);
        setHasOpened(false);
      });
  }, []);

  if (hasOpened === null) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar hidden={false} style="dark" backgroundColor="#f4f7f6" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChooseSlot" component={ChooseSlot} options={{ headerShown: false }} />
          <Stack.Screen name="ConfirmReservation" component={ConfirmReservation} options={{ headerShown: false }} />
          <Stack.Screen name="SecureCheckout" component={SecureCheckout} options={{ headerShown: false }} />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
