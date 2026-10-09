import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';

type Reservation = {
  _id: string;
  reservationCode: string;
  facilityName: string;
  facilityAddress?: string;
  date: string;
  time: string;
  slot: string;
  vehicleType: 'Car' | 'Bike';
  amount: number;
  status: 'confirmed' | 'cancelled';
};

export default function ReservationsScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      api.getMyReservations()
        .then((response) => {
          if (active) setReservations(response.reservations);
        })
        .catch(() => {
          if (active) Alert.alert('Unable to load reservations', 'Please try again.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Reservations</Text>
        <Text style={styles.subtitle}>Your upcoming and past parking reservations.</Text>
        <Pressable style={styles.addReservationButton} onPress={() => navigation.navigate('SelectParking')}>
          <Text style={styles.addReservationButtonText}>Add reservation</Text>
        </Pressable>
        {loading ? (
          <ActivityIndicator color="#176b58" style={styles.loader} />
        ) : reservations.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No reservations yet</Text>
            <Text style={styles.emptyText}>Your confirmed bookings will appear here after payment.</Text>
          </View>
        ) : (
          reservations.map((reservation) => (
            <View key={reservation._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.parkingIcon}><Text style={styles.parkingLetter}>P</Text></View>
                <View style={styles.cardTitle}>
                  <Text style={styles.facilityName}>{reservation.facilityName}</Text>
                  {!!reservation.facilityAddress && <Text style={styles.address}>{reservation.facilityAddress}</Text>}
                </View>
                <View style={[styles.status, reservation.status === 'cancelled' && styles.cancelledStatus]}>
                  <Text style={styles.statusText}>{reservation.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}</Text>
                </View>
              </View>
              <View style={styles.details}>
                <Detail label="Date" value={reservation.date} />
                <Detail label="Time" value={reservation.time} />
                <Detail label="Slot" value={`${reservation.slot} · ${reservation.vehicleType}`} />
              </View>
              <View style={styles.footer}>
                <Text style={styles.code}>{reservation.reservationCode}</Text>
                <Text style={styles.amount}>LKR {reservation.amount.toFixed(2)}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <View style={[styles.bottomNav, { bottom: insets.bottom + 15 }]}>
        <Tab icon="⌕" label="Explore" onPress={() => navigation.navigate('Home')} />
        <Tab icon="□" label="Reservations" active />
        <Tab icon="♙" label="My profile" onPress={() => navigation.navigate('Profile')} />
      </View>
    </SafeAreaView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <View><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>;
}

function Tab({ icon, label, active, onPress }: { icon: string; label: string; active?: boolean; onPress?: () => void }) {
  return <Pressable onPress={onPress} style={styles.tab}><View style={[styles.tabIcon, active && styles.activeTabIcon]}><Text style={[styles.tabIconText, active && styles.activeTabIconText]}>{icon}</Text></View><Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f7f6' },
  content: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 110, gap: 14 },
  heading: { color: '#17201e', fontSize: 26, fontWeight: '700' },
  subtitle: { color: '#66736f', fontSize: 14, marginBottom: 6 },
  addReservationButton: { alignSelf: 'flex-start', backgroundColor: '#176b58', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11 },
  addReservationButtonText: { color: '#fff', fontWeight: '700' },
  loader: { marginTop: 36 },
  emptyCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, marginTop: 24, padding: 24 },
  emptyTitle: { color: '#17201e', fontSize: 18, fontWeight: '700' },
  emptyText: { color: '#66736f', fontSize: 14, lineHeight: 20, marginTop: 8, textAlign: 'center' },
  primaryButton: { backgroundColor: '#176b58', borderRadius: 12, marginTop: 18, paddingHorizontal: 24, paddingVertical: 13 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16 },
  cardHeader: { alignItems: 'flex-start', flexDirection: 'row' },
  parkingIcon: { alignItems: 'center', backgroundColor: '#e8f4f0', borderRadius: 12, height: 42, justifyContent: 'center', width: 42 },
  parkingLetter: { color: '#176b58', fontSize: 20, fontWeight: '800' },
  cardTitle: { flex: 1, marginLeft: 11, paddingRight: 6 },
  facilityName: { color: '#17201e', fontSize: 16, fontWeight: '700' },
  address: { color: '#66736f', fontSize: 12, marginTop: 4 },
  status: { backgroundColor: '#e6f5ef', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  cancelledStatus: { backgroundColor: '#fbe9e7' },
  statusText: { color: '#176b58', fontSize: 11, fontWeight: '700' },
  details: { borderBottomColor: '#e3ebe8', borderBottomWidth: 1, borderTopColor: '#e3ebe8', borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingVertical: 13 },
  detailLabel: { color: '#66736f', fontSize: 11 },
  detailValue: { color: '#17201e', fontSize: 13, fontWeight: '600', marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 13 },
  code: { color: '#66736f', fontSize: 12 },
  amount: { color: '#17201e', fontSize: 15, fontWeight: '700' },
  bottomNav: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#dde5e2', borderRadius: 20, borderWidth: 1, elevation: 3, flexDirection: 'row', height: 72, justifyContent: 'space-between', left: 17, paddingHorizontal: 16, position: 'absolute', right: 17, shadowColor: '#17332c', shadowOpacity: 0.08, shadowRadius: 9, shadowOffset: { width: 0, height: 6 } },
  tab: { alignItems: 'center', gap: 4, width: '31%' },
  tabIcon: { alignItems: 'center', backgroundColor: '#f4f7f6', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  activeTabIcon: { backgroundColor: '#176b58' },
  tabIconText: { color: '#66736f', fontSize: 18 },
  activeTabIconText: { color: '#fff' },
  tabLabel: { color: '#66736f', fontSize: 12 },
  activeTabLabel: { color: '#176b58', fontWeight: '600' },
});
