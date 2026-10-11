export const buildUpiLink = ({ upiId, businessName = 'Divisha Makeovers', amount, reference = '', merchantCategoryCode = '', transactionReference = '' }) => {
  const paymentAmount = Number(amount);
  if (!upiId || !Number.isFinite(paymentAmount) || paymentAmount < 1) return '';
  const params = new URLSearchParams({
    pa: upiId.trim(), pn: businessName || 'Divisha Makeovers',
    am: paymentAmount.toFixed(2), cu: 'INR',
    tn: reference ? `Divisha Makeovers ${reference}` : 'Divisha Makeovers booking payment',
  });
  if (merchantCategoryCode) params.set('mc', merchantCategoryCode);
  if (transactionReference) params.set('tr', transactionReference);
  const query = [...params].map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
  return `upi://pay?${query}`;
};

export const createUpiReference = () => `DM${crypto.randomUUID().replace(/-/g, '')}`;
export const hasMerchantCheckout = settings => settings?.upiIntentEnabled === true &&
  /^\d{4}$/.test(settings?.merchantCategoryCode || '') && settings.merchantCategoryCode !== '0000';
export const buildUpiPaymentRequest = ({ settings, amount, reference = '', transactionReference }) => {
  const merchant = hasMerchantCheckout(settings) && /^[a-z\d]{1,35}$/i.test(transactionReference || '');
  const qrLink = buildUpiLink({ upiId: settings?.upiId, businessName: settings?.businessName, amount, reference,
    ...(merchant ? { merchantCategoryCode: settings.merchantCategoryCode, transactionReference } : {}) });
  return { qrLink, appLink: merchant ? qrLink : '' };
};
export const googlePayLink = (link, userAgent = '') => {
  if (!link?.startsWith('upi://pay?')) return '';
  if (/Android/i.test(userAgent)) {
    return `intent://pay?${link.split('?')[1]}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
  }
  return `gpay://upi/pay?${link.split('?')[1]}`;
};
