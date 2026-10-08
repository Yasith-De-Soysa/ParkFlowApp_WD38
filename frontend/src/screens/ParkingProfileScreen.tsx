import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';

type OwnerFacility = {
  _id: string;
  ownerName: string;
  ownerEmail: string;
  contactNumber: string;
  name: string;
  address: string;
  carSlots: number;
  bikeSlots: number;
  totalCapacity: number;
  status: string;
  pendingChanges?: Record<string, unknown>;
};

export default function ParkingProfileScreen({ navigation }: { navigation: any }) {
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
          console.error('Unable to load owner parking profile:', error);
          if (active) Alert.alert('Unable to load parking profile', 'Please try again later.');
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Parking Profile</Text>
        <Text style={styles.subtitle}>Owner details · registered info</Text>

        {loading ? (
          <ActivityIndicator color="#176b58" style={styles.loader} />
        ) : !facility ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No registered parking lot</Text>
            <Text style={styles.emptyText}>Parking facilities registered with your login email will appear here.</Text>
          </View>
        ) : (
          <>
            <View style={styles.lotCard}>
              <View style={styles.lotIcon}><Text style={styles.lotIconText}>P</Text></View>
              <View style={styles.lotCopy}>
                <Text style={styles.eyebrow}>PARKING LOT NAME</Text>
                <Text style={styles.lotName}>{facility.name}</Text>
                <View style={styles.activeRow}>
                  <View style={styles.liveDot} />
                  <Text style={styles.activeText}>{facility.status === 'active' ? 'Active Lot' : 'Pending Review'}</Text>
                </View>
              </View>
            </View>

            <ProfileSection icon="⌖" title="REGISTERED ADDRESS">
              <Text style={styles.address}>{facility.address}</Text>
            </ProfileSection>

            <ProfileSection icon="▦" title="CAPACITY & FLEET SLOTS">
              <View style={styles.capacityRow}>
                <CapacityCard label="Car Slots" value={facility.carSlots} />
                <CapacityCard label="Bike Slots" value={facility.bikeSlots} />
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Capacity</Text>
                <Text style={styles.totalValue}>{facility.totalCapacity} slots</Text>
              </View>
            </ProfileSection>

            <ProfileSection icon="♙" title="CONTACT & OWNER INFO">
              <Text style={styles.detailLabel}>Phone Number</Text>
              <Text style={styles.detailValue}>{facility.contactNumber}</Text>
              <View style={styles.divider} />
              <Text style={styles.detailLabel}>Registered Manager</Text>
              <Text style={styles.detailValue}>{facility.ownerName}</Text>
              <Text style={styles.email}>{facility.ownerEmail}</Text>
            </ProfileSection>

            {facility.pendingChanges ? (
              <View style={styles.pendingNotice}>
                <Text style={styles.pendingNoticeText}>Update submitted for review. Your current profile remains active until admin approval.</Text>
              </View>
            ) : null}
            <Pressable
              style={styles.editButton}
              accessibilityRole="button"
              disabled={Boolean(facility.pendingChanges)}
              onPress={() => navigation.navigate('EditParkingProfile', { facility })}
            >
              <Text style={[styles.editButtonText, facility.pendingChanges && styles.disabledButtonText]}>
                {facility.pendingChanges ? 'Update awaiting approval' : 'Edit Profile'}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      <View style={[styles.bottomNav, { bottom: insets.bottom + 15 }]}>
        <NavItem icon="⌕" label="Explore" onPress={() => navigation.navigate('OwnerHome')} />
        <NavItem icon="▦" label="Manage" onPress={() => navigation.navigate('OwnerManage')} />
        <NavItem icon="P" label="Parking profile" active onPress={() => navigation.navigate('ParkingProfile')} />
      </View>
    </SafeAreaView>
  );
}

function ProfileSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function CapacityCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.capacityCard}>
      <Text style={styles.capacityLabel}>{label}</Text>
      <Text style={styles.capacityValue}>{value} slots</Text>
    </View>
  );
}

function NavItem({ icon, label, active, onPress }: { icon: string; label: string; active?: boolean; onPress?: () => void }) {
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
  content: { padding: 22, paddingBottom: 110, gap: 16 },
  heading: { color: '#17201e', fontSize: 23, fontWeight: '800', marginTop: 2 },
  subtitle: { color: '#66736f', fontSize: 13, marginTop: -10 },
  loader: { padding: 30 },
  emptyCard: { padding: 20, borderRadius: 17, backgroundColor: '#fff', gap: 7 },
  emptyTitle: { color: '#17201e', fontSize: 16, fontWeight: '800' },
  emptyText: { color: '#66736f', fontSize: 13, lineHeight: 19 },
  lotCard: { padding: 15, flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1, borderColor: '#d9e2de', borderRadius: 17, backgroundColor: '#fff' },
  lotIcon: { width: 54, height: 54, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5f3ee' },
  lotIconText: { color: '#176b58', fontSize: 25, fontWeight: '800' },
  lotCopy: { flex: 1, gap: 3 },
  eyebrow: { color: '#66736f', fontSize: 10, fontWeight: '700' },
  lotName: { color: '#17201e', fontSize: 16, fontWeight: '800' },
  activeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#20a36f' },
  activeText: { color: '#16845f', fontSize: 12, fontWeight: '700' },
  sectionCard: { padding: 15, borderWidth: 1, borderColor: '#d9e2de', borderRadius: 17, backgroundColor: '#fff', gap: 11 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  sectionIcon: { color: '#087e69', fontSize: 20, width: 20, textAlign: 'center' },
  sectionTitle: { color: '#66736f', fontSize: 12, fontWeight: '700' },
  address: { color: '#17201e', fontSize: 15 },
  capacityRow: { flexDirection: 'row', gap: 8 },
  capacityCard: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#f2f6f4', gap: 4 },
  capacityLabel: { color: '#66736f', fontSize: 12 },
  capacityValue: { color: '#087e69', fontSize: 18, fontWeight: '800' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 },
  totalLabel: { color: '#66736f', fontSize: 13 },
  totalValue: { color: '#17201e', fontSize: 14, fontWeight: '800' },
  detailLabel: { color: '#66736f', fontSize: 12 },
  detailValue: { color: '#17201e', fontSize: 14, fontWeight: '700', marginTop: -5 },
  email: { color: '#66736f', fontSize: 12, marginTop: -6 },
  divider: { height: 1, backgroundColor: '#e1e8e5', marginVertical: 2 },
  editButton: { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#176b58' },
  editButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  disabledButtonText: { color: '#66736f' },
  pendingNotice: { padding: 13, borderRadius: 12, backgroundColor: '#fff4d6' },
  pendingNoticeText: { color: '#8a6412', fontSize: 13, lineHeight: 18 },
  bottomNav: { position: 'absolute', left: 17, right: 17, height: 72, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 20, borderWidth: 1, borderColor: '#dde5e2', backgroundColor: '#fff', shadowColor: '#17332c', shadowOpacity: 0.08, shadowRadius: 9, elevation: 3 },
  navItem: { width: '31%', alignItems: 'center', gap: 4 },
  navIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7f6' },
  activeNavIcon: { backgroundColor: '#176b58' },
  navIconText: { color: '#66736f', fontSize: 18 },
  activeNavIconText: { color: '#fff' },
  navLabel: { color: '#66736f', fontSize: 12 },
  activeNavLabel: { color: '#176b58', fontWeight: '600' },
});
