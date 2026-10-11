import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Alert from '../../components/ui/Alert';
import Logo from '../../components/Logo';

export default function ForgotPasswordPage({ admin = false }) {
  const loginPath = admin ? '/admin/login' : '/divisha/login';
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage('If that email has an account, a 6-digit OTP has been sent. Check your inbox and spam folder.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setMessage('Password reset successful! You can now login.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-softpink-50 flex flex-col">
      <div className="p-4 text-center"><Logo /></div>
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="card w-full max-w-md animate-fade-in">
          <h1 className="font-display text-2xl font-bold mb-4">Reset Password</h1>
          {error && <Alert message={error} onClose={() => setError('')} />}
          {message && step !== 3 && <Alert type="info" message={message} />}

          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input type="email" required className="input-field" value={email}
                  onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="label">OTP</label>
                <input required inputMode="numeric" autoComplete="one-time-code" className="input-field" value={otp} maxLength="6"
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="6-digit OTP" />
              </div>
              <div>
                <label className="label">New Password</label>
                <input type="password" required minLength={admin ? 11 : 6} autoComplete="new-password" className="input-field" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center">
              <Alert type="success" message={message} />
              <Link to={loginPath} className="btn-primary inline-block mt-4">Go to Login</Link>
            </div>
          )}

          <Link to={loginPath} className="block text-center text-sm text-rosegold-600 mt-4 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
