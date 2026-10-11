import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Logo from '../components/Logo';

export default function DivishaHome() {
  const { user, token } = useSelector((state) => state.auth);

  if (token && user?.role === 'customer') {
    return <Navigate to="/divisha/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-softpink-50 to-white">
      <header className="px-4 py-6 text-center">
        <Logo size="lg" />
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 text-center animate-fade-in">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-rosegold-300 to-rosegold-500 flex items-center justify-center text-4xl shadow-lg">
          ✨
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
          Welcome to Divisha Makeovers
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Premium bridal, party & HD makeup services. Book your dream look with ease.
        </p>

        <div className="space-y-3">
          <Link to="/divisha/register" className="btn-primary block w-full py-3 text-center">
            Create Account & Book
          </Link>
          <Link to="/divisha/login" className="btn-secondary block w-full py-3 text-center">
            Login to Continue
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          {['Bridal Makeup', 'Party Looks', 'HD Makeup'].map((item) => (
            <div key={item} className="card py-4">
              <p className="text-xs sm:text-sm font-medium text-rosegold-600">{item}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-gray-400">
        © {new Date().getFullYear()} Divisha Makeovers
      </footer>
    </div>
  );
}
