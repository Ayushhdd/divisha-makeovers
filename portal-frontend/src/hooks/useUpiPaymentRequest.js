import { useMemo, useReducer } from 'react';
import { buildUpiPaymentRequest, createUpiReference } from '../utils/upi';

export default function useUpiPaymentRequest(settings, amount, reference = '') {
  const [attempt, refreshRequest] = useReducer(value => value + 1, 0);
  const paymentAmount = Number(amount);
  const request = useMemo(() => buildUpiPaymentRequest({
    settings, amount: paymentAmount, reference, transactionReference: createUpiReference(),
    // A manual refresh must create a new bank transaction reference even when
    // the recipient, amount and booking have stayed the same.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [settings, paymentAmount, reference, attempt]);
  return { ...request, refreshRequest };
}
