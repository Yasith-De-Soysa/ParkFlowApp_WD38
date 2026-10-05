import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ChooseSlotProps {
  navigation: {
    goBack: () => void;
  };
}

const dates = ['14', '15', '16', '17', '18', '19', '20'];
const slots = ['A1', 'A2', 'A3', 'A5', 'B1', 'B4'];

export default function ChooseSlot({ navigation }: ChooseSlotProps) {
  const [selectedDate, setSelectedDate] = useState('17');
  const [slotType, setSlotType] = useState<'Car' | 'Bike'>('Car');
  const [selectedSlot, setSelectedSlot] = useState('A3');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
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
            <Text style={styles.title}>Choose slot</Text>
            <Text style={styles.step}>Step 2 of 3</Text>
          </View>
        </View>

        <View style={styles.progressTrack} accessibilityLabel="Step 2 of 3">
          <View style={styles.progressActive} />
          <View style={styles.progressActive} />
          <View style={styles.progressInactive} />
        </View>

        <Text style={styles.sectionTitle}>Advance booking date</Text>
        <View style={styles.dateCard}>
          <View style={styles.monthRow}>
            <Text style={styles.monthArrow}>‹</Text>
            <Text style={styles.month}>September 2026</Text>
            <Text style={styles.monthArrow}>›</Text>
          </View>
          <View style={styles.dateRow}>
            {dates.map((date) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: selectedDate === date }}
                key={date}
                onPress={() => setSelectedDate(date)}
                style={[styles.dateButton, selectedDate === date && styles.selectedDate]}
              >
                <Text style={[styles.dateText, selectedDate === date && styles.selectedDateText]}>
                  {date}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Slot type</Text>
        <View style={styles.typeRow}>
          {(['Car', 'Bike'] as const).map((type) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: slotType === type }}
              key={type}
              onPress={() => setSlotType(type)}
              style={[styles.typeButton, slotType === type && styles.selectedType]}
            >
              <Text style={[styles.typeText, slotType === type && styles.selectedTypeText]}>
                {type}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Available slots</Text>
        <View style={styles.slotGrid}>
          {slots.map((slot) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: selectedSlot === slot }}
              key={slot}
              onPress={() => setSelectedSlot(slot)}
              style={[styles.slotButton, selectedSlot === slot && styles.selectedSlot]}
            >
              <Text style={[styles.slotText, selectedSlot === slot && styles.selectedSlotText]}>
                {slot}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => undefined}
          style={styles.confirmButton}
        >
          <Text style={styles.confirmText}>Confirm Reservation</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f4f8f6',
    flex: 1,
  },
  content: {
    paddingBottom: 36,
    paddingHorizontal: 24,
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
  sectionTitle: {
    color: '#1d2b27',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 24,
  },
  dateCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginTop: 12,
    padding: 16,
  },
  monthRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  month: {
    color: '#1b2925',
    fontSize: 17,
    fontWeight: '700',
  },
  monthArrow: {
    color: '#31423d',
    fontSize: 25,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  dateButton: {
    alignItems: 'center',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  selectedDate: {
    backgroundColor: '#1f8068',
  },
  dateText: {
    color: '#33433e',
    fontSize: 13,
  },
  selectedDateText: {
    color: '#fff',
    fontWeight: '700',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  typeButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#dfe7e4',
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 64,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  selectedType: {
    backgroundColor: '#1f8068',
    borderColor: '#1f8068',
  },
  typeText: {
    color: '#31423d',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedTypeText: {
    color: '#fff',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  slotButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#dfe7e4',
    borderRadius: 14,
    borderWidth: 1,
    height: 54,
    justifyContent: 'center',
    width: '30%',
  },
  selectedSlot: {
    backgroundColor: '#1f8068',
    borderColor: '#1f8068',
  },
  slotText: {
    color: '#31423d',
    fontSize: 15,
    fontWeight: '700',
  },
  selectedSlotText: {
    color: '#fff',
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: '#1f8068',
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 52,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
