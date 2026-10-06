import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import axios from 'axios';
import MapView, { MapPressEvent, Marker, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

const initialRegion: Region = {
  latitude: 6.9271,
  longitude: 79.8612,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

type Coordinate = Pick<Location.LocationObjectCoords, 'latitude' | 'longitude'>;

function Field({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  onPress,
  keyboardType = 'default',
  onBlur,
}: {
  label: string;
  icon: string;
  placeholder: string;
  value: string;
  onChangeText?: (value: string) => void;
  onPress?: () => void;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
  onBlur?: () => void;
}) {
  const input = (
    <View style={styles.input}>
      <Text style={styles.inputIcon}>{icon}</Text>
      <TextInput
        style={styles.inputText}
        placeholder={placeholder}
        placeholderTextColor="#66736f"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={!onPress}
        onBlur={onBlur}
      />
    </View>
  );

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {onPress ? <Pressable onPress={onPress}>{input}</Pressable> : input}
    </View>
  );
}

export default function OwnerRegistrationScreen({ navigation }: { navigation: any }) {
  const [ownerName, setOwnerName] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [address, setAddress] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [carSlots, setCarSlots] = useState('');
  const [bikeSlots, setBikeSlots] = useState('');
  const [carHourlyRate, setCarHourlyRate] = useState('');
  const [bikeHourlyRate, setBikeHourlyRate] = useState('');
  const [imageUri, setImageUri] = useState<string>();
  const [nameAvailability, setNameAvailability] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [coordinate, setCoordinate] = useState<Coordinate>({
    latitude: initialRegion.latitude,
    longitude: initialRegion.longitude,
  });

  const openLocationPicker = async () => {
    setMapVisible(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      setCoordinate(current.coords);
    } catch (error) {
      console.error('Unable to get current location for facility picker:', error);
    }
  };

  const updateLocation = async (nextCoordinate: Coordinate) => {
    setCoordinate(nextCoordinate);
    try {
      const results = await Location.reverseGeocodeAsync(nextCoordinate);
      const place = results[0];
      if (place) {
        const parts = [place.name, place.city, place.region, place.postalCode].filter(Boolean);
        setAddress(parts.join(', '));
      }
    } catch (error) {
      console.error('Unable to resolve selected parking location:', error);
      setAddress(
        `${nextCoordinate.latitude.toFixed(5)}, ${nextCoordinate.longitude.toFixed(5)}`
      );
    }
  };

  const selectMapLocation = (event: MapPressEvent) => {
    void updateLocation(event.nativeEvent.coordinate);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission required', 'Allow photo access to upload a facility image or logo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const validateFacilityName = async () => {
    if (!facilityName.trim()) {
      setNameAvailability('idle');
      return;
    }
    setNameAvailability('checking');
    try {
      const result = await api.checkFacilityName(facilityName);
      setNameAvailability(result.available ? 'available' : 'taken');
    } catch (error) {
      setNameAvailability('idle');
      console.error('Unable to check facility name:', error);
    }
  };

  const submit = async () => {
    if (!ownerName.trim() || !facilityName.trim() || !ownerEmail.trim() || !address.trim() || !contactNumber.trim()) {
      Alert.alert('Missing details', 'Please complete the owner, facility, email, contact, and address fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid owner email address.');
      return;
    }
    if (
      carHourlyRate.trim() === '' ||
      bikeHourlyRate.trim() === '' ||
      !Number.isFinite(Number(carHourlyRate)) ||
      !Number.isFinite(Number(bikeHourlyRate)) ||
      Number(carHourlyRate) < 0 ||
      Number(bikeHourlyRate) < 0
    ) {
      Alert.alert('Invalid pricing', 'Please enter valid hourly charges for both car and bike slots.');
      return;
    }
    setSubmitting(true);
    try {
      const nameCheck = await api.checkFacilityName(facilityName);
      if (!nameCheck.available) {
        setNameAvailability('taken');
        Alert.alert('Name already exists', 'Please choose a different parking lot name.');
        return;
      }
      setNameAvailability('available');
      await api.registerFacility({
        ownerName,
        ownerEmail,
        contactNumber,
        name: facilityName,
        address,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        carSlots: Number(carSlots) || 0,
        bikeSlots: Number(bikeSlots) || 0,
        carHourlyRate: Number(carHourlyRate),
        bikeHourlyRate: Number(bikeHourlyRate),
        imageUri,
      });
      Alert.alert('Submitted for review', 'We will verify your facility details before it goes live.', [
        { text: 'OK', onPress: () => navigation.replace('OwnerRegistrationStatus', { status: 'pending' }) },
      ]);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error?.message || 'Unable to register this facility.'
        : 'Unable to register this facility.';
      Alert.alert('Registration failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.headingCopy}>
            <Text style={styles.heading}>Register your facility</Text>
            <Text style={styles.subtitle}>Join ParkFlow as a parking owner</Text>
          </View>
        </View>

        <Pressable style={styles.photoUpload} accessibilityRole="button" onPress={pickImage}>
          <View style={styles.photo}>
            {imageUri ? <Text style={styles.photoIcon}>✓</Text> : <Text style={styles.photoIcon}>▥</Text>}
          </View>
          <Text style={styles.uploadText}>Upload photo or logo</Text>
        </Pressable>

        <Field
          label="Owner name"
          icon="♙"
          placeholder="Full name"
          value={ownerName}
          onChangeText={setOwnerName}
        />
        <Field
          label="Parking lot name"
          icon="▥"
          placeholder="Facility name"
          value={facilityName}
          onChangeText={(value) => {
            setFacilityName(value);
            setNameAvailability('idle');
          }}
          onBlur={() => void validateFacilityName()}
        />
        {nameAvailability === 'checking' && <Text style={styles.validationText}>Checking availability…</Text>}
        {nameAvailability === 'taken' && <Text style={styles.errorText}>This parking lot name already exists.</Text>}
        {nameAvailability === 'available' && <Text style={styles.successText}>This parking lot name is available.</Text>}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Address</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select parking location on map"
            onPress={() => void openLocationPicker()}
            style={styles.input}
          >
            <Text style={styles.inputIcon}>⌖</Text>
            <Text style={[styles.inputText, !address && styles.placeholderText]}>
              {address || 'Select parking location on map'}
            </Text>
          </Pressable>
        </View>
        <Field
          label="Owner email"
          icon="@"
          placeholder="Email address"
          value={ownerEmail}
          onChangeText={setOwnerEmail}
          keyboardType="email-address"
        />
        <Field
          label="Contact number"
          icon="⌕"
          placeholder="Phone number"
          value={contactNumber}
          onChangeText={setContactNumber}
          keyboardType="phone-pad"
        />

        <View style={styles.slotRow}>
          <View style={styles.slot}>
            <Field
              label="Car slots"
              icon="▱"
              placeholder="00"
              value={carSlots}
              onChangeText={setCarSlots}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.slot}>
            <Field
              label="Bike slots"
              icon="♢"
              placeholder="00"
              value={bikeSlots}
              onChangeText={setBikeSlots}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.slotRow}>
          <View style={styles.slot}>
            <Field
              label="Car price / hour"
              icon="$"
              placeholder="0.00"
              value={carHourlyRate}
              onChangeText={setCarHourlyRate}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.slot}>
            <Field
              label="Bike price / hour"
              icon="$"
              placeholder="0.00"
              value={bikeHourlyRate}
              onChangeText={setBikeHourlyRate}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>We’ll verify your facility details before it goes live.</Text>
        </View>
        <Pressable onPress={() => void submit()} style={[styles.primaryButton, submitting && styles.disabledButton]} disabled={submitting}>
          <Text style={styles.primaryText}>{submitting ? 'Submitting…' : 'Register Parking Facility'}</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={mapVisible} animationType="slide" onRequestClose={() => setMapVisible(false)}>
        <SafeAreaView style={styles.mapScreen}>
          <View style={styles.mapHeader}>
            <Pressable onPress={() => setMapVisible(false)} style={styles.mapClose}>
              <Text style={styles.mapCloseText}>‹</Text>
            </Pressable>
            <View>
              <Text style={styles.mapTitle}>Select parking location</Text>
              <Text style={styles.mapSubtitle}>Tap the map or drag the pin</Text>
            </View>
          </View>
          <MapView
            style={styles.map}
            initialRegion={{ ...initialRegion, ...coordinate }}
            onPress={selectMapLocation}
            showsUserLocation
          >
            <Marker
              coordinate={coordinate}
              draggable
              onDragEnd={(event) => void updateLocation(event.nativeEvent.coordinate)}
              pinColor="#176b58"
            />
          </MapView>
          <View style={styles.mapFooter}>
            <Text style={styles.selectedAddress}>{address || 'Choose a location for your facility'}</Text>
            <Pressable onPress={() => setMapVisible(false)} style={styles.primaryButton}>
              <Text style={styles.primaryText}>Use this location</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f7f6' },
  content: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 18, paddingBottom: 32, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f4f0',
  },
  backText: { color: '#17201e', fontSize: 29, lineHeight: 31, marginTop: -3 },
  headingCopy: { flex: 1, gap: 3 },
  heading: { color: '#17201e', fontSize: 22, lineHeight: 27, fontWeight: '700' },
  subtitle: { color: '#66736f', fontSize: 13 },
  photoUpload: { alignItems: 'flex-start', gap: 8 },
  photo: {
    width: 82,
    height: 82,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f4f0',
  },
  photoIcon: { color: '#176b58', fontSize: 30 },
  uploadText: { color: '#176b58', fontSize: 13 },
  field: { gap: 6 },
  fieldLabel: { color: '#17201e', fontSize: 13, fontWeight: '600' },
  input: {
    height: 48,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#dde5e2',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  inputIcon: { width: 18, color: '#66736f', fontSize: 19, textAlign: 'center' },
  inputText: { flex: 1, color: '#17201e', fontSize: 15, paddingVertical: 0 },
  placeholderText: { color: '#66736f' },
  validationText: { color: '#66736f', fontSize: 12, marginTop: -8 },
  errorText: { color: '#b42318', fontSize: 12, marginTop: -8 },
  successText: { color: '#176b58', fontSize: 12, marginTop: -8 },
  slotRow: { flexDirection: 'row', gap: 10 },
  slot: { flex: 1 },
  note: { padding: 12, borderRadius: 12, backgroundColor: '#e8f4f0' },
  noteText: { color: '#176b58', fontSize: 13, lineHeight: 18 },
  primaryButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#176b58',
  },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  disabledButton: { opacity: 0.65 },
  mapScreen: { flex: 1, backgroundColor: '#f4f7f6' },
  mapHeader: { padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  mapClose: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e8f4f0' },
  mapCloseText: { color: '#17201e', fontSize: 29, lineHeight: 31, marginTop: -3 },
  mapTitle: { color: '#17201e', fontSize: 20, fontWeight: '700' },
  mapSubtitle: { color: '#66736f', fontSize: 13, marginTop: 3 },
  map: { flex: 1 },
  mapFooter: { padding: 18, gap: 14, backgroundColor: '#fff' },
  selectedAddress: { color: '#17201e', fontSize: 14, lineHeight: 20 },
});
