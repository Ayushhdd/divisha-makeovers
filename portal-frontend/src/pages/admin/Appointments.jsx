import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({ date: '', customer: '', status: '', service: '' });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
      const [appointmentsResponse, paymentsResponse] = await Promise.all([
        api.get('/appointments/admin/all', { params }),
        api.get('/payments/all'),
      ]);
      setAppointments(appointmentsResponse.data);
      setPayments(paymentsResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load booking information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    api.get('/admin/customers')
      .then(({ data }) => setCustomers(data))
      .catch(() => setError('Could not load customer filters'));
    api.get('/services/all')
      .then(({ data }) => setServices(data))
      .catch(() => setError('Could not load service filters'));
  }, []);

  const getPaymentForAppointment = (appointmentId) => {
    const linkedPayments = payments.filter((payment) =>
      String(payment.appointment?._id || payment.appointment || '') === String(appointmentId)
    );
    return linkedPayments.find((payment) => payment.status === 'pending') || linkedPayments[0] || null;
  };

  const updateStatus = async (id, status) => {
    setActionId(`${id}:${status}`);
    setError('');
    setMessage('');
    try {
      await api.put(`/appointments/${id}/status`, { status });
      setMessage(status === 'confirmed' ? 'Booking approved.' : 'Booking status updated.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update the booking');
    } finally {
      setActionId('');
    }
  };

  const reviewPayment = async (payment, status) => {
    const verificationNote = status === 'rejected'
      ? window.prompt('Why is this payment being rejected?')
      : 'Verified by owner';
    if (status === 'rejected' && !verificationNote?.trim()) return;

    setActionId(`${payment._id}:${status}`);
    setError('');
    setMessage('');
    try {
      await api.put(`/payments/${payment._id}/verify`, {
        status,
        verificationNote: verificationNote?.trim() || '',
      });
      setMessage(status === 'verified'
        ? 'Payment verified and booking confirmed.'
        : 'Payment rejected. The customer can now submit a new screenshot.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not review the payment');
    } finally {
      setActionId('');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Appointments</h1>
        <button onClick={load} className="btn-outline text-sm">Refresh</button>
      </div>
      {error && <Alert message={error} onClose={() => setError('')} />}
      {message && <Alert type="success" message={message} onClose={() => setMessage('')} />}

      <div className="card grid grid-cols-2 sm:grid-cols-4 gap-3">
        <input type="date" className="input-field" value={filters.date}
          onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
        <select className="input-field" value={filters.customer}
          onChange={(event) => setFilters({ ...filters, customer: event.target.value })}>
          <option value="">All Customers</option>
          {customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.fullName}</option>)}
        </select>
        <select className="input-field" value={filters.status}
          onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        <select className="input-field" value={filters.service}
          onChange={(event) => setFilters({ ...filters, service: event.target.value })}>
          <option value="">All Services</option>
          {services.map((service) => <option key={service._id} value={service._id}>{service.name}</option>)}
        </select>
        <button onClick={load} className="btn-primary col-span-2 sm:col-span-4">Apply Filters</button>
      </div>

      {loading ? <LoadingSpinner /> : appointments.length === 0 ? (
        <div className="card text-center py-8 text-gray-500">No appointments match these filters.</div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => {
            const payment = getPaymentForAppointment(appointment._id);
            const payNow = appointment.paymentOption === 'pay_now';
            const awaitingPaymentReview =
              payNow &&
              payment?.status === 'pending' &&
              ['pending_approval', 'payment_rejected'].includes(appointment.status);
            const verifying = actionId === `${payment?._id}:verified`;
            const rejecting = actionId === `${payment?._id}:rejected`;

            return (
              <div key={appointment._id} className="card">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <p className="font-medium">{appointment.bookingReference}</p>
                    <p className="text-sm">{appointment.customer?.fullName} - {appointment.customer?.mobile}</p>
                    <p className="text-sm text-gray-500">{formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}</p>
                    <p className="text-xs text-gray-400">{appointment.venue}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[appointment.status]}`}>
                      {STATUS_LABELS[appointment.status]}
                    </span>
                    <p className="text-sm font-semibold mt-1">{formatCurrency(appointment.totalAmount)}</p>
                    <p className="text-xs text-gray-500">Verified paid: {formatCurrency(appointment.advancePaid)}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                  {appointment.services?.map((item, index) => <span key={index} className="rounded-lg bg-softpink-100 px-2 py-1">
                    {item.service?.name || item.customServiceName} × {item.quantity || 1}
                  </span>)}
                </div>
                {payment && (
                  <div className="mt-3 rounded-xl border border-softpink-100 bg-softpink-50 p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span>Submitted payment: <strong>{formatCurrency(payment.amount)}</strong></span>
                      <span className="text-xs uppercase tracking-wide text-gray-500">{payment.status}</span>
                    </div>
                    {payment.verificationNote && <p className="mt-1 text-xs text-gray-600">Owner note: {payment.verificationNote}</p>}
                  </div>
                )}

                {appointment.status === 'pending_payment' && (
                  <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Waiting for the customer to submit payment evidence or for the owner to reject the request.
                    <button
                      onClick={() => updateStatus(appointment._id, 'rejected')}
                      disabled={actionId === `${appointment._id}:rejected`}
                      className="btn-outline ml-3 text-sm text-red-600"
                    >
                      Reject Booking
                    </button>
                  </div>
                )}

                {awaitingPaymentReview && (
                  <div className="mt-3 space-y-2">
                    {payment?.status === 'pending' ? (
                      <div className="grid gap-2 sm:grid-cols-3">
                        {payment.screenshotUrl ? (
                          <a href={payment.screenshotUrl} target="_blank" rel="noreferrer" className="btn-outline text-sm py-2 text-center">View Screenshot</a>
                        ) : (
                          <span className="rounded-xl border border-red-100 px-3 py-2 text-center text-sm text-red-600">Screenshot unavailable</span>
                        )}
                        <button onClick={() => reviewPayment(payment, 'verified')} disabled={verifying || rejecting} className="btn-primary text-sm py-2">
                          {verifying ? 'Approving...' : 'Approve Payment'}
                        </button>
                        <button onClick={() => reviewPayment(payment, 'rejected')} disabled={verifying || rejecting} className="btn-outline text-sm py-2 text-red-600">
                          {rejecting ? 'Rejecting...' : 'Reject Payment'}
                        </button>
                      </div>
                    ) : (
                      <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        No pending payment proof is available. Ask the customer to submit a new screenshot from the Payments page.
                      </p>
                    )}
                  </div>
                )}

                {appointment.status === 'pending_approval' && !payNow && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => updateStatus(appointment._id, 'confirmed')} disabled={actionId === `${appointment._id}:confirmed`} className="btn-primary text-sm py-1.5 flex-1">
                      {actionId === `${appointment._id}:confirmed` ? 'Approving...' : 'Approve Booking Request'}
                    </button>
                    <button onClick={() => updateStatus(appointment._id, 'rejected')} disabled={actionId === `${appointment._id}:rejected`} className="btn-outline text-sm py-1.5 flex-1 text-red-600">
                      Reject Booking
                    </button>
                  </div>
                )}

                {appointment.status === 'payment_rejected' && !awaitingPaymentReview && (
                  <div className="mt-3 flex gap-2">
                    <p className="flex-1 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                      Customer has been asked to upload a new screenshot. Do not approve this booking until the new proof is verified.
                    </p>
                    <button onClick={() => updateStatus(appointment._id, 'rejected')} disabled={actionId === `${appointment._id}:rejected`} className="btn-outline text-sm text-red-600">
                      Reject Booking
                    </button>
                  </div>
                )}

                {appointment.status === 'confirmed' && (
                  <button onClick={() => updateStatus(appointment._id, 'completed')} disabled={actionId === `${appointment._id}:completed`} className="btn-secondary text-sm mt-3 w-full">
                    {actionId === `${appointment._id}:completed` ? 'Updating...' : 'Mark Completed'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
