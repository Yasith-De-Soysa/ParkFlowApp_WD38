import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';

type User = {
  name: string;
  email: string;
  phone: string;
  vehicleType: 'Car' | 'Bike';
  vehicleNumber: string;
  avatar?: string;
  createdAt?: string;
};

type DetailProps = {
  icon: string;
  label: string;
  value: string;
};

function Detail({ icon, label, value }: DetailProps) {
  return (
    <View style={styles.detail}>
      <View style={styles.detailIcon}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

type TabProps = {
  icon: string;
  label: string;
  active?: boolean;
  onPress?: () => void;
};

function Tab({ icon, label, active, onPress }: TabProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.tab}>
      <View style={[styles.tabIcon, active && styles.activeTabIcon]}>
        <Text style={[styles.tabIconText, active && styles.activeTabIconText]}>{icon}</Text>
      </View>
      <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{label}</Text>
    </Pressable>
  );
}

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCurrentUser()
      .then((response) => setUser(response.user))
      .catch(() => Alert.alert('Unable to load profile', 'Please sign in again and try once more.'))
      .finally(() => setLoading(false));
  }, []);

  const initials = user?.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';
  const memberSince = user?.createdAt
    ? `Member since ${new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`
    : '';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.heading}>My profile</Text>
          <Pressable accessibilityRole="button" style={styles.editButton}>
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        </View>

        <View style={styles.identityCard}>
          {loading ? (
            <ActivityIndicator color="#176b58" />
          ) : user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.initials}>{initials}</Text>
            </View>
          )}
          <View style={styles.identity}>
            <Text style={styles.name}>{user?.name || 'Your profile'}</Text>
            {!!memberSince && <Text style={styles.memberSince}>{memberSince}</Text>}
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Detail icon="✉" label="Email" value={user?.email || 'Unavailable'} />
          <Detail icon="⌕" label="Phone" value={user?.phone || 'Unavailable'} />
          <Detail
            icon="▱"
            label="Vehicle"
            value={user ? `${user.vehicleType} · ${user.vehicleNumber}` : 'Unavailable'}
          />
        </View>
      </ScrollView>

      <View style={[styles.bottomNav, { bottom: insets.bottom + 15 }]}>
        <Tab icon="⌕" label="Explore" />
        <Tab icon="□" label="Reservations" />
        <Tab icon="♙" label="My profile" active onPress={() => navigation.navigate('Profile')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f7f6',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 104,
    gap: 16,
  },
  header: {
    gap: 4,
    alignItems: 'flex-start',
  },
  heading: {
    color: '#17201e',
    fontSize: 22,
    lineHeight: 27,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#176b58',
    backgroundColor: '#fff',
  },
  editText: {
    color: '#176b58',
    fontSize: 13,
    fontWeight: '600',
  },
  identityCard: {
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f4f0',
  },
  initials: {
    color: '#176b58',
    fontSize: 28,
    fontWeight: '700',
  },
  identity: {
    alignItems: 'center',
    gap: 4,
  },
  name: {
    color: '#17201e',
    fontSize: 20,
    fontWeight: '700',
  },
  memberSince: {
    color: '#66736f',
    fontSize: 13,
  },
  detailsCard: {
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#fff',
  },
  detail: {
    minHeight: 112,
    paddingVertical: 14,
    gap: 12,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dde5e2',
  },
  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f4f0',
  },
  iconText: {
    color: '#176b58',
    fontSize: 19,
  },
  detailCopy: {
    gap: 3,
  },
  detailLabel: {
    color: '#66736f',
    fontSize: 11,
  },
  detailValue: {
    color: '#17201e',
    fontSize: 15,
  },
  bottomNav: {
    position: 'absolute',
    left: 17,
    right: 17,
    bottom: 15,
    height: 72,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#dde5e2',
    backgroundColor: '#fff',
    shadowColor: '#17332c',
    shadowOpacity: 0.08,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  tab: {
    width: '31%',
    alignItems: 'center',
    gap: 4,
  },
  tabIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f7f6',
  },
  activeTabIcon: {
    backgroundColor: '#176b58',
  },
  tabIconText: {
    color: '#66736f',
    fontSize: 18,
  },
  activeTabIconText: {
    color: '#fff',
  },
  tabLabel: {
    color: '#66736f',
    fontSize: 12,
  },
  activeTabLabel: {
    color: '#176b58',
    fontWeight: '600',
  },
});
