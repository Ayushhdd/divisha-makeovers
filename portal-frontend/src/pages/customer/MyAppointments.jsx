import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function MyAppointments() {
  const [tab, setTab] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadAppointments = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/appointments/my?type=${tab}`);
        if (active) setAppointments(data);
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Could not load appointments');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAppointments();
    return () => { active = false; };
  }, [tab]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      setAppointments((current) => current.filter((appointment) => appointment._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel this booking');
    }
  };

  const getPaymentMessage = (appointment) => {
    if (appointment.status === 'payment_rejected') {
      return 'Payment proof was rejected. Open Payments to upload a new screenshot.';
    }
    if (appointment.paymentOption === 'pay_now' && appointment.status === 'pending_approval') {
      return 'Payment proof submitted. Awaiting owner verification.';
    }
    if (appointment.status === 'pending_payment') {
      return 'Awaiting payment or owner review.';
    }
    if (['confirmed', 'completed'].includes(appointment.status)) {
      return `Verified paid: ${formatCurrency(appointment.advancePaid)} | Due: ${formatCurrency(appointment.remainingBalance)}`;
    }
    return 'Booking request awaiting owner approval.';
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="font-display text-2xl font-bold">My Appointments</h1>
      {error && <Alert message={error} onClose={() => setError('')} />}

      <div className="flex gap-2">
        {['upcoming', 'past'].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${
              tab === item ? 'bg-rosegold-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : appointments.length === 0 ? (
        <div className="card text-center py-8 text-gray-500">
          <p>No {tab} appointments</p>
          <Link to="/divisha/book" className="btn-primary inline-block mt-4">Book Now</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => {
            const receiptAvailable = ['confirmed', 'completed'].includes(appointment.status);
            const canCancel = tab === 'upcoming' &&
              ['pending_approval', 'pending_payment', 'payment_rejected', 'confirmed'].includes(appointment.status);

            return (
              <div key={appointment._id} className="card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{appointment.bookingReference}</p>
                    <p className="text-sm text-gray-600">{formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[appointment.status]}`}>
                    {STATUS_LABELS[appointment.status]}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{appointment.venue}</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-3">
                  {appointment.services?.map((service, index) => (
                    <span key={index} className="bg-softpink-100 px-2 py-1 rounded-lg">
                      {service.service?.name || service.customServiceName}
                      {' × '}{service.quantity || 1}
                    </span>
                  ))}
                </div>
                <div className="border-t border-softpink-100 pt-3 text-sm">
                  <p>Total: <strong>{formatCurrency(appointment.totalAmount)}</strong></p>
                  <p className="mt-1 text-gray-600">{getPaymentMessage(appointment)}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  {receiptAvailable ? (
                    <Link to={`/divisha/receipt/${appointment._id}`} className="btn-outline text-sm py-1.5 px-3 flex-1 text-center">
                      Receipt
                    </Link>
                  ) : appointment.status === 'payment_rejected' ? (
                    <Link to="/divisha/payments" className="btn-primary text-sm py-1.5 px-3 flex-1 text-center">
                      Re-upload Screenshot
                    </Link>
                  ) : (
                    <span className="flex-1 rounded-xl border border-softpink-100 px-3 py-1.5 text-center text-sm text-gray-500">
                      Receipt available after approval
                    </span>
                  )}
                  {canCancel && (
                    <button onClick={() => handleCancel(appointment._id)} className="text-sm text-red-600 py-1.5 px-3">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
