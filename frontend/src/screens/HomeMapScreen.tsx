import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';
import { ParkingFacility } from './ParkingDetailsScreen';

type Facility = ParkingFacility;

const fallbackRegion: Region = {
  latitude: 6.9271,
  longitude: 79.8612,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

function distanceInKm(a: Facility, region: Region) {
  const latitudeDelta = Math.abs(a.latitude - region.latitude);
  const longitudeDelta = Math.abs(a.longitude - region.longitude);
  return Math.sqrt(latitudeDelta ** 2 + longitudeDelta ** 2) * 111;
}

function ParkingMarker({ slots }: { slots: number }) {
  return (
    <View style={styles.marker}>
      <View style={styles.slotBubble}>
        <Text style={styles.slotText}>{slots} slots</Text>
      </View>
      <Text style={styles.pin}>⌖</Text>
    </View>
  );
}

export default function HomeMapScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<Region>(fallbackRegion);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const isFocused = useIsFocused();

  const loadFacilities = useCallback(() => {
    setLoading(true);
    api.getFacilities(query)
      .then((response) => {
        setFacilities(response.facilities);
        setError('');
      })
      .catch((requestError) => {
        console.error('Unable to load parking facilities:', requestError);
        setError('Unable to load parking for this search.');
      })
      .finally(() => {
        setLoading(false);
        setSearching(false);
      });
  }, [query]);

  useEffect(() => {
    if (!isFocused) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setSearching(Boolean(query.trim()));
      loadFacilities();
    }, query.trim() ? 350 : 0);

    return () => clearTimeout(timer);
  }, [isFocused, loadFacilities, query]);

  return (
    <View style={styles.screen}>
      <MapView
        style={[styles.map, { top: insets.top, bottom: insets.bottom }]}
        initialRegion={fallbackRegion}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        mapType="standard"
        zoomEnabled
        scrollEnabled
        rotateEnabled
        zoomControlEnabled
      >
        {facilities.map((facility) => (
          <Marker
            key={facility._id}
            coordinate={{ latitude: facility.latitude, longitude: facility.longitude }}
            title={facility.name}
            description={`${facility.availableSlots} slots available`}
          >
            <ParkingMarker slots={facility.availableSlots} />
          </Marker>
        ))}
      </MapView>

      <View style={[styles.controls, { top: insets.top + 15 }]}>
        <View style={styles.greeting}>
          <View>
            <Text style={styles.goodMorning}>Good morning</Text>
            <Text style={styles.title}>Find a parking spot</Text>
          </View>
          <View style={styles.logo}><Text style={styles.logoText}>P</Text></View>
        </View>
        <View style={styles.search}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Location or facility name"
            placeholderTextColor="#66736f"
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={[styles.cards, { bottom: insets.bottom + 15 + 72 + 12 }]}>
        {loading || searching ? (
          <ActivityIndicator color="#176b58" style={styles.loader} />
        ) : error ? (
          <Text style={styles.empty}>{error}</Text>
        ) : facilities.length === 0 ? (
          <Text style={styles.empty}>No nearby parking facilities found.</Text>
        ) : (
          facilities.slice(0, 4).map((facility) => (
            <Pressable
              key={facility._id}
              style={styles.card}
              accessibilityRole="button"
              accessibilityLabel={`View details for ${facility.name}`}
              onPress={() => navigation.navigate('ParkingDetails', { facility })}
            >
              <View style={styles.facilitySymbol}><Text style={styles.facilityP}>P</Text></View>
              <View style={styles.facilityInfo}>
                <Text style={styles.facilityName} numberOfLines={1}>{facility.name}</Text>
                <Text style={styles.facilityAddress} numberOfLines={1}>
                  {facility.address} · {distanceInKm(facility, region).toFixed(1)} km
                </Text>
                <View style={styles.availability}>
                  <Text style={styles.live}>{facility.availableSlots} slots live</Text>
                  <Text style={styles.rate}>Available</Text>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </View>

      <View style={[styles.bottomNav, { bottom: insets.bottom + 15 }]}>
        <Tab icon="⌕" label="Explore" active />
        <Tab icon="□" label="Reservations" />
        <Tab icon="♙" label="My profile" onPress={() => navigation.navigate('Profile')} />
      </View>
    </View>
  );
}

function Tab({ icon, label, active, onPress }: { icon: string; label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <View style={[styles.tabIcon, active && styles.activeTabIcon]}>
        <Text style={[styles.tabIconText, active && styles.activeTabIconText]}>{icon}</Text>
      </View>
      <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f7f6' },
  map: { ...StyleSheet.absoluteFillObject },
  controls: { position: 'absolute', left: 17, right: 17, gap: 12 },
  greeting: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  goodMorning: { color: '#66736f', fontSize: 13 },
  title: { color: '#17201e', fontSize: 22, lineHeight: 27 },
  logo: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4b740' },
  logoText: { color: '#17332c', fontSize: 22, fontWeight: '800' },
  search: { height: 50, borderRadius: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', shadowColor: '#17332c', shadowOpacity: 0.08, shadowRadius: 9, elevation: 3 },
  searchIcon: { color: '#66736f', fontSize: 24 },
  searchInput: { flex: 1, color: '#17201e', fontSize: 15, paddingVertical: 0 },
  marker: { alignItems: 'center' },
  slotBubble: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: '#176b58' },
  slotText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  pin: { color: '#176b58', fontSize: 21, marginTop: -2 },
  cards: { position: 'absolute', left: 8, right: 8, maxHeight: 190, padding: 8, gap: 10, borderRadius: 15, backgroundColor: '#fff', shadowColor: '#17332c', shadowOpacity: 0.08, shadowRadius: 9, elevation: 3 },
  card: { minHeight: 79, padding: 14, flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: '#dde5e2', borderRadius: 18, backgroundColor: '#fff' },
  facilitySymbol: { width: 54, height: 54, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e8f4f0' },
  facilityP: { color: '#176b58', fontSize: 22, fontWeight: '800' },
  facilityInfo: { flex: 1, gap: 4 },
  facilityName: { color: '#17201e', fontSize: 15, fontWeight: '700' },
  facilityAddress: { color: '#66736f', fontSize: 11 },
  availability: { flexDirection: 'row', justifyContent: 'space-between' },
  live: { color: '#24966d', fontSize: 13 },
  rate: { color: '#17201e', fontSize: 13 },
  loader: { padding: 18 },
  empty: { color: '#66736f', padding: 18, textAlign: 'center' },
  bottomNav: { position: 'absolute', left: 17, right: 17, height: 72, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 20, borderWidth: 1, borderColor: '#dde5e2', backgroundColor: '#fff', shadowColor: '#17332c', shadowOpacity: 0.08, shadowRadius: 9, elevation: 3 },
  tab: { width: '31%', alignItems: 'center', gap: 4 },
  tabIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7f6' },
  activeTabIcon: { backgroundColor: '#176b58' },
  tabIconText: { color: '#66736f', fontSize: 18 },
  activeTabIconText: { color: '#fff' },
  tabLabel: { color: '#66736f', fontSize: 12 },
  activeTabLabel: { color: '#176b58', fontWeight: '600' },
});
