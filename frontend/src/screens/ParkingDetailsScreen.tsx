import React from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

export type ParkingFacility = {
  _id: string;
  ownerName: string;
  ownerEmail: string;
  contactNumber: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  carSlots: number;
  bikeSlots: number;
  carHourlyRate?: number;
  bikeHourlyRate?: number;
  pricingCurrency?: 'LKR';
  availableSlots: number;
  imageUri?: string;
  status: string;
  ratingAverage?: number;
  ratingCount?: number;
};

export default function ParkingDetailsScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: { params: { facility: ParkingFacility } };
}) {
  const [facility, setFacility] = React.useState(route.params.facility);
  const [refreshing, setRefreshing] = React.useState(false);
  const statusLabel = facility.status === 'active' ? 'Open for parking' : 'Pending verification';
  const hasImage = Boolean(facility.imageUri);

  const refreshFacility = async () => {
    setRefreshing(true);
    try {
      const response = await api.getFacilities();
      const updatedFacility = response.facilities.find((item) => item._id === facility._id);
      if (updatedFacility) {
        setFacility(updatedFacility);
      } else {
        Alert.alert('Facility unavailable', 'This parking facility is no longer available.');
      }
    } catch (error) {
      console.error('Unable to refresh parking facility:', error);
      Alert.alert('Refresh failed', 'Unable to refresh this parking facility.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshFacility} tintColor="#176b58" />}
      >
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title} numberOfLines={1}>{facility.name}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{facility.address}</Text>
          </View>
        </View>

        {hasImage ? (
          <Image source={{ uri: facility.imageUri }} style={styles.heroImage} />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={styles.placeholderMark}>P</Text>
            <Text style={styles.placeholderText}>No facility image provided</Text>
          </View>
        )}

        <View style={styles.summary}>
          <View>
            <Text style={styles.summaryLabel}>Availability</Text>
            <Text style={styles.summaryValue}>{facility.availableSlots} slots</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        <Pressable
          style={styles.reviewsButton}
          accessibilityRole="button"
          onPress={() => navigation.navigate('Reviews', { facilityId: facility._id, facilityName: facility.name })}
        >
          <View>
            <Text style={styles.reviewsTitle}>Reviews & Ratings</Text>
            <Text style={styles.reviewsSubtitle}>
              {facility.ratingCount ? `${facility.ratingAverage?.toFixed(1)} based on ${facility.ratingCount} reviews` : 'Be the first to review this facility'}
            </Text>
          </View>
          <Text style={styles.reviewsArrow}>›</Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parking capacity</Text>
          <View style={styles.capacityRow}>
            <CapacityItem label="Car slots" value={facility.carSlots} icon="▣" />
            <CapacityItem label="Bike slots" value={facility.bikeSlots} icon="♢" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hourly pricing</Text>
          <View style={styles.pricingCard}>
            <PriceItem label="Car parking" value={facility.carHourlyRate} />
            <PriceItem label="Bike parking" value={facility.bikeHourlyRate} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facility details</Text>
          <View style={styles.detailCard}>
            <DetailRow label="Address" value={facility.address} />
            <DetailRow label="Owner" value={facility.ownerName} />
            <DetailRow label="Email" value={facility.ownerEmail} />
            <DetailRow label="Contact number" value={facility.contactNumber} last />
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            accessibilityRole="button"
            onPress={() => navigation.navigate('ChooseSlot', { facilityName: facility.name })}
          >
            <Text style={styles.primaryButtonText}>Add a reservation</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            accessibilityRole="button"
            onPress={() => Linking.openURL(`tel:${facility.contactNumber}`)}
          >
            <Text style={styles.secondaryButtonText}>Contact facility</Text>
          </Pressable>
          <Pressable style={styles.backActionButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backActionText}>Back to parking</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CapacityItem({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <View style={styles.capacityItem}>
      <View style={styles.capacityIcon}><Text style={styles.capacityIconText}>{icon}</Text></View>
      <View>
        <Text style={styles.capacityValue}>{value}</Text>
        <Text style={styles.capacityLabel}>{label}</Text>
      </View>
    </View>
  );
}

function PriceItem({ label, value }: { label: string; value?: number }) {
  return (
    <View style={styles.priceItem}>
      <Text style={styles.priceLabel}>{label}</Text>
      <Text style={styles.priceValue}>
        {typeof value === 'number' ? `LKR ${value.toFixed(2)}` : 'Not provided'}
        {typeof value === 'number' && <Text style={styles.priceUnit}> / hour</Text>}
      </Text>
    </View>
  );
}

function DetailRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f7f6' },
  content: { padding: 22, paddingBottom: 32, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  back: { width: 38, height: 38, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e8f4f0' },
  backText: { color: '#17332c', fontSize: 30, lineHeight: 32, marginTop: -3 },
  headerCopy: { flex: 1 },
  title: { color: '#17201e', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#66736f', fontSize: 13, marginTop: 3 },
  heroImage: { width: '100%', height: 176, borderRadius: 18, backgroundColor: '#dce8e4' },
  heroPlaceholder: { width: '100%', height: 176, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#dce8e4' },
  placeholderMark: { color: '#176b58', fontSize: 48, fontWeight: '800' },
  placeholderText: { color: '#66736f', fontSize: 13, marginTop: 6 },
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { color: '#66736f', fontSize: 13 },
  summaryValue: { color: '#17201e', fontSize: 25, fontWeight: '500', marginTop: 1 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: '#e1f4ed' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#24966d' },
  statusText: { color: '#16845f', fontSize: 13, fontWeight: '700' },
  reviewsButton: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 15, backgroundColor: '#fff' },
  reviewsTitle: { color: '#17201e', fontSize: 15, fontWeight: '800' },
  reviewsSubtitle: { color: '#66736f', fontSize: 12, marginTop: 5 },
  reviewsArrow: { color: '#176b58', fontSize: 28 },
  section: { gap: 10 },
  sectionTitle: { color: '#17201e', fontSize: 17, fontWeight: '800' },
  capacityRow: { flexDirection: 'row', gap: 10 },
  capacityItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14, borderRadius: 15, backgroundColor: '#fff' },
  capacityIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e8f4f0' },
  capacityIconText: { color: '#176b58', fontSize: 20, fontWeight: '700' },
  capacityValue: { color: '#17201e', fontSize: 20, fontWeight: '800' },
  capacityLabel: { color: '#66736f', fontSize: 12, marginTop: 1 },
  detailCard: { paddingHorizontal: 16, borderRadius: 17, backgroundColor: '#fff' },
  pricingCard: { flexDirection: 'row', gap: 10 },
  priceItem: { flex: 1, padding: 15, borderRadius: 15, backgroundColor: '#fff' },
  priceLabel: { color: '#66736f', fontSize: 12 },
  priceValue: { color: '#17201e', fontSize: 18, fontWeight: '800', marginTop: 6 },
  priceUnit: { color: '#66736f', fontSize: 12, fontWeight: '500' },
  detailRow: { paddingVertical: 14, gap: 4 },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: '#edf1ef' },
  detailLabel: { color: '#66736f', fontSize: 12 },
  detailValue: { color: '#17201e', fontSize: 14, fontWeight: '600' },
  actions: { gap: 10, marginTop: 2 },
  primaryButton: { minHeight: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#176b58' },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  secondaryButton: { minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#176b58' },
  secondaryButtonText: { color: '#176b58', fontSize: 15, fontWeight: '700' },
  backActionButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  backActionText: { color: '#66736f', fontSize: 14, fontWeight: '600' },
});
