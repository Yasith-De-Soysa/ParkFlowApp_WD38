import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const signIn = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Complete your details', 'Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.login({ email, password });
      if (response.user?.role === 'admin') {
        navigation.replace('AdminDashboard');
      } else if (response.user?.role === 'owner') {
        const facilitiesResponse = await api.getOwnerFacilities();
        const facility = facilitiesResponse.facilities[0];
        if (!facility) {
          navigation.replace('OwnerRegistration');
        } else if (facility.status === 'pending' || facility.status === 'declined') {
          navigation.replace('OwnerRegistrationStatus', {
            status: facility.status,
            facilityId: facility._id,
          });
        } else if (facility.status === 'active') {
          const noticeKey = `parkflow.owner.approved.${facility._id}`;
          const hasSeenApprovalNotice = await AsyncStorage.getItem(noticeKey);
          if (!hasSeenApprovalNotice) {
            await AsyncStorage.setItem(noticeKey, 'true');
            Alert.alert('Registration successful', 'Your parking registration was approved.', [
              { text: 'Continue', onPress: () => navigation.replace('ParkingProfile') },
            ]);
          } else {
            navigation.replace('ParkingProfile');
          }
        }
      } else {
        navigation.replace('Home');
      }
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || 'Unable to sign in.';
      Alert.alert('Sign in failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.loginContent}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Text style={styles.brandLetter}>P</Text>
            </View>
            <Text style={styles.brandName}>ParkFlow</Text>
          </View>

          <Text style={styles.title}>Welcome back</Text>

          <View style={styles.form}>
            <Field
              label="Email"
              placeholder="email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Pressable
              accessibilityRole="button"
              onPress={signIn}
              disabled={submitting}
              style={({ pressed }) => [styles.signInButton, pressed && styles.buttonPressed]}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.signInText}>Sign In</Text>}
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="link"
            onPress={() => navigation.navigate('Registration')}
            style={styles.signUpLink}
          >
            <Text style={styles.signUpText}>
              Don’t have an account? <Text style={styles.underlined}>Sign up</Text> here
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none';
  secureTextEntry?: boolean;
};

function Field({ label, ...inputProps }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          {...inputProps}
          style={styles.input}
          placeholderTextColor="#66736f"
          accessibilityLabel={label}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#17332c' },
  keyboard: { flex: 1 },
  content: { flexGrow: 1, minHeight: '100%' },
  loginContent: { paddingHorizontal: 26, paddingTop: 100, paddingBottom: 40, gap: 22 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f4b740',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLetter: { color: '#17332c', fontSize: 22, fontWeight: '800' },
  brandName: { color: '#fff', fontSize: 22 },
  title: { color: '#fff', fontSize: 28, lineHeight: 34 },
  form: { backgroundColor: '#fff', borderRadius: 18, padding: 18, gap: 16 },
  field: { gap: 6 },
  label: { color: '#17201e', fontSize: 13, lineHeight: 16, fontWeight: '600' },
  inputContainer: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dde5e2',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: { flex: 1, color: '#17201e', fontSize: 15, paddingVertical: 0 },
  signInButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#176b58',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { opacity: 0.85 },
  signInText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  signUpLink: { alignItems: 'center' },
  signUpText: { color: '#c9d8d3', fontSize: 13, lineHeight: 16 },
  underlined: { textDecorationLine: 'underline' },
});
