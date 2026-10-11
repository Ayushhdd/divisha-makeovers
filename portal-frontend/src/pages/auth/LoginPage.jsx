import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/authSlice';
import Alert from '../../components/ui/Alert';
import Logo from '../../components/Logo';

export default function LoginPage({ admin = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState(location.state?.message ||
    (admin && new URLSearchParams(location.search).get('updated') === '1'
      ? 'Your login was updated. Sign in with your current admin email and new password.' : ''));
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ ...form, adminOnly: admin }));
    if (loginUser.fulfilled.match(result)) {
      navigate(result.payload.role === 'admin' ? '/admin' : '/divisha/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-softpink-50">
      <div className="p-4 text-center">
        <Logo />
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="card w-full max-w-md animate-fade-in">
          <h1 className="font-display text-2xl font-bold text-gray-800 mb-1">{admin ? 'Admin Sign In' : 'Welcome Back'}</h1>
          <p className="text-gray-500 text-sm mb-6">{admin ? 'Sign in with your existing admin account' : 'Sign in to your account'}</p>

          {error && <Alert message={error} onClose={() => dispatch(clearError())} />}
          {message && <Alert type="success" message={message} onClose={() => setMessage('')} />}

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                autoComplete="username"
                type="email"
                required
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                autoComplete="current-password"
                type="password"
                required
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                className="rounded border-gray-300 text-rosegold-500"
              />
              Remember me
            </label>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm space-y-2">
            <Link to={admin ? '/admin/forgot-password' : '/divisha/forgot-password'} className="text-rosegold-600 hover:underline block">
              Forgot Password?
            </Link>
            {!admin && <p className="text-gray-500">
              New customer?{' '}
              <Link to="/divisha/register" className="text-rosegold-600 font-medium hover:underline">
                Register here
              </Link>
            </p>}
          </div>
        </div>
      </div>
    </div>
  );
}
