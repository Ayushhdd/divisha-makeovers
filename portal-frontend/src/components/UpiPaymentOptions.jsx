import { useState } from 'react';
import { googlePayLink } from '../utils/upi';
import { formatCurrency } from '../utils/helpers';

export default function UpiPaymentOptions({ settings, amount, paymentLink = '', qrCode, refreshRequest }) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const link = paymentLink;
  if (!settings?.upiId) return null;
  const copyUpi = async () => {
    try { await navigator.clipboard.writeText(settings.upiId); setCopied(true); setCopyFailed(false); }
    catch { setCopied(false); setCopyFailed(true); }
  };
  return <div className="space-y-3 rounded-xl border border-softpink-200 bg-softpink-50 p-3">
    <p className="text-sm font-medium text-gray-800">Pay from this phone</p>
    {link ? <div className="grid gap-2 sm:grid-cols-2">
      <a href={link} className="btn-primary text-center text-sm">Pay with any UPI app</a>
      <a href={googlePayLink(link, navigator.userAgent)} className="btn-outline text-center text-sm">Open Google Pay</a>
    </div> : <p className="text-sm text-gray-600">Open Google Pay, WhatsApp Pay, PhonePe, or another UPI app yourself. Choose payment by UPI ID and paste the ID below.</p>}
    <p className="text-xs text-gray-600">{Number(amount) >= 1 && <>Amount: <strong>{formatCurrency(amount)}</strong>. </>}Check the recipient name in your app, complete payment, return here, and upload the successful payment screenshot for approval.</p>
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <button type="button" onClick={copyUpi} className="text-rosegold-700 underline">{copied ? 'UPI ID copied' : 'Copy UPI ID'}</button>
      {qrCode && <a href={qrCode} download="divisha-payment-qr.png" className="text-rosegold-700 underline">Save QR</a>}
    </div>
    {copyFailed && <p role="status" className="text-xs text-gray-600">Copy was unavailable. Press and hold the UPI ID below to copy it.</p>}
    <p className="break-all text-xs text-gray-600">UPI ID: {settings.upiId}</p>
    <p className="text-xs text-gray-500">You can also save the QR and select it from your UPI app’s gallery. On a computer, scan the QR with your phone.</p>
    {link && <details className="text-xs text-gray-600">
      <summary className="cursor-pointer">App opened but payment failed?</summary>
      <p className="mt-2">Check the transaction status in your app before retrying. If no payment succeeded, try paying to the UPI ID manually. A bank-limit message is decided by your app or bank, even for a small amount.</p>
      {refreshRequest && <button type="button" className="mt-2 text-rosegold-700 underline" onClick={refreshRequest}>Refresh payment request</button>}
    </details>}
  </div>;
}
