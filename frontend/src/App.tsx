import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './screens/SelectParking';
import ChooseSlot from './screens/ChooseSlot';
import ConfirmReservation from './screens/ConfirmReservation';
import SecureCheckout from './screens/SecureCheckout';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChooseSlot" component={ChooseSlot} options={{ headerShown: false }} />
          <Stack.Screen name="ConfirmReservation" component={ConfirmReservation} options={{ headerShown: false }} />
          <Stack.Screen name="SecureCheckout" component={SecureCheckout} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
