import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';

type Facility = {
  _id: string;
  name: string;
  carSlots: number;
  bikeSlots: number;
  carAvailableSlots?: number;
  bikeAvailableSlots?: number;
};

export default function UpdateSlotsScreen({ navigation, route }: { navigation: any; route: any }) {
  const facility = route.params?.facility as Facility;
  const insets = useSafeAreaInsets();
  const [carAvailableSlots, setCarAvailableSlots] = useState(
    facility?.carAvailableSlots ?? facility?.carSlots ?? 0,
  );
  const [bikeAvailableSlots, setBikeAvailableSlots] = useState(
    facility?.bikeAvailableSlots ?? facility?.bikeSlots ?? 0,
  );
  const [saving, setSaving] = useState(false);

  const carOccupied = useMemo(
    () => Math.max(0, (facility?.carSlots || 0) - carAvailableSlots),
    [carAvailableSlots, facility?.carSlots],
  );
  const bikeOccupied = useMemo(
    () => Math.max(0, (facility?.bikeSlots || 0) - bikeAvailableSlots),
    [bikeAvailableSlots, facility?.bikeSlots],
  );

  const saveAvailability = async () => {
    if (!facility?._id) {
      Alert.alert('Unable to update slots', 'The parking facility could not be identified.');
      return;
    }

    setSaving(true);
    try {
      await api.updateSlotAvailability(facility._id, { carAvailableSlots, bikeAvailableSlots });
      Alert.alert('Availability published', 'Users can now see the updated slot availability.');
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || 'Unable to publish slot availability.';
      Alert.alert('Update failed', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 112 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.headingCopy}>
            <Text style={styles.heading}>Update Slots</Text>
            <Text style={styles.subtitle}>{facility?.name || 'Parking facility'} · Live</Text>
          </View>
        </View>

        <SlotCard
          type="Car"
          icon="▰"
          capacity={facility?.carSlots || 0}
          available={carAvailableSlots}
          occupied={carOccupied}
          onDecrease={() => setCarAvailableSlots((value) => Math.max(0, value - 1))}
          onIncrease={() => setCarAvailableSlots((value) => Math.min(facility?.carSlots || 0, value + 1))}
        />
        <SlotCard
          type="Bike"
          icon="♧"
          capacity={facility?.bikeSlots || 0}
          available={bikeAvailableSlots}
          occupied={bikeOccupied}
          onDecrease={() => setBikeAvailableSlots((value) => Math.max(0, value - 1))}
          onIncrease={() => setBikeAvailableSlots((value) => Math.min(facility?.bikeSlots || 0, value + 1))}
        />

        <View style={styles.syncCard}>
          <View style={styles.syncDot} />
          <View style={styles.syncCopy}>
            <Text style={styles.syncTitle}>Public Map Sync</Text>
            <Text style={styles.syncText}>
              Changes are published instantly. Driver search results and public counters will show the new availability.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={saveAvailability}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed, saving && styles.disabledButton]}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Save & Publish Live</Text>}
        </Pressable>
      </ScrollView>

      <View style={[styles.bottomNav, { bottom: insets.bottom + 14 }]}>
        <OwnerNavItem icon="⌕" label="Explore" onPress={() => navigation.navigate('OwnerHome')} />
        <OwnerNavItem icon="▦" label="Manage" active onPress={() => navigation.navigate('OwnerManage')} />
        <OwnerNavItem icon="P" label="Parking profile" onPress={() => navigation.navigate('ParkingProfile')} />
      </View>
    </SafeAreaView>
  );
}

function SlotCard({
  type,
  icon,
  capacity,
  available,
  occupied,
  onDecrease,
  onIncrease,
}: {
  type: string;
  icon: string;
  capacity: number;
  available: number;
  occupied: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  const occupancy = capacity ? occupied / capacity : 0;
  return (
    <View style={styles.slotCard}>
      <View style={styles.slotHeader}>
        <View style={styles.slotTitleGroup}>
          <View style={styles.slotIcon}><Text style={styles.slotIconText}>{icon}</Text></View>
          <View>
            <Text style={styles.slotTitle}>{type} Slots</Text>
            <Text style={styles.capacity}>CAPACITY: {capacity}</Text>
          </View>
        </View>
        <View style={styles.availableBadge}>
          <Text style={styles.availableText}>{available} available</Text>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${occupancy * 100}%` }]} />
      </View>
      <View style={styles.slotMeta}>
        <Text style={styles.metaText}>{occupied} occupied ({Math.round(occupancy * 100)}%)</Text>
        <Text style={styles.metaText}>{capacity} total</Text>
      </View>
      <View style={styles.stepper}>
        <Pressable accessibilityRole="button" onPress={onDecrease} style={styles.stepButton}>
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <View style={styles.occupiedCopy}>
          <Text style={styles.occupiedValue}>{occupied}</Text>
          <Text style={styles.occupiedLabel}>OCCUPIED</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onIncrease} style={[styles.stepButton, styles.addButton]}>
          <Text style={[styles.stepText, styles.addText]}>+</Text>
        </Pressable>
      </View>
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
  content: { paddingHorizontal: 20, paddingTop: 18, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backButton: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: '#dde5e2', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#17201e', fontSize: 30, lineHeight: 32, marginTop: -4 },
  headingCopy: { gap: 2 },
  heading: { color: '#17201e', fontSize: 23, fontWeight: '800' },
  subtitle: { color: '#66736f', fontSize: 13 },
  slotCard: { padding: 18, borderWidth: 1, borderColor: '#d9e2de', borderRadius: 20, backgroundColor: '#fff', gap: 10 },
  slotHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  slotTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  slotIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#e8f4f0', alignItems: 'center', justifyContent: 'center' },
  slotIconText: { color: '#176b58', fontSize: 18, fontWeight: '800' },
  slotTitle: { color: '#17201e', fontSize: 15, fontWeight: '800' },
  capacity: { color: '#66736f', fontSize: 11, fontWeight: '700', marginTop: 2 },
  availableBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: '#e8f4f0' },
  availableText: { color: '#176b58', fontSize: 12, fontWeight: '800' },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: '#edf2f0', overflow: 'hidden', marginTop: 5 },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: '#176b58' },
  slotMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { color: '#66736f', fontSize: 11 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  stepButton: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#d9e2de', backgroundColor: '#f4f7f6', alignItems: 'center', justifyContent: 'center' },
  addButton: { borderWidth: 0, backgroundColor: '#176b58' },
  stepText: { color: '#17201e', fontSize: 25, lineHeight: 28 },
  addText: { color: '#fff' },
  occupiedCopy: { alignItems: 'center', gap: 1 },
  occupiedValue: { color: '#17201e', fontSize: 32, lineHeight: 35, fontWeight: '800' },
  occupiedLabel: { color: '#66736f', fontSize: 11, fontWeight: '700' },
  syncCard: { padding: 16, borderRadius: 12, backgroundColor: '#e8f4f0', flexDirection: 'row', gap: 12, alignItems: 'center' },
  syncDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#24966d' },
  syncCopy: { flex: 1, gap: 4 },
  syncTitle: { color: '#17201e', fontSize: 13, fontWeight: '800' },
  syncText: { color: '#66736f', fontSize: 12, lineHeight: 17 },
  primaryButton: { height: 54, borderRadius: 12, backgroundColor: '#176b58', alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  buttonPressed: { opacity: 0.85 },
  disabledButton: { opacity: 0.65 },
  bottomNav: { position: 'absolute', left: 10, right: 10, height: 68, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 16, backgroundColor: '#fff', shadowColor: '#17332c', shadowOpacity: 0.08, shadowRadius: 9, elevation: 3 },
  navItem: { width: 100, alignItems: 'center', gap: 4 },
  navIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7f6' },
  activeNavIcon: { backgroundColor: '#e8f4f0' },
  navIconText: { color: '#66736f', fontSize: 19, fontWeight: '700' },
  activeNavIconText: { color: '#176b58' },
  navLabel: { color: '#66736f', fontSize: 11, fontWeight: '600' },
  activeNavLabel: { color: '#176b58', fontWeight: '800' },
});
