export const buildUpiLink = ({ upiId, businessName = 'Divisha Makeovers', amount, reference = '' }) => {
  const paymentAmount = Number(amount);
  if (!upiId || !Number.isFinite(paymentAmount) || paymentAmount < 1) return '';
  const params = new URLSearchParams({
    pa: upiId.trim(), pn: businessName || 'Divisha Makeovers',
    am: paymentAmount.toFixed(2), cu: 'INR',
    tn: reference ? `Divisha Makeovers ${reference}` : 'Divisha Makeovers booking payment',
  });
  if (reference) params.set('tr', reference);
  return `upi://pay?${params}`;
};

export const googlePayLink = link => link ? `gpay://upi/pay?${link.split('?')[1]}` : '';
