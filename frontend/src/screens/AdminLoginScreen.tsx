import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

export default function AdminLoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!email.trim() || !password) return Alert.alert('Complete your details', 'Enter the administrator email and password.');
    setLoading(true);
    try {
      await api.adminLogin({ email, password });
      navigation.replace('AdminDashboard');
    } catch (error: any) {
      Alert.alert('Sign in failed', error?.response?.data?.error?.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.brand}>ParkFlow Admin</Text>
        <Text style={styles.title}>Dashboard sign in</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Administrator email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="admin@example.com" />
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
          <Pressable style={styles.button} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Open dashboard</Text>}
          </Pressable>
          <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>Back to app</Text></Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#17332c' },
  content: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  brand: { color: '#f4b740', fontSize: 18, fontWeight: '800' },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 12 },
  form: { backgroundColor: '#fff', borderRadius: 18, padding: 18, gap: 10 },
  label: { color: '#17201e', fontWeight: '600', fontSize: 13 },
  input: { height: 48, borderWidth: 1, borderColor: '#dde5e2', borderRadius: 10, paddingHorizontal: 12, color: '#17201e' },
  button: { height: 50, borderRadius: 11, backgroundColor: '#176b58', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700' },
  back: { color: '#176b58', textAlign: 'center', padding: 8 },
});
