import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from './components/ui/LoadingSpinner';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const DivishaHome = lazy(() => import('./pages/DivishaHome'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));

const CustomerLayout = lazy(() => import('./layouts/CustomerLayout'));
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'));
const BookAppointment = lazy(() => import('./pages/customer/BookAppointment'));
const MyAppointments = lazy(() => import('./pages/customer/MyAppointments'));
const PaymentHistory = lazy(() => import('./pages/customer/PaymentHistory'));
const ProfilePage = lazy(() => import('./pages/customer/ProfilePage'));
const ReceiptPage = lazy(() => import('./pages/customer/ReceiptPage'));

const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminServices = lazy(() => import('./pages/admin/Services'));
const AdminAppointments = lazy(() => import('./pages/admin/Appointments'));
const AdminCalendar = lazy(() => import('./pages/admin/Calendar'));
const AdminCustomers = lazy(() => import('./pages/admin/Customers'));
const CustomerDetail = lazy(() => import('./pages/admin/CustomerDetail'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const ChangePassword = lazy(() => import('./pages/admin/ChangePassword'));

function ProtectedRoute({ children, role }) {
  const { user, token } = useSelector((state) => state.auth);
  if (!token || !user) return <Navigate to={role === 'admin' ? '/admin/login' : '/divisha/login'} replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/divisha/dashboard'} replace />;
  }
  return children;
}

function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/login" element={<LoginPage admin />} />
        <Route path="/admin/forgot-password" element={<ForgotPasswordPage admin />} />

        <Route path="/divisha">
          <Route index element={<DivishaHome />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route
            element={
              <ProtectedRoute role="customer">
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="book" element={<BookAppointment />} />
            <Route path="appointments" element={<MyAppointments />} />
            <Route path="payments" element={<PaymentHistory />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="receipt/:id" element={<ReceiptPage />} />
          </Route>
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="appointments" element={<AdminAppointments />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        <Route path="*" element={<Navigate to="/divisha" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
