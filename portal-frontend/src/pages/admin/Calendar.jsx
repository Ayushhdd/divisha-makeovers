import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';

export default function AdminCalendar() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [view, setView] = useState('month');
  const [calendar, setCalendar] = useState({});
  const [dailySchedule, setDailySchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(now.toISOString().slice(0, 10));
  const [loadedKey, setLoadedKey] = useState('');
  const [error, setError] = useState('');
  const requestKey = view === 'month' ? `month:${year}:${month}` : `daily:${selectedDate}`;
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();
    const monthly = view === 'month';
    api.get(monthly ? '/appointments/calendar' : '/appointments/schedule', {
      params: monthly ? { month, year } : { date: selectedDate },
      signal: controller.signal,
    }).then(({ data }) => {
      if (controller.signal.aborted) return;
      if (monthly) setCalendar(data);
      else setDailySchedule(data);
      setError('');
    }).catch(err => {
      if (controller.signal.aborted) return;
      setCalendar({});
      setDailySchedule([]);
      setError(err.response?.data?.message || 'Could not load the calendar. Please refresh to try again.');
    }).finally(() => {
      if (!controller.signal.aborted) setLoadedKey(requestKey);
    });
    return () => controller.abort();
  }, [month, year, view, selectedDate, requestKey]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  return (
    <div className="space-y-4 animate-fade-in">
      {!loading && error && <Alert type="error" message={error} />}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="font-display text-2xl font-bold">Calendar</h1>
        <div className="flex gap-2">
          <button onClick={() => setView('month')} className={`px-3 py-1.5 rounded-lg text-sm ${view === 'month' ? 'bg-rosegold-500 text-white' : 'bg-white border'}`}>
            Monthly
          </button>
          <button onClick={() => setView('daily')} className={`px-3 py-1.5 rounded-lg text-sm ${view === 'daily' ? 'bg-rosegold-500 text-white' : 'bg-white border'}`}>
            Daily Schedule
          </button>
        </div>
      </div>

      {view === 'month' && (
        <>
          <div className="flex items-center gap-4">
            <button onClick={() => { if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1); }} className="btn-outline py-1 px-3">←</button>
            <span className="font-medium">{new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => { if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1); }} className="btn-outline py-1 px-3">→</button>
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="card overflow-x-auto">
              <div className="grid grid-cols-7 gap-1 min-w-[320px]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const events = calendar[dateStr] || [];
                  return (
                    <button
                      key={day}
                      onClick={() => { setSelectedDate(dateStr); setView('daily'); }}
                      className={`min-h-[60px] p-1 rounded-lg border text-left text-xs ${
                        events.length ? 'bg-rosegold-50 border-rosegold-200' : 'border-gray-100'
                      } ${dateStr === selectedDate ? 'ring-2 ring-rosegold-400' : ''}`}
                    >
                      <span className="font-medium">{day}</span>
                      {events.length > 0 && (
                        <span className="block text-rosegold-600 mt-0.5">{events.length} apt</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {view === 'daily' && (
        <>
          <input type="date" className="input-field max-w-xs" value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)} />
          {loading ? <LoadingSpinner /> : dailySchedule.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">No appointments for this day</div>
          ) : (
            <div className="space-y-3">
              {dailySchedule.map((apt) => (
                <div key={apt._id} className="card flex gap-4">
                  <div className="text-rosegold-600 font-bold text-lg min-w-[60px]">{apt.appointmentTime}</div>
                  <div className="flex-1">
                    <p className="font-medium">{apt.customer?.fullName}</p>
                    <p className="text-sm text-gray-500">{apt.venue}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[apt.status]}`}>
                      {STATUS_LABELS[apt.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
