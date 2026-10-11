import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import UpiPaymentOptions from '../../components/UpiPaymentOptions';
import QRCode from 'qrcode';
import useUpiPaymentRequest from '../../hooks/useUpiPaymentRequest';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [settings, setSettings] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [form, setForm] = useState({ appointmentId: '', amount: '', transactionRef: '' });
  const [screenshot, setScreenshot] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const selectedBooking = appointments.find(item => item._id === form.appointmentId);
  const pendingIds = new Set(payments.filter(item => item.status === 'pending').map(item => item.appointment?._id || item.appointment));
  const payable = appointments.filter(item => item.remainingBalance >= 1 && !['cancelled', 'rejected', 'completed'].includes(item.status) && !pendingIds.has(item._id));
  const amountValid = selectedBooking && Number(form.amount) >= 1 && Number(form.amount) <= selectedBooking.remainingBalance;
  const { qrLink: upiLink, appLink, refreshRequest } = useUpiPaymentRequest(settings, amountValid ? form.amount : 0, selectedBooking?.bookingReference);
  useEffect(() => {
    let active = true;
    setQrCode('');
    if (upiLink) QRCode.toDataURL(upiLink, { width: 240, margin: 2 }).then(url => { if (active) setQrCode(url); }).catch(() => { if (active) setQrCode(''); });
    return () => { active = false; };
  }, [upiLink]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const [paymentResponse, bookingResponse, settingsResponse] = await Promise.all([
        api.get('/payments/my'), api.get('/appointments/my'), api.get('/admin/settings/public'),
      ]);
      setPayments(paymentResponse.data);
      setAppointments(bookingResponse.data);
      setSettings(settingsResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPayments(); }, []);

  const submitPayment = async event => {
    event.preventDefault();
    if (!amountValid || !screenshot || pendingIds.has(form.appointmentId)) {
      setError('Choose an eligible booking, enter an amount within its balance, and upload the payment screenshot.');
      return;
    }
    setSubmittingId('new'); setError(''); setMessage('');
    try {
      const body = new FormData();
      body.set('appointmentId', form.appointmentId); body.set('amount', form.amount);
      body.set('transactionRef', form.transactionRef); body.set('method', 'screenshot');
      body.set('screenshot', screenshot);
      await api.post('/payments', body, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm({ appointmentId: '', amount: '', transactionRef: '' }); setScreenshot(null); setShowPayment(false);
      setMessage('Payment screenshot submitted. Your receipt and balance update after owner approval.');
      await loadPayments();
    } catch (err) { setError(err.response?.data?.message || 'Could not submit the payment'); }
    finally { setSubmittingId(''); }
  };

  const reuploadScreenshot = async (payment) => {
    const file = files[payment._id];
    const appointmentId = payment.appointment?._id || payment.appointment;
    if (!file) {
      setError('Choose the new payment screenshot first.');
      return;
    }
    if (!appointmentId) {
      setError('This payment is no longer linked to a booking. Please contact the owner.');
      return;
    }

    setSubmittingId(payment._id);
    setError('');
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('appointmentId', appointmentId);
      formData.append('amount', payment.amount);
      formData.append('method', 'screenshot');
      formData.append('screenshot', file);
      await api.post('/payments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFiles((current) => ({ ...current, [payment._id]: null }));
      setMessage('New screenshot submitted. The owner will verify it in the UPI or bank app.');
      await loadPayments();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit the screenshot');
    } finally {
      setSubmittingId('');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="font-display text-2xl font-bold">Payment History</h1>
      {error && <Alert message={error} onClose={() => setError('')} />}
      {message && <Alert type="success" message={message} onClose={() => setMessage('')} />}
      {payable.length > 0 && <button type="button" onClick={() => setShowPayment(value => !value)} className="btn-primary">
        {showPayment ? 'Close payment form' : 'Pay an installment / balance'}
      </button>}
      {showPayment && <form onSubmit={submitPayment} className="card space-y-4">
        <h2 className="font-display text-lg font-semibold">Make a payment</h2>
        <div>
          <label htmlFor="payment-booking" className="label">Booking</label>
          <select id="payment-booking" required className="input-field" value={form.appointmentId}
            onChange={event => { const booking = payable.find(item => item._id === event.target.value); setForm({ ...form, appointmentId: event.target.value, amount: booking?.remainingBalance || '' }); }}>
            <option value="">Choose a booking</option>
            {payable.map(item => <option key={item._id} value={item._id}>{item.bookingReference} — due {formatCurrency(item.remainingBalance)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="payment-amount" className="label">Amount (₹1 to {formatCurrency(selectedBooking?.remainingBalance || 0)})</label>
          <input id="payment-amount" type="number" required min="1" step="0.01" max={selectedBooking?.remainingBalance || 0} className="input-field" value={form.amount}
            onChange={event => setForm({ ...form, amount: event.target.value })} />
        </div>
        {qrCode && <img src={qrCode} alt="Payment QR" className="mx-auto w-48 rounded-lg border border-softpink-200" />}
        <UpiPaymentOptions settings={settings} amount={amountValid ? form.amount : 0} paymentLink={appLink} refreshRequest={refreshRequest} qrCode={qrCode} />
        <div>
          <label htmlFor="payment-ref" className="label">UPI transaction reference (optional)</label>
          <input id="payment-ref" className="input-field" value={form.transactionRef} onChange={event => setForm({ ...form, transactionRef: event.target.value })} />
        </div>
        <div>
          <label htmlFor="payment-screenshot" className="label">Upload Payment Screenshot</label>
          <input id="payment-screenshot" type="file" required accept="image/jpeg,image/png,image/webp,image/gif" className="input-field" onChange={event => setScreenshot(event.target.files?.[0] || null)} />
        </div>
        <button type="submit" disabled={submittingId === 'new' || !amountValid} className="btn-primary w-full">{submittingId === 'new' ? 'Submitting...' : 'Submit for Verification'}</button>
      </form>}

      {payments.length === 0 ? (
        <div className="card text-center py-8 text-gray-500">No payments yet</div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div key={payment._id} className="card">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-semibold text-rosegold-600">{formatCurrency(payment.amount)}</p>
                  <p className="text-sm text-gray-500">
                    {payment.appointment?.bookingReference || 'Booking'} - {formatDate(payment.createdAt)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  payment.status === 'verified' ? 'bg-green-100 text-green-700' :
                  payment.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {payment.status === 'pending' ? 'Awaiting verification' : payment.status}
                </span>
              </div>

              {payment.status === 'pending' && (
                <p className="mt-3 text-sm text-amber-700">Screenshot submitted. It is not counted as paid until the owner verifies it.</p>
              )}
              {payment.verificationNote && (
                <p className="mt-3 text-sm text-gray-600">Owner note: {payment.verificationNote}</p>
              )}

              {payment.status === 'rejected' && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
                  <p className="text-sm text-red-700">Upload one clear, new screenshot for the same payment amount.</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="input-field mt-3 bg-white"
                    onChange={(event) => setFiles((current) => ({ ...current, [payment._id]: event.target.files?.[0] || null }))}
                  />
                  <button
                    onClick={() => reuploadScreenshot(payment)}
                    disabled={submittingId === payment._id}
                    className="btn-primary mt-3 w-full"
                  >
                    {submittingId === payment._id ? 'Submitting...' : 'Submit New Screenshot'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
