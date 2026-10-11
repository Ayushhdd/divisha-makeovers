import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ReceiptPage() {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadReceipt = async () => {
      try {
        const { data } = await api.get(`/appointments/${id}/receipt`);
        if (active) setReceipt(data);
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Receipt could not be loaded');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadReceipt();
    return () => { active = false; };
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error || !receipt) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <Alert message={error || 'Receipt not found'} />
        <Link to="/divisha/appointments" className="btn-primary block text-center">Back to Appointments</Link>
      </div>
    );
  }

  const { appointment, payments } = receipt;

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      <div className="card print:shadow-none" id="receipt">
        <div className="text-center border-b border-softpink-200 pb-4 mb-4">
          <h1 className="font-display text-2xl font-bold text-rosegold-600">Divisha Makeovers</h1>
          <p className="text-sm text-gray-500">Confirmed Booking Receipt</p>
        </div>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between"><span className="text-gray-500">Reference</span><span className="font-medium">{appointment.bookingReference}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{formatDate(appointment.appointmentDate)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Time</span><span>{appointment.appointmentTime}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Venue</span><span>{appointment.venue}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Customer</span><span>{appointment.customer?.fullName}</span></div>
        </div>

        <div className="border-t border-softpink-200 pt-3 mb-4">
          <p className="font-medium mb-2">Services</p>
          {appointment.services?.map((service, index) => (
            <div key={index} className="flex justify-between text-sm py-1">
              <span>{service.service?.name || service.customServiceName} × {service.quantity || 1}
                <span className="block text-xs text-gray-500">{formatCurrency(service.price)} each</span>
              </span>
              <span>{formatCurrency(service.price * (service.quantity || 1))}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-softpink-200 pt-3 space-y-1 text-sm">
          <div className="flex justify-between font-semibold"><span>Total</span><span>{formatCurrency(appointment.totalAmount)}</span></div>
          <div className="flex justify-between"><span>Verified Paid</span><span>{formatCurrency(appointment.advancePaid)}</span></div>
          <div className="flex justify-between text-rosegold-600 font-medium"><span>Balance Due</span><span>{formatCurrency(appointment.remainingBalance)}</span></div>
        </div>

        {payments.length > 0 && (
          <div className="border-t border-softpink-200 pt-3 mt-3">
            <p className="font-medium text-sm mb-2">Verified Payment History</p>
            {payments.map((payment) => (
              <div key={payment._id} className="flex justify-between text-xs text-gray-500 py-1">
                <span>{formatDate(payment.createdAt)} - {payment.type}</span>
                <span>{formatCurrency(payment.amount)}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-6">Generated on {formatDate(receipt.generatedAt)}</p>
      </div>

      <button onClick={() => window.print()} className="btn-primary w-full mt-4 print:hidden">
        Download / Print Receipt
      </button>
    </div>
  );
}
