import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const parkingImage = require('../../assets/images/onboarding-parking.jpeg');

type OnboardingScreenProps = {
  onComplete: () => void;
  onLogin: () => void;
};

export default function OnboardingScreen({ onComplete, onLogin }: OnboardingScreenProps) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>PARKFLOW SMART SPOT</Text>
        </View>
        <Text style={styles.title}>
          Find Best Place{'\n'}For <Text style={styles.titleAccent}>Parking</Text>
        </Text>
        <Text style={styles.subtitle}>
          Say goodbye to the hassle of finding{'\n'}
          parking spots. Reserve, navigate, and{'\n'}
          park in seconds.
        </Text>
      </View>

      <Image source={parkingImage} style={styles.parkingImage} resizeMode="cover" />
      <View pointerEvents="none" style={styles.imageFade} />

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={onComplete}
          style={({ pressed }) => [styles.getStarted, pressed && styles.pressed]}
        >
          <Text style={styles.getStartedText}>Get Started →</Text>
        </Pressable>
        <Pressable accessibilityRole="link" onPress={onLogin} style={styles.loginLink}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginAccent}>Log In</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#f4f7f5',
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 34,
    gap: 11,
    zIndex: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(27, 94, 75, 0.15)',
    backgroundColor: 'rgba(27, 94, 75, 0.1)',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
  },
  badgeText: {
    color: '#1b5e4b',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.55,
  },
  title: {
    color: '#141b2b',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.85,
    marginTop: 8,
  },
  titleAccent: {
    color: '#1b5e4b',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
  parkingImage: {
    position: 'absolute',
    top: 300,
    left: 0,
    right: 0,
    height: 410,
    width: '100%',
    opacity: 0.9,
  },
  imageFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 120,
    height: 176,
    backgroundColor: 'rgba(244, 247, 245, 0.78)',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 12,
    backgroundColor: 'rgba(244, 247, 245, 0.92)',
  },
  getStarted: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1b5e4b',
  },
  pressed: {
    opacity: 0.85,
  },
  getStartedText: {
    color: '#dde5e2',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  loginText: {
    color: '#141b2b',
    fontSize: 14,
    fontWeight: '600',
  },
  loginAccent: {
    color: '#1b5e4b',
    textDecorationLine: 'underline',
  },
});
