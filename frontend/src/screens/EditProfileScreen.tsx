import React, { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

type VehicleType = 'Car' | 'Bike';
type User = {
  name: string;
  email: string;
  phone: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  avatar?: string;
};

export default function EditProfileScreen({ navigation }: { navigation: any }) {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getCurrentUser()
      .then((response) => {
        const currentUser = response.user as User;
        setUser(currentUser);
        setName(currentUser.name);
        setEmail(currentUser.email);
        setPhone(currentUser.phone);
        setVehicleType(currentUser.vehicleType);
        setVehicleNumber(currentUser.vehicleNumber || '');
        setAvatar(currentUser.avatar);
      })
      .catch(() => Alert.alert('Unable to load profile', 'Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const selectPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow photo access to update your profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setAvatar(result.assets[0].uri);
    }
  };

  const save = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !vehicleType || !vehicleNumber.trim()) {
      Alert.alert('Complete your details', 'Please fill in every profile field.');
      return;
    }
    if (password && password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please enter the same password in both fields.');
      return;
    }

    setSaving(true);
    try {
      await api.updateCurrentUser({
        name,
        email,
        phone,
        vehicleType,
        vehicleNumber,
        avatar,
        password: password || undefined,
        confirmPassword: confirmPassword || undefined,
      });
      Alert.alert('Profile updated', 'Your details have been saved.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || 'Unable to update your profile.';
      Alert.alert('Update failed', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen} edges={['top', 'bottom']}>
        <ActivityIndicator color="#176b58" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} accessibilityRole="button">
              <Text style={styles.back}>‹</Text>
            </Pressable>
            <View>
              <Text style={styles.title}>Edit profile</Text>
              <Text style={styles.subtitle}>Update your ParkFlow details</Text>
            </View>
          </View>

          <Pressable onPress={selectPhoto} style={styles.photoCircle} accessibilityRole="button">
            {avatar ? <Image source={{ uri: avatar }} style={styles.photo} /> : <Text style={styles.initials}>
              {user?.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
            </Text>}
          </Pressable>
          <Pressable onPress={selectPhoto}>
            <Text style={styles.uploadText}>Change profile photo</Text>
          </Pressable>

          <Field label="Name" value={name} placeholder="Your full name" onChangeText={setName} />
          <Field label="Email" value={email} placeholder="you@example.com" onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Field label="Phone" value={phone} placeholder="+1 000 000 0000" onChangeText={setPhone} keyboardType="phone-pad" />

          <View style={styles.field}>
            <Text style={styles.label}>Vehicle type</Text>
            <View style={styles.options}>
              {(['Car', 'Bike'] as const).map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setVehicleType(option)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: vehicleType === option }}
                  style={[styles.option, vehicleType === option && styles.selectedOption]}
                >
                  <Text style={[styles.optionText, vehicleType === option && styles.selectedOptionText]}>{option}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Field label="Vehicle number" value={vehicleNumber} placeholder="e.g. ABC 1234" onChangeText={setVehicleNumber} autoCapitalize="characters" />
          <Text style={styles.sectionText}>Change password (optional)</Text>
          <Field label="New password" value={password} placeholder="••••••••" onChangeText={setPassword} secureTextEntry />
          <Field label="Confirm new password" value={confirmPassword} placeholder="••••••••" onChangeText={setConfirmPassword} secureTextEntry />

          <Pressable onPress={save} disabled={saving} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Update profile</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field(props: {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'characters';
  secureTextEntry?: boolean;
}) {
  const { label, ...inputProps } = props;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        style={styles.input}
        placeholderTextColor="#66736f"
        accessibilityLabel={props.label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f7f6' },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f7f6' },
  keyboard: { flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 32, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: '#176b58', fontSize: 36, lineHeight: 36 },
  title: { color: '#17201e', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#66736f', fontSize: 13, marginTop: 3 },
  photoCircle: { alignSelf: 'center', width: 86, height: 86, borderRadius: 43, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e8f4f0' },
  photo: { width: 86, height: 86, borderRadius: 43 },
  initials: { color: '#176b58', fontSize: 28, fontWeight: '700' },
  uploadText: { alignSelf: 'center', color: '#176b58', fontSize: 13, fontWeight: '600' },
  field: { gap: 6 },
  label: { color: '#17201e', fontSize: 13, fontWeight: '600' },
  input: { height: 48, borderWidth: 1, borderColor: '#dde5e2', borderRadius: 12, backgroundColor: '#fff', color: '#17201e', paddingHorizontal: 14, fontSize: 15 },
  options: { flexDirection: 'row', gap: 10 },
  option: { flex: 1, height: 46, borderWidth: 1, borderColor: '#dde5e2', borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  selectedOption: { borderColor: '#176b58', backgroundColor: '#e8f4f0' },
  optionText: { color: '#66736f', fontSize: 14, fontWeight: '600' },
  selectedOptionText: { color: '#176b58' },
  sectionText: { color: '#176b58', fontSize: 14, fontWeight: '700', marginTop: 4 },
  saveButton: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#176b58', marginTop: 4 },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
