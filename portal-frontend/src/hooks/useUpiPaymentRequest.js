import { useMemo, useReducer } from 'react';
import { buildUpiPaymentRequest, createUpiReference } from '../utils/upi';

export default function useUpiPaymentRequest(settings, amount, reference = '') {
  const [attempt, refreshRequest] = useReducer(value => value + 1, 0);
  const paymentAmount = Number(amount);
  const request = useMemo(() => buildUpiPaymentRequest({
    settings, amount: paymentAmount, reference, transactionReference: createUpiReference(),
  }), [settings, paymentAmount, reference, attempt]);
  return { ...request, refreshRequest };
}
