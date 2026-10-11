import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then(({ data }) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const formData = new FormData();
    formData.append('upiId', settings.upiId);
    formData.append('upiIntentEnabled', settings.upiIntentEnabled === true);
    formData.append('merchantCategoryCode', settings.merchantCategoryCode || '');
    formData.append('paymentInstructions', settings.paymentInstructions);
    formData.append('businessName', settings.businessName);
    formData.append('businessPhone', settings.businessPhone || '');
    formData.append('businessEmail', settings.businessEmail || '');
    formData.append('reminderHoursBefore', settings.reminderHoursBefore || 24);
    if (qrFile) formData.append('qrCode', qrFile);

    try {
      const { data } = await api.put('/admin/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSettings(data);
      setQrFile(null);
      setMessage('Settings saved successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-lg space-y-4 animate-fade-in">
      <h1 className="font-display text-2xl font-bold">Payment Settings</h1>
      {message && <Alert type="success" message={message} onClose={() => setMessage('')} />}
      {error && <Alert message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSave} className="card space-y-4">
        <div>
          <label className="label">Business Name</label>
          <input className="input-field" value={settings.businessName || ''}
            onChange={(e) => setSettings({ ...settings, businessName: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="settings-upi-id">UPI ID</label>
          <input id="settings-upi-id" className="input-field" placeholder="yourname@upi"
            value={settings.upiId || ''}
            onChange={(e) => setSettings({ ...settings, upiId: e.target.value, upiIntentEnabled: false, merchantCategoryCode: '' })} />
        </div>
        <div className="space-y-3 rounded-xl border border-softpink-200 p-3">
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={settings.upiIntentEnabled === true}
              onChange={(e) => setSettings({ ...settings, upiIntentEnabled: e.target.checked })} />
            Enable merchant app checkout
          </label>
          <p className="text-xs text-gray-600">Enable only for a merchant UPI ID approved for website/app payments by your bank or payment provider. Verification of a personal UPI ID is not merchant onboarding.</p>
          <label className="label" htmlFor="settings-merchant-code">Merchant Category Code (MCC)</label>
          <input id="settings-merchant-code" className="input-field" inputMode="numeric" pattern="[0-9]{4}" maxLength="4" required={settings.upiIntentEnabled === true}
            placeholder="Code assigned by your provider" value={settings.merchantCategoryCode || ''}
            onChange={(e) => setSettings({ ...settings, merchantCategoryCode: e.target.value.replace(/\D/g, '') })} />
          <p className="text-xs text-gray-600">Use the actual code from your merchant details or original provider QR. Do not guess it. With checkout off, customers can still copy your UPI ID or save the QR and pay inside their app.</p>
        </div>
        <div>
          <label className="label">Payment QR Code</label>
          {settings.qrCodeUrl && (
            <img src={settings.qrCodeUrl} alt="QR Code" className="w-40 mb-2 rounded-lg" loading="lazy" />
          )}
          <input type="file" accept="image/*" className="input-field"
            onChange={(e) => setQrFile(e.target.files[0])} />
        </div>
        <div>
          <label className="label">Payment Instructions</label>
          <textarea className="input-field" rows="3"
            value={settings.paymentInstructions || ''}
            onChange={(e) => setSettings({ ...settings, paymentInstructions: e.target.value })} />
        </div>
        <div>
          <label className="label">Reminder Hours Before Appointment</label>
          <input type="number" min="1" className="input-field"
            value={settings.reminderHoursBefore || 24}
            onChange={(e) => setSettings({ ...settings, reminderHoursBefore: e.target.value })} />
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
