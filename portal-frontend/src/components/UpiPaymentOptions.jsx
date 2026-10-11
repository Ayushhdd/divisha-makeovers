import { useState } from 'react';
import { buildUpiLink, googlePayLink } from '../utils/upi';
import { formatCurrency } from '../utils/helpers';

export default function UpiPaymentOptions({ settings, amount, reference, qrCode }) {
  const [copied, setCopied] = useState(false);
  const link = buildUpiLink({ upiId: settings?.upiId, businessName: settings?.businessName, amount, reference });
  if (!settings?.upiId) return null;
  const copyUpi = async () => {
    try { await navigator.clipboard.writeText(settings.upiId); setCopied(true); }
    catch { setCopied(false); }
  };
  return <div className="space-y-3 rounded-xl border border-softpink-200 bg-softpink-50 p-3">
    <p className="text-sm font-medium text-gray-800">Pay from this phone</p>
    {link ? <div className="grid gap-2 sm:grid-cols-2">
      <a href={link} className="btn-primary text-center text-sm">Pay with any UPI app</a>
      <a href={googlePayLink(link)} className="btn-outline text-center text-sm">Open Google Pay</a>
    </div> : <p className="text-sm text-gray-500">Enter a valid payment amount within the booking balance to open a UPI app.</p>}
    <p className="text-xs text-gray-600">{link && <>Amount: <strong>{formatCurrency(amount)}</strong>. </>}Complete payment in your installed app, return here, and upload the screenshot for approval.</p>
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <button type="button" onClick={copyUpi} className="text-rosegold-700 underline">{copied ? 'UPI ID copied' : 'Copy UPI ID'}</button>
      {qrCode && <a href={qrCode} download="divisha-payment-qr.png" className="text-rosegold-700 underline">Save QR</a>}
    </div>
    <p className="break-all text-xs text-gray-600">UPI ID: {settings.upiId}</p>
    <p className="text-xs text-gray-500">If an app does not open or declines the link, pay to this UPI ID manually, or save the QR and choose it from your UPI app’s gallery. On a computer, scan the QR with your phone.</p>
  </div>;
}
