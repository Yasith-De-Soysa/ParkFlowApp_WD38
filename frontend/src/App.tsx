import React from 'react';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeMapScreen';
import ChooseSlot from './screens/ChooseSlot';
import ConfirmReservation from './screens/ConfirmReservation';
import SecureCheckout from './screens/SecureCheckout';
import PaymentSuccess from './screens/PaymentSuccess';
import ReservationsScreen from './screens/ReservationsScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeMapScreen from './screens/HomeMapScreen';
import ParkingDetailsScreen from './screens/ParkingDetailsScreen';
import ReviewsScreen from './screens/ReviewsScreen';
import ParkingProfileScreen from './screens/ParkingProfileScreen';
import OwnerManageScreen from './screens/OwnerManageScreen';
import UpdateSlotsScreen from './screens/UpdateSlotsScreen';
import OwnerRegistrationScreen from './screens/OwnerRegistrationScreen';
import OwnerRegistrationStatusScreen from './screens/OwnerRegistrationStatusScreen';
import EditParkingProfileScreen from './screens/EditParkingProfileScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import SelectParking from './screens/SelectParking';

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
        <Stack.Navigator initialRouteName={hasOpened ? 'Login' : 'Onboarding'}>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SelectParking" component={SelectParking} options={{ headerShown: false }} />
          <Stack.Screen name="OwnerHome" component={HomeMapScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChooseSlot" component={ChooseSlot} options={{ headerShown: false }} />
          <Stack.Screen name="ConfirmReservation" component={ConfirmReservation} options={{ headerShown: false }} />
          <Stack.Screen name="SecureCheckout" component={SecureCheckout} options={{ headerShown: false }} />
          <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} options={{ headerShown: false }} />
          <Stack.Screen name="Reservations" component={ReservationsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ParkingDetails" component={ParkingDetailsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ParkingProfile" component={ParkingProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="OwnerManage" component={OwnerManageScreen} options={{ headerShown: false }} />
          <Stack.Screen name="UpdateSlots" component={UpdateSlotsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="OwnerRegistration" component={OwnerRegistrationScreen} options={{ headerShown: false }} />
          <Stack.Screen name="OwnerRegistrationStatus" component={OwnerRegistrationStatusScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EditParkingProfile" component={EditParkingProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Registration" component={RegistrationScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Onboarding" options={{ headerShown: false }}>
            {(props) => (
              <OnboardingScreen
                {...props}
                onComplete={async () => {
                  await AsyncStorage.setItem('parkflow.onboarding.completed', 'true');
                  props.navigation.replace('Registration');
                }}
                onLogin={async () => {
                  await AsyncStorage.setItem('parkflow.onboarding.completed', 'true');
                  props.navigation.replace('Login');
                }}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
