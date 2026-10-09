import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ConfirmReservationProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
  route?: {
    params?: {
      date?: string;
      time?: string;
      hours?: number;
      slot?: string;
      type?: string;
      facilityName?: string;
      facilityAddress?: string;
      hourlyRate?: number;
      amount?: number;
    };
  };
}

export default function ConfirmReservation({
  navigation,
  route,
}: ConfirmReservationProps) {
  const date = route?.params?.date ?? '17 Sep 2026';
  const time = route?.params?.time ?? '10:00 AM - 11:00 AM';
  const slot = route?.params?.slot ?? 'A3';
  const type = route?.params?.type ?? 'Car';
  const hours = route?.params?.hours ?? 1;
  const hourlyRate = route?.params?.hourlyRate ?? 0;
  const amount = route?.params?.amount ?? hourlyRate * hours;
  const facilityName = route?.params?.facilityName ?? 'Central Plaza Parking';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <View>
            <Text style={styles.title}>Confirm reservation</Text>
            <Text style={styles.step}>Step 3 of 3</Text>
          </View>
        </View>

        <View style={styles.progressTrack} accessibilityLabel="Step 3 of 3">
          <View style={styles.progressActive} />
          <View style={styles.progressActive} />
          <View style={styles.progressActive} />
        </View>

        <View style={styles.successIcon}>
          <Text style={styles.check}>✓</Text>
        </View>
        <Text style={styles.readyTitle}>Slot {slot} is ready</Text>
        <Text style={styles.readySubtitle}>Review your booking before payment.</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.label}>Facility</Text>
          <Text style={styles.value}>{facilityName}</Text>

          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{date}</Text>

          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{time} · {hours} {hours === 1 ? 'hour' : 'hours'}</Text>

          <Text style={styles.label}>Slot</Text>
          <Text style={styles.value}>{slot} · {type}</Text>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>LKR {amount.toFixed(2)}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('SecureCheckout', { ...route?.params })}
          style={styles.paymentButton}
        >
          <Text style={styles.paymentText}>Continue to Payment</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f4f8f6',
    flex: 1,
  },
  content: {
    alignItems: 'stretch',
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#e8f1ee',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 14,
    width: 40,
  },
  backIcon: {
    color: '#173d35',
    fontSize: 33,
    fontWeight: '300',
    lineHeight: 35,
    marginTop: -3,
  },
  title: {
    color: '#15231f',
    fontSize: 25,
    fontWeight: 'bold',
  },
  step: {
    color: '#77847f',
    fontSize: 14,
    marginTop: 2,
  },
  progressTrack: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  progressActive: {
    backgroundColor: '#1f8068',
    borderRadius: 4,
    flex: 1,
    height: 5,
  },
  successIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#e1f3ed',
    borderRadius: 34,
    height: 68,
    justifyContent: 'center',
    marginTop: 34,
    width: 68,
  },
  check: {
    color: '#1f8068',
    fontSize: 34,
    fontWeight: '700',
  },
  readyTitle: {
    color: '#1d2b27',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 18,
    textAlign: 'center',
  },
  readySubtitle: {
    color: '#788480',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginTop: 22,
    padding: 16,
  },
  label: {
    color: '#77847f',
    fontSize: 12,
    marginTop: 8,
  },
  value: {
    color: '#1d2b27',
    fontSize: 14,
    marginTop: 2,
  },
  totalRow: {
    borderTopColor: '#e3ebe8',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
  },
  totalLabel: {
    color: '#1d2b27',
    fontSize: 14,
    fontWeight: '700',
  },
  total: {
    color: '#1d2b27',
    fontSize: 16,
    fontWeight: '700',
  },
  paymentButton: {
    alignItems: 'center',
    backgroundColor: '#1f8068',
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 52,
  },
  paymentText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
