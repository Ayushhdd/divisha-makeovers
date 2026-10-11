import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import api from '../../api/axios';
import Alert from '../../components/ui/Alert';

export default function ChangePassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '', newEmail: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        ...(form.newEmail.trim() ? { newEmail: form.newEmail.trim() } : {}),
      });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '', newEmail: '' });
      navigate('/divisha/login', { replace: true, state: {
        message: 'Login updated. All sessions were signed out. Sign in with your new email and password.',
      } });
      dispatch(logout());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md space-y-4 animate-fade-in">
      <h1 className="font-display text-2xl font-bold">Change Admin Login</h1>
      <p className="text-sm text-gray-600">Choose a unique password of at least 15 characters. Updating your login signs out every session, including this one.</p>
      {error && <Alert message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label" htmlFor="current-password">Current Password</label>
          <input id="current-password" type="password" autoComplete="current-password" required className="input-field" value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="new-email">New Login Email (optional)</label>
          <input id="new-email" type="email" autoComplete="username" className="input-field" value={form.newEmail}
            onChange={(e) => setForm({ ...form, newEmail: e.target.value })} />
          <p className="text-xs text-gray-500 mt-1">Leave blank to keep your current email. If you change it, use an inbox you control for password recovery.</p>
        </div>
        <div>
          <label className="label" htmlFor="new-password">New Password</label>
          <input id="new-password" type="password" autoComplete="new-password" required minLength="15" maxLength="72" className="input-field" value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="confirm-password">Confirm New Password</label>
          <input id="confirm-password" type="password" autoComplete="new-password" required className="input-field" value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Updating...' : 'Update Login & Sign Out'}
        </button>
      </form>
    </div>
  );
}
