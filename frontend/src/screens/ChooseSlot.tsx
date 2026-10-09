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
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
  route?: {
    params?: {
      facilityName?: string;
      facilityAddress?: string;
      carHourlyRate?: number;
      bikeHourlyRate?: number;
    };
  };
}

const slots = ['A1', 'A2', 'A3', 'A5', 'B1', 'B4'];
const timeOptions = Array.from({ length: 24 }, (_value, hour) => hour);
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getBookingDates() {
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return Array.from({ length: 7 }, (_value, index) => {
    const date = new Date(tomorrow);
    date.setDate(tomorrow.getDate() + index);
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    return {
      key: `${year}-${month + 1}-${day}`,
      day: String(day),
      monthLabel: `${monthNames[month]} ${year}`,
      label: `${day} ${monthNames[month]} ${year}`,
    };
  });
}

function formatTime(hour: number) {
  const normalizedHour = hour % 24;
  const suffix = normalizedHour >= 12 ? 'p.m' : 'a.m';
  const displayHour = normalizedHour % 12 || 12;
  return `${displayHour}.00 ${suffix}`;
}

export default function ChooseSlot({ navigation, route }: ChooseSlotProps) {
  const bookingDates = getBookingDates();
  const [selectedDate, setSelectedDate] = useState(bookingDates[0].key);
  const [slotType, setSlotType] = useState<'Car' | 'Bike'>('Car');
  const [selectedSlot, setSelectedSlot] = useState('A3');
  const [selectedStartHour, setSelectedStartHour] = useState(10);
  const [selectedEndHour, setSelectedEndHour] = useState(11);
  const carHourlyRate = route?.params?.carHourlyRate ?? 0;
  const bikeHourlyRate = route?.params?.bikeHourlyRate ?? 0;
  const selectedHours = selectedEndHour - selectedStartHour;
  const hourlyRate = slotType === 'Bike' ? bikeHourlyRate : carHourlyRate;
  const totalAmount = hourlyRate * selectedHours;
  const timePeriod = `${formatTime(selectedStartHour)} - ${formatTime(selectedEndHour)}`;

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
            <Text style={styles.month}>{bookingDates[0].monthLabel}</Text>
            <Text style={styles.monthArrow}>›</Text>
          </View>
          <View style={styles.dateRow}>
            {bookingDates.map((date) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: selectedDate === date.key }}
                key={date.key}
                onPress={() => setSelectedDate(date.key)}
                style={[styles.dateButton, selectedDate === date.key && styles.selectedDate]}
              >
                <Text style={[styles.dateText, selectedDate === date.key && styles.selectedDateText]}>
                  {date.day}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Parking time</Text>
        <Text style={styles.helperText}>Select a start time and an end time. Options begin at 12.00 a.m.</Text>
        <Text style={styles.timeLabel}>Start time</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeOptionRow}>
          {timeOptions.slice(0, 23).map((startHour) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: selectedStartHour === startHour }}
              key={startHour}
              onPress={() => {
                setSelectedStartHour(startHour);
                if (selectedEndHour <= startHour) {
                  setSelectedEndHour(startHour + 1);
                }
              }}
              style={[styles.timeOptionButton, selectedStartHour === startHour && styles.selectedHour]}
            >
              <Text style={[styles.hourText, selectedStartHour === startHour && styles.selectedHourText]}>
                {formatTime(startHour)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={styles.timeLabel}>End time</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeOptionRow}>
          {timeOptions.slice(1).map((endHour) => {
            const unavailable = endHour <= selectedStartHour;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: unavailable, selected: selectedEndHour === endHour }}
                disabled={unavailable}
                key={endHour}
                onPress={() => setSelectedEndHour(endHour)}
                style={[styles.timeOptionButton, selectedEndHour === endHour && styles.selectedHour, unavailable && styles.unavailableTime]}
              >
                <Text style={[styles.hourText, selectedEndHour === endHour && styles.selectedHourText, unavailable && styles.unavailableTimeText]}>
                  {formatTime(endHour)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Text style={styles.selectedTimeSummary}>{timePeriod} · {selectedHours} {selectedHours === 1 ? 'hour' : 'hours'}</Text>

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
          onPress={() =>
            navigation.navigate('ConfirmReservation', {
              date: bookingDates.find((date) => date.key === selectedDate)?.label || bookingDates[0].label,
              time: timePeriod,
              hours: selectedHours,
              slot: selectedSlot,
              type: slotType,
              facilityName: route?.params?.facilityName || 'Central Plaza Parking',
              facilityAddress: route?.params?.facilityAddress || '',
              carHourlyRate,
              bikeHourlyRate,
              hourlyRate,
              amount: totalAmount,
            })
          }
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
  helperText: {
    color: '#77847f',
    fontSize: 13,
    marginTop: 6,
  },
  timeLabel: {
    color: '#31423d',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
  },
  timeOptionRow: {
    gap: 8,
    paddingVertical: 10,
  },
  timeOptionButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#dfe7e4',
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 84,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectedHour: {
    backgroundColor: '#1f8068',
    borderColor: '#1f8068',
  },
  hourText: {
    color: '#31423d',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedHourText: {
    color: '#fff',
  },
  unavailableTime: {
    backgroundColor: '#eef2f0',
    borderColor: '#eef2f0',
  },
  unavailableTimeText: {
    color: '#a5afab',
  },
  selectedTimeSummary: {
    color: '#1f8068',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
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
