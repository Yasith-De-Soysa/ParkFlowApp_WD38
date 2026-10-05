import React from 'react';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RegistrationScreen from './screens/RegistrationScreen';
import LoginScreen from './screens/LoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import ProfileScreen from './screens/ProfileScreen';
import OwnerRegistrationScreen from './screens/OwnerRegistrationScreen';
import HomeMapScreen from './screens/HomeMapScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ParkingDetailsScreen from './screens/ParkingDetailsScreen';
import ReviewsScreen from './screens/ReviewsScreen';
import ParkingProfileScreen from './screens/ParkingProfileScreen';

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
          <Stack.Screen name="Home" component={HomeMapScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ParkingDetails" component={ParkingDetailsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ParkingProfile" component={ParkingProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="OwnerRegistration"
            component={OwnerRegistrationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Registration"
            component={RegistrationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Onboarding" options={{ headerShown: false }}>
            {(props) => (
              <OnboardingScreen
                {...props}
                onComplete={async () => {
                  try {
                    await AsyncStorage.setItem('parkflow.onboarding.completed', 'true');
                    props.navigation.replace('Registration');
                  } catch (error) {
                    console.error('Unable to save onboarding state:', error);
                  }
                }}
                onLogin={async () => {
                  try {
                    await AsyncStorage.setItem('parkflow.onboarding.completed', 'true');
                    props.navigation.replace('Login');
                  } catch (error) {
                    console.error('Unable to save onboarding state:', error);
                  }
                }}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
