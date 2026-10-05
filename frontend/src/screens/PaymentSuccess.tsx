import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PaymentSuccessProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export default function PaymentSuccess({ navigation }: PaymentSuccessProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Text style={styles.iconText}>P</Text>
        </View>
        <Text style={styles.title}>Payment successful</Text>
        <Text style={styles.subtitle}>Your parking reservation is confirmed.</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>PAID</Text>
          <Text style={styles.amount}>$9.00</Text>
          <View style={styles.divider} />
          <Text style={styles.detailLabel}>Reservation ID</Text>
          <Text style={styles.detailValue}>PF-2024-0927</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Home')}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>View reservation</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Home')}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Back to home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f4f8f6',
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successIcon: {
    alignItems: 'center',
    backgroundColor: '#f5bd3f',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginBottom: 16,
    width: 44,
  },
  iconText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  title: {
    color: '#15231f',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#77847f',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderColor: '#dfe7e4',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 28,
    padding: 20,
    width: '100%',
  },
  summaryLabel: {
    color: '#1f8068',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  amount: {
    color: '#15231f',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 5,
  },
  divider: {
    backgroundColor: '#e8efec',
    height: 1,
    marginVertical: 16,
  },
  detailLabel: {
    color: '#77847f',
    fontSize: 12,
  },
  detailValue: {
    color: '#31423d',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#1f8068',
    borderRadius: 12,
    marginTop: 22,
    minHeight: 48,
    justifyContent: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#1f8068',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    minHeight: 48,
    justifyContent: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    color: '#1f8068',
    fontSize: 14,
    fontWeight: '700',
  },
});
