import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

type Facility = {
  _id: string; ownerName: string; ownerEmail: string; contactNumber: string; name: string;
  address: string; carSlots: number; bikeSlots: number; carHourlyRate: number; bikeHourlyRate: number; imageUri?: string;
  reviewType?: 'registration' | 'update';
  reviewData?: Facility;
};

export default function AdminDashboardScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const load = useCallback(() => {
    setLoading(true);
    api.getPendingFacilities().then((response) => setFacilities(response.facilities)).catch(() => Alert.alert('Unable to load registrations', 'Please try again.')).finally(() => setLoading(false));
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const createOwner = async () => {
    if (!email.trim() || password.length < 6) return Alert.alert('Invalid login', 'Enter an email and a password of at least 6 characters.');
    setCreating(true);
    try {
      await api.createOwnerAccount({ email, password });
      setEmail(''); setPassword('');
      Alert.alert('Owner login created', 'The owner can now sign in and submit a facility registration.');
    } catch (error: any) {
      Alert.alert('Unable to create login', error?.response?.data?.error?.message || 'Please try again.');
    } finally { setCreating(false); }
  };

  const review = async (facilityId: string, action: 'approve' | 'decline') => {
    try {
      await api.reviewFacility(facilityId, action);
      setFacilities((items) => items.filter((item) => item._id !== facilityId));
    } catch (error: any) {
      Alert.alert('Review failed', error?.response?.data?.error?.message || 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}><View><Text style={styles.kicker}>PARKFLOW ADMIN</Text><Text style={styles.title}>Dashboard</Text></View><Pressable onPress={() => navigation.replace('Login')}><Text style={styles.logout}>Log out</Text></Pressable></View>
        <View style={styles.createCard}>
          <Text style={styles.cardTitle}>Create owner login</Text>
          <Text style={styles.help}>Give a parking lot owner access to submit their facility for review.</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Owner email" />
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Temporary password" />
          <Pressable style={styles.primary} onPress={createOwner} disabled={creating}>{creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Create owner login</Text>}</Pressable>
        </View>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Facility registrations</Text><Pressable onPress={load}><Text style={styles.refresh}>Refresh</Text></Pressable></View>
        {loading ? <ActivityIndicator color="#176b58" /> : facilities.length === 0 ? <Text style={styles.empty}>No registrations waiting for review.</Text> : facilities.map((facility) => (
          <View style={styles.facilityCard} key={facility._id}>
            {facility.reviewData?.imageUri ? <Image source={{ uri: facility.reviewData.imageUri }} style={styles.image} /> : null}
            <Text style={styles.reviewType}>{facility.reviewType === 'update' ? 'PROFILE UPDATE REQUEST' : 'NEW REGISTRATION'}</Text>
            <Text style={styles.facilityName}>{facility.reviewData?.name || facility.name}</Text>
            <Text style={styles.detail}>{facility.reviewData?.ownerName || facility.ownerName} · {facility.ownerEmail}</Text>
            <Text style={styles.detail}>{facility.reviewData?.contactNumber || facility.contactNumber}</Text>
            <Text style={styles.detail}>{facility.reviewData?.address || facility.address}</Text>
            <Text style={styles.detail}>Cars: {facility.reviewData?.carSlots ?? facility.carSlots} · Bikes: {facility.reviewData?.bikeSlots ?? facility.bikeSlots}</Text>
            <Text style={styles.detail}>Rates: {facility.reviewData?.carHourlyRate ?? facility.carHourlyRate} / {facility.reviewData?.bikeHourlyRate ?? facility.bikeHourlyRate} per hour</Text>
            <View style={styles.actions}><Pressable style={styles.decline} onPress={() => review(facility._id, 'decline')}><Text style={styles.declineText}>Decline</Text></Pressable><Pressable style={styles.approve} onPress={() => review(facility._id, 'approve')}><Text style={styles.approveText}>Approve</Text></Pressable></View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f7f6' },
  content: { padding: 18, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { color: '#176b58', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { color: '#17201e', fontSize: 28, fontWeight: '700' },
  logout: { color: '#176b58', fontWeight: '600' },
  createCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, gap: 10 },
  cardTitle: { color: '#17201e', fontSize: 18, fontWeight: '700' },
  help: { color: '#66736f', fontSize: 13, lineHeight: 18 },
  input: { height: 46, borderWidth: 1, borderColor: '#dde5e2', borderRadius: 10, paddingHorizontal: 12, color: '#17201e' },
  primary: { height: 48, borderRadius: 10, backgroundColor: '#176b58', alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#fff', fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#17201e', fontSize: 20, fontWeight: '700' },
  refresh: { color: '#176b58', fontWeight: '600' },
  empty: { color: '#66736f', textAlign: 'center', padding: 24 },
  facilityCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, gap: 5 },
  image: { width: '100%', height: 130, borderRadius: 12, marginBottom: 6 },
  facilityName: { color: '#17201e', fontSize: 18, fontWeight: '700' },
  reviewType: { color: '#176b58', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  detail: { color: '#66736f', fontSize: 13 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  decline: { flex: 1, height: 44, borderWidth: 1, borderColor: '#d05b5b', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  declineText: { color: '#b13f3f', fontWeight: '700' },
  approve: { flex: 1, height: 44, borderRadius: 10, backgroundColor: '#176b58', alignItems: 'center', justifyContent: 'center' },
  approveText: { color: '#fff', fontWeight: '700' },
});
