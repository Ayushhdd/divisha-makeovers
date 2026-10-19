import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { fetchServices } from '../../store/serviceSlice';
import api from '../../api/axios';
import { useState } from 'react';
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

export default function CustomerDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list, loading, error: servicesError } = useSelector((state) => state.services);
  const [upcoming, setUpcoming] = useState([]);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    dispatch(fetchServices());
    let active = true;
    setAppointmentsError('');
    api.get('/appointments/my?type=upcoming')
      .then(({ data }) => { if (active) setUpcoming(data.slice(0, 3)); })
      .catch((err) => { if (active) setAppointmentsError(err.response?.data?.message || 'Could not load upcoming appointments.'); });
    return () => { active = false; };
  }, [dispatch, retry]);

  return (
    <div className="space-y-6 animate-fade-in">
      {(servicesError || appointmentsError) && <div className="space-y-2" role="alert">
        <Alert message={servicesError || appointmentsError} />
        <button type="button" className="btn-secondary" onClick={() => setRetry(value => value + 1)}>Retry loading</button>
      </div>}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-800">
          Hello, {user?.fullName?.split(' ')[0]}! ✨
        </h1>
        <p className="text-gray-500 mt-1">Ready for your next makeover?</p>
      </div>

      <Link to="/divisha/book" className="block card bg-gradient-to-r from-rosegold-500 to-rosegold-600 text-white hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-semibold">Book Appointment</p>
            <p className="text-rosegold-100 text-sm mt-1">Choose services & schedule your visit</p>
          </div>
          <span className="text-3xl">→</span>
        </div>
      </Link>

      {upcoming.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-gray-800">Upcoming Appointments</h2>
            <Link to="/divisha/appointments" className="text-sm text-rosegold-600">View all</Link>
          </div>
          <div className="space-y-3">
            {upcoming.map((apt) => (
              <div key={apt._id} className="card py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{formatDate(apt.appointmentDate)} · {apt.appointmentTime}</p>
                    <p className="text-sm text-gray-500">{apt.venue}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[apt.status]}`}>
                    {STATUS_LABELS[apt.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-semibold text-gray-800 mb-3">Our Services</h2>
        {loading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {list.slice(0, 6).map((svc) => (
              <div key={svc._id} className="card py-3">
                <p className="font-medium text-gray-800">{svc.name}</p>
                <p className="text-xs text-rosegold-500 mb-1">{svc.category}</p>
                <p className="text-sm font-semibold text-rosegold-600">{formatCurrency(svc.price)}</p>
              </div>
            ))}
          </div>
        )}
        <Link to="/divisha/book" className="btn-outline w-full mt-4 text-center block">
          View All & Book
        </Link>
      </div>
    </div>
  );
}
