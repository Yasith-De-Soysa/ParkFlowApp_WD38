import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

type Facility = {
  _id: string;
  ownerName: string;
  contactNumber: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  carSlots: number;
  bikeSlots: number;
  carHourlyRate: number;
  bikeHourlyRate: number;
};

export default function EditParkingProfileScreen({ navigation, route }: { navigation: any; route: any }) {
  const facility = route.params?.facility as Facility;
  const [ownerName, setOwnerName] = useState(facility.ownerName);
  const [contactNumber, setContactNumber] = useState(facility.contactNumber);
  const [name, setName] = useState(facility.name);
  const [address, setAddress] = useState(facility.address);
  const [carSlots, setCarSlots] = useState(String(facility.carSlots));
  const [bikeSlots, setBikeSlots] = useState(String(facility.bikeSlots));
  const [carHourlyRate, setCarHourlyRate] = useState(String(facility.carHourlyRate));
  const [bikeHourlyRate, setBikeHourlyRate] = useState(String(facility.bikeHourlyRate));
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!ownerName.trim() || !contactNumber.trim() || !name.trim() || !address.trim()) {
      Alert.alert('Missing details', 'Please complete all parking details.');
      return;
    }
    const values = [carSlots, bikeSlots, carHourlyRate, bikeHourlyRate].map(Number);
    if (values.some((value) => !Number.isFinite(value) || value < 0)) {
      Alert.alert('Invalid values', 'Slots and hourly rates must be valid non-negative numbers.');
      return;
    }
    setSaving(true);
    try {
      await api.updateOwnerFacility(facility._id, {
        ownerName, contactNumber, name, address,
        latitude: facility.latitude,
        longitude: facility.longitude,
        carSlots: values[0],
        bikeSlots: values[1],
        carHourlyRate: values[2],
        bikeHourlyRate: values[3],
      });
      Alert.alert('Update submitted for review', 'Your approved parking profile will remain unchanged until an admin approves this update.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Update failed', error?.response?.data?.error?.message || 'Unable to submit this update.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹</Text></Pressable>
            <View><Text style={styles.title}>Edit parking profile</Text><Text style={styles.subtitle}>Changes require admin approval</Text></View>
          </View>
          <Field label="Owner name" value={ownerName} onChangeText={setOwnerName} />
          <Field label="Contact number" value={contactNumber} onChangeText={setContactNumber} keyboardType="phone-pad" />
          <Field label="Parking lot name" value={name} onChangeText={setName} />
          <Field label="Address" value={address} onChangeText={setAddress} multiline />
          <View style={styles.row}>
            <Field label="Car slots" value={carSlots} onChangeText={setCarSlots} keyboardType="numeric" compact />
            <Field label="Bike slots" value={bikeSlots} onChangeText={setBikeSlots} keyboardType="numeric" compact />
          </View>
          <View style={styles.row}>
            <Field label="Car hourly rate" value={carHourlyRate} onChangeText={setCarHourlyRate} keyboardType="numeric" compact />
            <Field label="Bike hourly rate" value={bikeHourlyRate} onChangeText={setBikeHourlyRate} keyboardType="numeric" compact />
          </View>
          <View style={styles.notice}><Text style={styles.noticeText}>Your current profile stays active while this change request is reviewed.</Text></View>
          <Pressable style={styles.button} onPress={submit} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit for admin approval</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, keyboardType = 'default', multiline = false, compact = false }: {
  label: string; value: string; onChangeText: (value: string) => void; keyboardType?: 'default' | 'phone-pad' | 'numeric'; multiline?: boolean; compact?: boolean;
}) {
  return <View style={[styles.field, compact && styles.compactField]}><Text style={styles.label}>{label}</Text><TextInput style={[styles.input, multiline && styles.multiline]} value={value} onChangeText={onChangeText} keyboardType={keyboardType} multiline={multiline} placeholderTextColor="#66736f" /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f7f6' },
  keyboard: { flex: 1 },
  content: { padding: 22, paddingBottom: 34, gap: 15 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  back: { color: '#176b58', fontSize: 36, lineHeight: 36 },
  title: { color: '#17201e', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#66736f', fontSize: 13, marginTop: 3 },
  field: { gap: 6 },
  compactField: { flex: 1 },
  label: { color: '#17201e', fontSize: 13, fontWeight: '600' },
  input: { minHeight: 48, borderWidth: 1, borderColor: '#d9e2de', borderRadius: 12, backgroundColor: '#fff', color: '#17201e', paddingHorizontal: 13, fontSize: 15 },
  multiline: { minHeight: 78, paddingTop: 12, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  notice: { padding: 13, borderRadius: 12, backgroundColor: '#e8f4f0' },
  noticeText: { color: '#176b58', fontSize: 13, lineHeight: 18 },
  button: { height: 52, borderRadius: 13, backgroundColor: '#176b58', alignItems: 'center', justifyContent: 'center', marginTop: 3 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
