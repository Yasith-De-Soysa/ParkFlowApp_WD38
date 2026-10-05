import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SecureCheckoutProps {
  navigation: {
    goBack: () => void;
  };
}

type PaymentMethod = 'Credit / Debit' | 'Mobile Wallet' | 'QR Code';

const paymentMethods: PaymentMethod[] = [
  'Credit / Debit',
  'Mobile Wallet',
  'QR Code',
];

export default function SecureCheckout({ navigation }: SecureCheckoutProps) {
  const [method, setMethod] = useState<PaymentMethod>('Credit / Debit');
  const [saveCard, setSaveCard] = useState(true);

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
            <Text style={styles.title}>Secure checkout</Text>
            <Text style={styles.subtitle}>Your payment is secure</Text>
          </View>
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Reservation total</Text>
          <Text style={styles.amount}>$9.00</Text>
        </View>

        <Text style={styles.sectionTitle}>Payment method</Text>
        <View style={styles.methods}>
          {paymentMethods.map((paymentMethod) => {
            const selected = method === paymentMethod;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={paymentMethod}
                onPress={() => setMethod(paymentMethod)}
                style={[styles.methodButton, selected && styles.selectedMethod]}
              >
                <Text style={[styles.methodIcon, selected && styles.selectedMethodText]}>
                  {paymentMethod === 'Credit / Debit' ? '▣' : paymentMethod === 'Mobile Wallet' ? '▤' : '▦'}
                </Text>
                <Text style={[styles.methodText, selected && styles.selectedMethodText]}>
                  {paymentMethod}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {method === 'Credit / Debit' && (
          <View style={styles.form}>
            <Text style={styles.inputLabel}>Card number</Text>
            <TextInput
              accessibilityLabel="Card number"
              keyboardType="number-pad"
              placeholder="4242 4242 4242 4242"
              placeholderTextColor="#8a9692"
              style={styles.input}
            />
            <View style={styles.formRow}>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>Expiry</Text>
                <TextInput
                  accessibilityLabel="Expiry"
                  keyboardType="number-pad"
                  placeholder="09/29"
                  placeholderTextColor="#8a9692"
                  style={styles.input}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  accessibilityLabel="CVV"
                  keyboardType="number-pad"
                  placeholder="123"
                  placeholderTextColor="#8a9692"
                  secureTextEntry
                  style={styles.input}
                />
              </View>
            </View>
            <View style={styles.saveRow}>
              <Switch
                accessibilityLabel="Save card for later"
                onValueChange={setSaveCard}
                trackColor={{ false: '#d5dfdb', true: '#9dcec0' }}
                value={saveCard}
                thumbColor={saveCard ? '#1f8068' : '#fff'}
              />
              <Text style={styles.saveText}>Save card for later</Text>
            </View>
          </View>
        )}

        {method !== 'Credit / Debit' && (
          <View style={styles.alternativeCard}>
            <Text style={styles.alternativeTitle}>
              {method === 'Mobile Wallet' ? 'Continue with your mobile wallet' : 'Scan the QR code to pay'}
            </Text>
            <Text style={styles.alternativeText}>
              This payment option will be available when the payment service is connected.
            </Text>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => undefined}
          style={styles.payButton}
        >
          <Text style={styles.payText}>Pay $9.00 securely</Text>
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
  subtitle: {
    color: '#77847f',
    fontSize: 14,
    marginTop: 2,
  },
  amountCard: {
    backgroundColor: '#1f8068',
    borderRadius: 18,
    marginTop: 26,
    padding: 18,
  },
  amountLabel: {
    color: '#d8f0e8',
    fontSize: 13,
  },
  amount: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    marginTop: 4,
  },
  sectionTitle: {
    color: '#1d2b27',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 24,
  },
  methods: {
    gap: 10,
    marginTop: 12,
  },
  methodButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#dfe7e4',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 50,
    paddingHorizontal: 14,
  },
  selectedMethod: {
    borderColor: '#1f8068',
    borderWidth: 2,
  },
  methodIcon: {
    color: '#66746f',
    fontSize: 19,
    marginRight: 10,
  },
  methodText: {
    color: '#31423d',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedMethodText: {
    color: '#1f8068',
  },
  form: {
    marginTop: 18,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  inputLabel: {
    color: '#52625d',
    fontSize: 13,
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#dfe7e4',
    borderRadius: 12,
    borderWidth: 1,
    color: '#1d2b27',
    fontSize: 14,
    height: 48,
    paddingHorizontal: 14,
  },
  saveRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 12,
  },
  saveText: {
    color: '#52625d',
    fontSize: 13,
    marginLeft: 8,
  },
  alternativeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 18,
    padding: 18,
  },
  alternativeTitle: {
    color: '#1d2b27',
    fontSize: 15,
    fontWeight: '700',
  },
  alternativeText: {
    color: '#77847f',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  payButton: {
    alignItems: 'center',
    backgroundColor: '#1f8068',
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 52,
  },
  payText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
