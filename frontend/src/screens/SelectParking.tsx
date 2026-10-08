import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HomeScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
}

interface Facility {
  name: string;
  address: string;
  distance: string;
  slots: number;
  price: string;
}

const facilities: Facility[] = [
  {
    name: 'Central Plaza Parking',
    address: '120 Market Street',
    distance: '0.4 km',
    slots: 12,
    price: '$3/hr',
  },
  {
    name: 'Parkside Garage',
    address: '45 Park Avenue',
    distance: '0.8 km',
    slots: 8,
    price: '$2.50/hr',
  },
  {
    name: 'Downtown Parking Hub',
    address: '8 Main Street',
    distance: '1.2 km',
    slots: 24,
    price: '$4/hr',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(facilities[0].name);

  const visibleFacilities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return facilities;
    }
    return facilities.filter((facility) =>
      `${facility.name} ${facility.address}`.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <View>
            <Text style={styles.title}>Select facility</Text>
            <Text style={styles.step}>Step 1 of 3</Text>
          </View>
        </View>

        <View style={styles.progressTrack} accessibilityLabel="Step 1 of 3">
          <View style={styles.progressActive} />
          <View style={styles.progressInactive} />
          <View style={styles.progressInactive} />
        </View>

        <Text style={styles.subtitle}>
          Choose a nearby facility for your reservation.
        </Text>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            accessibilityLabel="Search facilities"
            onChangeText={setQuery}
            placeholder="Location or facility name"
            placeholderTextColor="#7b8582"
            style={styles.searchInput}
            value={query}
          />
        </View>

        <View style={styles.facilityList}>
          {visibleFacilities.map((facility) => {
            const isSelected = selectedFacility === facility.name;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={facility.name}
                onPress={() => setSelectedFacility(facility.name)}
                style={[styles.facilityCard, isSelected && styles.selectedCard]}
              >
                <View style={styles.parkingIcon}>
                  <Text style={styles.parkingLetter}>P</Text>
                </View>
                <View style={styles.facilityDetails}>
                  <Text style={styles.facilityName}>{facility.name}</Text>
                  <Text style={styles.facilityMeta}>
                    {facility.address} · {facility.distance}
                  </Text>
                  <Text style={styles.slots}>{facility.slots} slots live</Text>
                </View>
                <Text style={styles.price}>{facility.price}</Text>
              </Pressable>
            );
          })}
          {visibleFacilities.length === 0 && (
            <Text style={styles.emptyState}>No facilities match your search.</Text>
          )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.selectedLabel}>Selected: {selectedFacility}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('ChooseSlot')}
          style={styles.continueButton}
        >
          <Text style={styles.continueText}>Choose a facility</Text>
          <Text style={styles.continueArrow}>→</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f8f6',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 140,
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
  progressInactive: {
    backgroundColor: '#dce6e2',
    borderRadius: 4,
    flex: 1,
    height: 5,
  },
  subtitle: {
    color: '#63706c',
    fontSize: 16,
    marginTop: 24,
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    flexDirection: 'row',
    marginTop: 20,
    paddingHorizontal: 18,
    shadowColor: '#193c34',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    color: '#687672',
    fontSize: 31,
    lineHeight: 34,
    marginRight: 10,
    transform: [{ rotate: '-20deg' }],
  },
  searchInput: {
    color: '#21332e',
    flex: 1,
    fontSize: 16,
    height: 62,
  },
  facilityList: {
    gap: 14,
    marginTop: 20,
  },
  facilityCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#dfe7e4',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 102,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectedCard: {
    borderColor: '#1f8068',
    borderWidth: 2,
  },
  parkingIcon: {
    alignItems: 'center',
    backgroundColor: '#e5f3ef',
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    marginRight: 14,
    width: 54,
  },
  parkingLetter: {
    color: '#1b8067',
    fontSize: 28,
    fontWeight: 'bold',
  },
  facilityDetails: {
    flex: 1,
  },
  facilityName: {
    color: '#1d2b27',
    fontSize: 16,
    fontWeight: '700',
  },
  facilityMeta: {
    color: '#788480',
    fontSize: 13,
    marginTop: 5,
  },
  slots: {
    color: '#268a70',
    fontSize: 14,
    marginTop: 5,
  },
  price: {
    alignSelf: 'flex-start',
    color: '#1d2b27',
    fontSize: 15,
    marginTop: 4,
  },
  emptyState: {
    color: '#63706c',
    fontSize: 15,
    paddingVertical: 28,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#f4f8f6',
    borderTopColor: '#e1ebe7',
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  selectedLabel: {
    color: '#74807d',
    fontSize: 13,
    marginBottom: 10,
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: '#1f8068',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 52,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  continueArrow: {
    color: '#fff',
    fontSize: 21,
    marginLeft: 10,
  },
});

export default HomeScreen;
