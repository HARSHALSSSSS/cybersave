import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  cancelSimulatedCheckout,
  completeSimulatedCheckout,
  getCheckoutRequest,
  getSuccessTick,
  subscribeRazorpayHost,
} from '@utils/razorpayCheckoutStore';

type PayMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

const METHODS: Array<{ id: PayMethod; label: string; hint: string }> = [
  { id: 'upi', label: 'UPI', hint: 'GPay · PhonePe · Paytm · BHIM' },
  { id: 'card', label: 'Cards', hint: 'Visa · Mastercard · RuPay' },
  { id: 'netbanking', label: 'Netbanking', hint: 'HDFC · SBI · ICICI and more' },
  { id: 'wallet', label: 'Wallets', hint: 'PhonePe · Amazon Pay · Mobikwik' },
];

function formatAmount(amount: number) {
  return `₹${amount.toFixed(2)}`;
}

function SuccessTick({ amount }: { amount?: number }) {
  return (
    <View style={styles.successWrap}>
      <View style={styles.tickOuter}>
        <View style={styles.tickInner}>
          <Text style={styles.tickMark}>✓</Text>
        </View>
      </View>
      <Text style={styles.successTitle}>Payment Successful</Text>
      {amount != null ? <Text style={styles.successAmount}>{formatAmount(amount)}</Text> : null}
      <Text style={styles.successHint}>Secured by Razorpay</Text>
    </View>
  );
}

export const RazorpayCheckoutHost: React.FC = () => {
  const [, setRev] = useState(0);
  useEffect(() => subscribeRazorpayHost(() => setRev(n => n + 1)), []);

  const request = getCheckoutRequest();
  const success = getSuccessTick();
  const visible = Boolean(request || success);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cancelSimulatedCheckout}>
      {success ? (
        <View style={styles.overlay}>
          <SuccessTick />
        </View>
      ) : request ? (
        <CheckoutSheet />
      ) : (
        <View />
      )}
    </Modal>
  );
};

const CheckoutSheet: React.FC = () => {
  const request = getCheckoutRequest();
  const [method, setMethod] = useState<PayMethod>('upi');
  const [upi, setUpi] = useState('success@razorpay');
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  const params = request?.params;
  const amount = params?.amount ?? 0;

  const hint = useMemo(() => {
    if (method === 'upi') return 'Test UPI ID: success@razorpay';
    if (method === 'card') return 'Test card: 4111 1111 1111 1111';
    if (method === 'netbanking') return 'Test bank: HDFC / SBI / ICICI';
    return 'Test wallet: PhonePe / Paytm';
  }, [method]);

  if (!request || !params) return null;

  const pay = async () => {
    setPaying(true);
    await new Promise(r => setTimeout(r, 700));
    setPaying(false);
    setDone(true);
    await new Promise(r => setTimeout(r, 1100));
    completeSimulatedCheckout({
      razorpay_payment_id: `pay_test_${Date.now()}`,
      razorpay_order_id: params.orderId || `order_test_${Date.now()}`,
      razorpay_signature: `sig_test_${Date.now()}`,
    });
  };

  if (done) {
    return (
      <View style={styles.overlay}>
        <SuccessTick amount={amount} />
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>RAZORPAY CHECKOUT</Text>
            <Text style={styles.merchant}>{params.name ?? 'Cybersave'}</Text>
            <Text style={styles.desc} numberOfLines={1}>
              {params.description ?? 'Secure payment'}
            </Text>
          </View>
          <View>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amount}>{formatAmount(amount)}</Text>
          </View>
        </View>
        <View style={styles.testRow}>
          <Text style={styles.testMode}>Test Mode</Text>
          <Pressable onPress={cancelSimulatedCheckout} hitSlop={12}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>

        <View style={styles.methods}>
          {METHODS.map(item => {
            const active = method === item.id;
            return (
              <Pressable
                key={item.id}
                style={[styles.method, active && styles.methodActive]}
                onPress={() => setMethod(item.id)}>
                <View>
                  <Text style={styles.methodTitle}>{item.label}</Text>
                  <Text style={styles.methodHint}>{item.hint}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioOn]} />
              </Pressable>
            );
          })}
        </View>

        {method === 'upi' ? (
          <TextInput
            value={upi}
            onChangeText={setUpi}
            autoCapitalize="none"
            placeholder="UPI ID"
            style={styles.input}
          />
        ) : null}
        <Text style={styles.hint}>{hint}</Text>

        <Pressable style={styles.payBtn} onPress={() => void pay()} disabled={paying}>
          {paying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payText}>Pay {formatAmount(amount)}</Text>
          )}
        </Pressable>
        <Text style={styles.secure}>100% Secure Payments · Powered by Razorpay</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 28,
  },
  header: {
    backgroundColor: '#0B2545',
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    gap: 12,
  },
  kicker: { color: '#93C5FD', fontSize: 10, letterSpacing: 1.2, fontWeight: '700' },
  merchant: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 4 },
  desc: { color: '#DBEAFE', fontSize: 12, marginTop: 2 },
  amountLabel: { color: '#93C5FD', fontSize: 11, textAlign: 'right' },
  amount: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 4, textAlign: 'right' },
  testRow: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  testMode: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  close: { color: '#2563EB', fontSize: 13, fontWeight: '700' },
  methods: { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  method: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  methodActive: { borderColor: '#2B84EA', backgroundColor: '#EFF6FF' },
  methodTitle: { color: '#0F172A', fontSize: 15, fontWeight: '700' },
  methodHint: { color: '#64748B', fontSize: 12, marginTop: 2 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  radioOn: { borderColor: '#2B84EA', backgroundColor: '#2B84EA' },
  input: {
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  hint: { marginHorizontal: 16, marginTop: 8, color: '#64748B', fontSize: 12 },
  payBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#2B84EA',
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secure: { textAlign: 'center', marginTop: 12, color: '#94A3B8', fontSize: 11 },
  successWrap: {
    marginHorizontal: 24,
    marginBottom: 40,
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  tickOuter: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(16,185,129,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickMark: { color: '#fff', fontSize: 44, fontWeight: '800' },
  successTitle: { marginTop: 20, fontSize: 22, fontWeight: '800', color: '#0F172A' },
  successAmount: { marginTop: 6, fontSize: 16, fontWeight: '700', color: '#334155' },
  successHint: { marginTop: 10, fontSize: 12, color: '#94A3B8', letterSpacing: 0.4 },
});
