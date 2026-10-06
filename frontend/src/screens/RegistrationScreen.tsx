import React, { useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
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

export default function RegistrationScreen({ navigation }: { navigation: any }) {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const register = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword || !vehicleType || !vehicleNumber.trim()) {
      Alert.alert('Complete your details', 'Please fill in every field to register.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please enter the same password in both fields.');
      return;
    }

    setSubmitting(true);
    try {
      await api.register({
        name,
        email,
        phone,
        password,
        vehicleType,
        vehicleNumber,
        avatar: profilePhoto || undefined,
      });
      Alert.alert('Account created', 'Your ParkFlow account is ready.');
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || 'Unable to create your account.';
      Alert.alert('Registration failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectProfilePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow photo access to upload a profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.form}>
          <View style={styles.header}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Find and reserve parking in seconds</Text>
          </View>

          <View style={styles.photoUpload}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose profile photo"
              onPress={selectProfilePhoto}
              style={styles.photoCircle}
            >
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
              ) : (
                <Text style={styles.profileIcon}>♙</Text>
              )}
            </Pressable>
            <Pressable accessibilityRole="button" onPress={selectProfilePhoto}>
              <Text style={styles.uploadText}>Upload profile photo</Text>
            </Pressable>
          </View>

          <Field
            label="Name"
            placeholder="Your full name"
            value={name}
            onChangeText={setName}
            scrollViewRef={scrollViewRef}
            scrollOffsetRef={scrollOffsetRef}
          />
          <Field
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            scrollViewRef={scrollViewRef}
            scrollOffsetRef={scrollOffsetRef}
          />
          <Field
            label="Phone"
            placeholder="+1 000 000 0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            scrollViewRef={scrollViewRef}
            scrollOffsetRef={scrollOffsetRef}
          />

          <View style={styles.field}>
            <Text style={styles.label}>Vehicle type</Text>
            <View style={styles.options}>
              {(['Car', 'Bike'] as const).map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected: vehicleType === option }}
                  onPress={() => setVehicleType(option)}
                  style={[styles.option, vehicleType === option && styles.selectedOption]}
                >
                  <Text style={[styles.optionText, vehicleType === option && styles.selectedOptionText]}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Field
            label="Vehicle number"
            placeholder="e.g. ABC 1234"
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
            autoCapitalize="characters"
            scrollViewRef={scrollViewRef}
            scrollOffsetRef={scrollOffsetRef}
          />

          <Field
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            scrollViewRef={scrollViewRef}
            scrollOffsetRef={scrollOffsetRef}
          />
          <Field
            label="Confirm password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            scrollViewRef={scrollViewRef}
            scrollOffsetRef={scrollOffsetRef}
          />

          <Pressable
            accessibilityRole="button"
            onPress={register}
            disabled={submitting}
            style={({ pressed }) => [styles.registerButton, pressed && styles.buttonPressed]}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerText}>Register</Text>}
          </Pressable>

          <Pressable
            accessibilityRole="link"
            onPress={() => navigation.navigate('Login')}
            style={styles.signInLink}
          >
            <Text style={styles.signInText}>
              Already registered? <Text style={styles.underlined}>Sign in</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'characters';
  secureTextEntry?: boolean;
  scrollViewRef: React.RefObject<ScrollView | null>;
  scrollOffsetRef: React.RefObject<number>;
};

function Field({ label, scrollViewRef, scrollOffsetRef, ...inputProps }: FieldProps) {
  const inputRef = useRef<TextInput>(null);

  const keepInputVisible = () => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    const adjustScroll = () => {
      const keyboardHeight = Keyboard.metrics()?.height ?? 0;
      if (!keyboardHeight) {
        return;
      }

      input.measureInWindow((_x, y, _width, height) => {
        const windowHeight = Dimensions.get('window').height;
        const screenHeight = Dimensions.get('screen').height;
        const keyboardTop = Math.min(windowHeight, screenHeight - keyboardHeight);
        const desiredBottom = keyboardTop - 12;
        const hiddenAmount = y + height - desiredBottom;

        if (hiddenAmount > 0) {
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, scrollOffsetRef.current + hiddenAmount),
            animated: true,
          });
        }
      });
    };

    setTimeout(adjustScroll, 250);
    setTimeout(adjustScroll, 500);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          {...inputProps}
          ref={inputRef}
          onFocus={keepInputVisible}
          style={styles.input}
          placeholderTextColor="#66736f"
          accessibilityLabel={label}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f7f6' },
  keyboard: { flex: 1 },
  content: { flexGrow: 1, minHeight: '100%', paddingBottom: 140 },
  form: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 24, gap: 16 },
  header: { gap: 3 },
  title: { color: '#17201e', fontSize: 22, lineHeight: 27, fontWeight: '700' },
  subtitle: { color: '#66736f', fontSize: 13, lineHeight: 16 },
  photoUpload: { alignItems: 'center', gap: 8 },
  photoCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#e8f4f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: { width: '100%', height: '100%', borderRadius: 41 },
  profileIcon: { color: '#176b58', fontSize: 32, lineHeight: 36 },
  uploadText: { color: '#176b58', fontSize: 13 },
  field: { gap: 6 },
  label: { color: '#17201e', fontSize: 13, lineHeight: 16, fontWeight: '600' },
  inputContainer: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dde5e2',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: { flex: 1, color: '#17201e', fontSize: 15, paddingVertical: 0 },
  registerButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#176b58',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { opacity: 0.85 },
  registerText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  signInLink: { alignItems: 'center', paddingVertical: 4 },
  signInText: { color: '#66736f', fontSize: 13, lineHeight: 16 },
  underlined: { color: '#176b58', textDecorationLine: 'underline' },
});
