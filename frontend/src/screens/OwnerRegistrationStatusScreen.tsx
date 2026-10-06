import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OwnerRegistrationStatusScreen({ navigation, route }: { navigation: any; route: any }) {
  const status = route.params?.status === 'declined' ? 'declined' : 'pending';
  const declined = status === 'declined';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={[styles.icon, declined && styles.declinedIcon]}>
          <Text style={styles.iconText}>{declined ? '!' : '✓'}</Text>
        </View>
        <Text style={styles.title}>
          {declined ? 'Registration unsuccessful' : 'Registration pending'}
        </Text>
        <Text style={styles.message}>
          {declined
            ? 'Your parking registration was not approved. Please review your details and submit the form again.'
            : 'Submitted for review. You cannot access the owner dashboard until an administrator approves your registration.'}
        </Text>
        {declined ? (
          <Pressable style={styles.button} onPress={() => navigation.replace('OwnerRegistration')}>
            <Text style={styles.buttonText}>Re-submit registration</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f7f6' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  icon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: '#dff3e9', marginBottom: 22 },
  declinedIcon: { backgroundColor: '#fbe7e7' },
  iconText: { color: '#176b58', fontSize: 34, fontWeight: '800' },
  title: { color: '#17201e', fontSize: 25, fontWeight: '800', textAlign: 'center' },
  message: { color: '#66736f', fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 12 },
  button: { height: 52, minWidth: 220, borderRadius: 12, backgroundColor: '#176b58', alignItems: 'center', justifyContent: 'center', marginTop: 26 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
