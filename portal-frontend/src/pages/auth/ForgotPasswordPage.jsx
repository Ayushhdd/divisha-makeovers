import { useEffect, useState } from 'react';
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
  const [resendAfter, setResendAfter] = useState(0);
  useEffect(() => {
    if (resendAfter <= 0) return;
    const timer = setTimeout(() => setResendAfter(value => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [resendAfter]);

  const handleSendOTP = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email, accountType: admin ? 'admin' : 'customer' });
      setMessage(`A 6-digit OTP was sent to ${email.trim()}. It expires in 10 minutes. Check your inbox and spam folder.`);
      setResendAfter(data.retryAfter || 60);
      setOtp('');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
      if (err.response?.data?.retryAfter) setResendAfter(err.response.data.retryAfter);
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword, accountType: admin ? 'admin' : 'customer' });
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
          <h1 className="font-display text-2xl font-bold mb-4">{admin ? 'Reset Admin Password' : 'Reset Password'}</h1>
          {error && <Alert message={error} onClose={() => setError('')} />}
          {message && step !== 3 && <Alert type="info" message={message} />}

          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="label" htmlFor="recovery-email">Email Address</label>
                <input id="recovery-email" type="email" required className="input-field" value={email}
                  onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button type="submit" disabled={loading || resendAfter > 0} className="btn-primary w-full">
                {loading ? 'Sending...' : resendAfter > 0 ? `Try again in ${resendAfter}s` : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="label" htmlFor="recovery-otp">OTP</label>
                <input id="recovery-otp" required minLength="6" inputMode="numeric" autoComplete="one-time-code" className="input-field" value={otp} maxLength="6"
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="6-digit OTP" />
              </div>
              <div>
                <label className="label" htmlFor="recovery-password">New Password</label>
                <input id="recovery-password" type="password" required minLength={admin ? 11 : 6} autoComplete="new-password" className="input-field" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {step === 2 && <div className="mt-4 flex flex-wrap justify-between gap-3 text-sm">
            <button type="button" onClick={handleSendOTP} disabled={loading || resendAfter > 0} className="text-rosegold-600 disabled:text-gray-400">
              {resendAfter > 0 ? `Resend OTP in ${resendAfter}s` : 'Resend OTP'}
            </button>
            <button type="button" disabled={loading} onClick={() => { setStep(1); setMessage(''); setError(''); setOtp(''); setNewPassword(''); setResendAfter(0); }} className="text-rosegold-600">
              Change email
            </button>
          </div>}
          {step === 1 && !admin && <Link to="/divisha/register" className="mt-4 block text-center text-sm text-rosegold-600">No account yet? Register here</Link>}

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
