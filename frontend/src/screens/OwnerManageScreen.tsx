import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';

type OwnerFacility = {
  _id: string;
  name: string;
  carSlots: number;
  bikeSlots: number;
  availableSlots: number;
  carAvailableSlots: number;
  bikeAvailableSlots: number;
  status: string;
};

const chartBars = [
  { label: '8', height: 62 },
  { label: '10', height: 85 },
  { label: '12', height: 110 },
  { label: '2', height: 142, highlighted: true },
  { label: '4', height: 126 },
  { label: '6', height: 96 },
  { label: '8', height: 72 },
];

export default function OwnerManageScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const [facility, setFacility] = useState<OwnerFacility | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      api.getOwnerFacilities()
        .then((response) => {
          if (active) setFacility(response.facilities[0] || null);
        })
        .catch((error) => {
          console.error('Unable to load owner dashboard:', error);
          if (active) Alert.alert('Unable to load dashboard', 'Please try again later.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, []),
  );

  const totalSlots = facility ? facility.carSlots + facility.bikeSlots : 0;
  const availableSlots = facility?.availableSlots ?? totalSlots;
  const carAvailableSlots = facility?.carAvailableSlots ?? facility?.carSlots ?? 0;
  const bikeAvailableSlots = facility?.bikeAvailableSlots ?? facility?.bikeSlots ?? 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 112 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headingCopy}>
            <Text style={styles.heading}>{facility?.name || 'Parking dashboard'}</Text>
            <Text style={styles.subtitle}>Live dashboard · updated now</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color="#176b58" style={styles.loader} />
        ) : !facility ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No registered parking lot</Text>
            <Text style={styles.emptyText}>Your dashboard will appear after your parking registration is approved.</Text>
          </View>
        ) : (
          <>
            <View style={styles.metrics}>
              <Metric label="Occupancy" value={totalSlots ? `${Math.round(((totalSlots - availableSlots) / totalSlots) * 100)}%` : '0%'} />
              <Metric label="Reservations" value="46" />
              <Metric label="Complaints" value="3" />
            </View>

            <View style={styles.availability}>
              <View>
                <Text style={styles.availabilityTitle}>Real-time availability</Text>
                <Text style={styles.availabilityValue}>
                  {carAvailableSlots} car · {bikeAvailableSlots} bike slots open
                </Text>
              </View>
              <View style={styles.liveDot} />
            </View>

            <View style={styles.chartCard}>
              <View>
                <Text style={styles.cardTitle}>Slot usage</Text>
                <Text style={styles.chartSubtitle}>Today</Text>
              </View>
              <View style={styles.bars}>
                {chartBars.map((bar) => (
                  <View key={`${bar.label}-${bar.height}`} style={styles.barGroup}>
                    <View style={[styles.bar, { height: bar.height }, bar.highlighted && styles.highlightedBar]} />
                    <Text style={styles.barLabel}>{bar.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.facilityCard}>
              <View style={styles.facilitySymbol}>
                <Text style={styles.facilitySymbolText}>P</Text>
              </View>
              <View style={styles.facilityInfo}>
                <Text style={styles.cardTitle}>Current availability</Text>
                <Text style={styles.chartSubtitle}>Tap slots to update status</Text>
                <View style={styles.availabilityRow}>
                  <Text style={styles.availabilityValue}>{availableSlots} slots live</Text>
                  <Text style={styles.liveText}>{facility.status === 'active' ? 'Live' : 'Pending'}</Text>
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
              onPress={() => navigation.navigate('UpdateSlots', { facility })}
            >
              <Text style={styles.primaryButtonText}>Update Slot Availability</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <View style={[styles.bottomNav, { bottom: insets.bottom + 14 }]}>
        <OwnerNavItem icon="⌕" label="Explore" onPress={() => navigation.navigate('OwnerHome')} />
        <OwnerNavItem icon="▦" label="Manage" active />
        <OwnerNavItem icon="P" label="Parking profile" onPress={() => navigation.navigate('ParkingProfile')} />
      </View>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function OwnerNavItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.navItem}>
      <View style={[styles.navIcon, active && styles.activeNavIcon]}>
        <Text style={[styles.navIconText, active && styles.activeNavIconText]}>{icon}</Text>
      </View>
      <Text style={[styles.navLabel, active && styles.activeNavLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f7f6' },
  content: { paddingHorizontal: 22, paddingTop: 18, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center' },
  headingCopy: { flex: 1, gap: 3 },
  heading: { color: '#17201e', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#66736f', fontSize: 13 },
  loader: { padding: 30 },
  emptyCard: { padding: 20, borderRadius: 17, backgroundColor: '#fff', gap: 7 },
  emptyTitle: { color: '#17201e', fontSize: 16, fontWeight: '800' },
  emptyText: { color: '#66736f', fontSize: 13, lineHeight: 19 },
  metrics: { flexDirection: 'row', gap: 8 },
  metric: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#fff', gap: 6 },
  metricLabel: { color: '#66736f', fontSize: 11 },
  metricValue: { color: '#000', fontSize: 22, fontWeight: '400' },
  availability: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#e8f4f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availabilityTitle: { color: '#000', fontSize: 15, fontWeight: '800' },
  availabilityValue: { color: '#24966d', fontSize: 13, marginTop: 2 },
  liveDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#24966d' },
  chartCard: { height: 230, padding: 18, borderRadius: 18, backgroundColor: '#fff', gap: 16 },
  cardTitle: { color: '#000', fontSize: 15, fontWeight: '800' },
  chartSubtitle: { color: '#66736f', fontSize: 11, marginTop: 2 },
  bars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  barGroup: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center', gap: 6 },
  bar: { width: '100%', maxHeight: 142, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: '#176b58' },
  highlightedBar: { backgroundColor: '#f4b740' },
  barLabel: { color: '#66736f', fontSize: 10 },
  facilityCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#dde5e2',
    borderRadius: 18,
    backgroundColor: '#fff',
    flexDirection: 'row',
    gap: 12,
  },
  facilitySymbol: { width: 54, height: 54, borderRadius: 12, backgroundColor: '#e8f4f0', alignItems: 'center', justifyContent: 'center' },
  facilitySymbolText: { color: '#176b58', fontSize: 22, fontWeight: '800' },
  facilityInfo: { flex: 1, gap: 3 },
  availabilityRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  liveText: { color: '#17201e', fontSize: 13 },
  primaryButton: { height: 52, borderRadius: 12, backgroundColor: '#176b58', alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  buttonPressed: { opacity: 0.85 },
  bottomNav: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 76,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#dde5e2',
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#17332c',
    shadowOpacity: 0.08,
    shadowRadius: 9,
    elevation: 3,
  },
  navItem: { width: 100, alignItems: 'center', gap: 4 },
  navIcon: { width: 36, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7f6' },
  activeNavIcon: { backgroundColor: '#e8f4f0' },
  navIconText: { color: '#66736f', fontSize: 20, fontWeight: '700' },
  activeNavIconText: { color: '#176b58' },
  navLabel: { color: '#66736f', fontSize: 11, fontWeight: '600' },
  activeNavLabel: { color: '#176b58', fontWeight: '800' },
});
