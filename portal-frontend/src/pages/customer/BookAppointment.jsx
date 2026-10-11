import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { fetchServices, toggleService, clearSelected, setServiceQuantity } from '../../store/serviceSlice';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/helpers';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import UpiPaymentOptions from '../../components/UpiPaymentOptions';
import { buildUpiLink } from '../../utils/upi';

const PAYMENT_TIMER_SECONDS = 5 * 60;
const todayIso = () => new Date().toISOString().split('T')[0];
const TIME_SLOTS = [
  { value: '07:00', label: '7:00 AM' },
  { value: '07:30', label: '7:30 AM' },
  { value: '08:00', label: '8:00 AM' },
  { value: '08:30', label: '8:30 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '09:30', label: '9:30 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '10:30', label: '10:30 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '11:30', label: '11:30 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '12:30', label: '12:30 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '13:30', label: '1:30 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '14:30', label: '2:30 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '15:30', label: '3:30 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '16:30', label: '4:30 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '17:30', label: '5:30 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '18:30', label: '6:30 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '19:30', label: '7:30 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '20:30', label: '8:30 PM' },
  { value: '21:00', label: '9:00 PM' },
  { value: '21:30', label: '9:30 PM' },
  { value: '22:00', label: '10:00 PM' },
];

const BOOKING_CATEGORIES = [
  { value: '', label: 'All', code: 'ALL', hint: 'Full menu' },
  { value: 'Bridal Makeup', label: 'Bridal', code: 'BR', hint: 'Bride looks' },
  {
    value: 'Engagement & Reception Makeup',
    label: 'Engagement',
    code: 'ER',
    hint: 'Shagun & reception',
  },
  { value: 'Party Makeup', label: 'Party', code: 'PT', hint: 'Function looks' },
  { value: 'Nail Art', label: 'Nails', code: 'NL', hint: 'Extensions & art' },
];

const CATEGORY_META = {
  'Bridal Makeup': {
    label: 'Bridal Makeup',
    code: 'BR',
    accent: 'border-[#e7c59d] bg-[#fffaf4] text-[#8a5a2b]',
  },
  'Engagement & Reception Makeup': {
    label: 'Engagement & Reception',
    code: 'ER',
    accent: 'border-[#e8b8c6] bg-[#fff5f8] text-[#934d61]',
  },
  'Party Makeup': {
    label: 'Party Makeup',
    code: 'PT',
    accent: 'border-[#d6bfd9] bg-[#fbf7ff] text-[#705173]',
  },
  'Nail Art': {
    label: 'Nail Art',
    code: 'NL',
    accent: 'border-[#b9d8d0] bg-[#f4fbf8] text-[#416d64]',
  },
};

const getCategoryMeta = (category) =>
  CATEGORY_META[category] || {
    label: category || 'Service',
    code: 'DM',
    accent: 'border-softpink-200 bg-softpink-50 text-rosegold-700',
  };

const getCompleteCustomServices = (services) =>
  services
    .map((service) => ({
      ...service,
      name: service.name.trim(),
      price: parseFloat(service.price),
      duration: parseInt(service.duration, 10) || 60,
      quantity: Number(service.quantity ?? 1),
    }))
    .filter((service) => service.name && Number.isFinite(service.price) && service.price > 0 &&
      Number.isInteger(service.quantity) && service.quantity >= 1 && service.quantity <= 100);

export default function BookAppointment() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading, selected } = useSelector((state) => state.services);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    appointmentDate: '',
    appointmentTime: '',
    venue: '',
    notes: '',
    advanceAmount: '',
    paymentOption: 'pay_later',
    customServiceRequest: '',
  });
  const [customServices, setCustomServices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [generatedQrCode, setGeneratedQrCode] = useState('');
  const [qrImageFailed, setQrImageFailed] = useState(false);
  const [paymentTimer, setPaymentTimer] = useState(PAYMENT_TIMER_SECONDS);
  const [screenshot, setScreenshot] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const activeCategory = BOOKING_CATEGORIES.find((item) => item.value === category) || BOOKING_CATEGORIES[0];

  useEffect(() => {
    dispatch(fetchServices({ search, category }));
  }, [dispatch, search, category]);
  useEffect(() => {
    api.get('/admin/settings/public').then(({ data }) => setSettings(data));
    return () => dispatch(clearSelected());
  }, [dispatch]);

  const completeCustomServices = useMemo(
    () => getCompleteCustomServices(customServices),
    [customServices]
  );
  const selectedIds = useMemo(() => new Set(selected.map((service) => service._id)), [selected]);
  const hasPartialCustomService = customServices.some((service) => {
    const hasName = service.name.trim();
    const hasPrice = String(service.price).trim();
    const quantity = Number(service.quantity ?? 1);
    return (hasName || hasPrice) && !(hasName && parseFloat(service.price) > 0 && Number.isInteger(quantity) && quantity >= 1 && quantity <= 100);
  });
  const hasBookingItems =
    selected.length > 0 || completeCustomServices.length > 0 || form.customServiceRequest.trim();
  const appointmentDetailsComplete =
    Boolean(form.appointmentDate) && Boolean(form.appointmentTime) && Boolean(form.venue.trim());

  const total = selected.reduce((sum, s) => sum + Math.round(s.price * 100) * (s.quantity || 1), 0) / 100 +
    completeCustomServices.reduce((sum, s) => sum + Math.round(s.price * 100) * s.quantity, 0) / 100;
  const selectedItemCount = selected.reduce((sum, s) => sum + (s.quantity || 1), 0) + completeCustomServices.reduce((sum, s) => sum + s.quantity, 0);
  const serviceGroups = useMemo(() => {
    const order = BOOKING_CATEGORIES.map((item) => item.value).filter(Boolean);
    const groups = list.reduce((acc, service) => {
      if (!acc[service.category]) acc[service.category] = [];
      acc[service.category].push(service);
      return acc;
    }, {});

    return Object.entries(groups).sort(([first], [second]) => {
      const firstIndex = order.indexOf(first);
      const secondIndex = order.indexOf(second);
      return (firstIndex === -1 ? 99 : firstIndex) - (secondIndex === -1 ? 99 : secondIndex);
    });
  }, [list]);

  const requestedAdvance = parseFloat(form.advanceAmount) || 0;
  const advance = form.paymentOption === 'pay_now' ? requestedAdvance : 0;
  const remaining = total - advance;
  const paymentAmount = Number.isFinite(advance) && advance >= 1 && advance <= total ? advance : 0;
  const paymentTimerLabel = useMemo(() => {
    const minutes = Math.floor(paymentTimer / 60);
    const seconds = paymentTimer % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [paymentTimer]);
  const paymentTimerProgress = (paymentTimer / PAYMENT_TIMER_SECONDS) * 100;
  const upiPaymentLink = useMemo(() => {
    return buildUpiLink({ upiId: settings?.upiId, businessName: settings?.businessName, amount: paymentAmount });
  }, [paymentAmount, settings?.businessName, settings?.upiId]);

  useEffect(() => {
    let isActive = true;

    setQrImageFailed(false);
    setGeneratedQrCode('');

    if (!upiPaymentLink) {
      setGeneratedQrCode('');
      return () => {
        isActive = false;
      };
    }

    QRCode.toDataURL(upiPaymentLink, {
      margin: 2,
      width: 240,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isActive) setGeneratedQrCode(url);
      })
      .catch(() => {
        if (isActive) setGeneratedQrCode('');
      });

    return () => {
      isActive = false;
    };
  }, [upiPaymentLink]);

  useEffect(() => {
    if (step !== 3 || form.paymentOption !== 'pay_now') {
      setPaymentTimer(PAYMENT_TIMER_SECONDS);
      return undefined;
    }

    setPaymentTimer(PAYMENT_TIMER_SECONDS);

    const timer = window.setInterval(() => {
      setPaymentTimer((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [form.paymentOption, step, upiPaymentLink]);

  const validateStepOne = () => {
    setError('');
    if (!hasBookingItems) {
      setError('Please select at least one service or add a custom request');
      return false;
    }
    if (hasPartialCustomService) {
      setError('Please complete custom service name and price, or remove the incomplete row');
      return false;
    }
    return true;
  };

  const validateStepTwo = () => {
    setError('');
    if (!form.appointmentDate || !form.appointmentTime || !form.venue.trim()) {
      setError('Please fill appointment date, time and venue');
      return false;
    }
    if (form.appointmentDate < todayIso()) {
      setError('Please choose today or a future appointment date');
      return false;
    }
    return true;
  };

  const goToStepTwo = () => {
    if (validateStepOne()) setStep(2);
  };

  const goToPayment = () => {
    if (validateStepTwo()) setStep(3);
  };

  const handleSubmit = async () => {
    if (!validateStepOne() || !validateStepTwo()) {
      return;
    }
    if (form.paymentOption === 'pay_now' && total <= 0) {
      setError('Pay Now requires a priced service. Use Pay Later for custom quote requests.');
      return;
    }
    if (form.paymentOption === 'pay_now' && advance < 1) {
      setError('Minimum advance of Rs. 1 required for Pay Now');
      return;
    }
    if (form.paymentOption === 'pay_now' && advance > total) {
      setError('The payment amount cannot exceed the booking total.');
      return;
    }
    if (form.paymentOption === 'pay_now' && !screenshot) {
      setError('Please upload the payment screenshot before submitting it for verification.');
      return;
    }
    const submittedAdvance = form.paymentOption === 'pay_now' ? advance : 0;
    setSubmitting(true);
    const formData = new FormData();
    formData.append('serviceIds', JSON.stringify(selected.map((s) => s._id)));
    formData.append('serviceQuantities', JSON.stringify(Object.fromEntries(selected.map(s => [s._id, s.quantity || 1]))));
    formData.append('customServices', JSON.stringify(completeCustomServices));
    formData.append('customServiceRequest', form.customServiceRequest.trim());
    formData.append('appointmentDate', form.appointmentDate);
    formData.append('appointmentTime', form.appointmentTime);
    formData.append('venue', form.venue.trim());
    formData.append('notes', form.notes.trim());
    formData.append('advanceAmount', submittedAdvance);
    formData.append('paymentOption', form.paymentOption);
    if (screenshot) formData.append('paymentScreenshot', screenshot);

    try {
      await api.post('/appointments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(clearSelected());
      navigate('/divisha/appointments');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const addCustomService = () => {
    setCustomServices([...customServices, { name: '', price: '', duration: 60, quantity: 1 }]);
  };

  const removeCustomService = (index) => {
    setCustomServices(customServices.filter((_, i) => i !== index));
  };

  if (loading && list.length === 0) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-10 animate-fade-in sm:px-6">
      <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_24px_80px_rgba(92,55,61,0.12)] sm:p-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#b76e79] via-[#e7c59d] to-[#416d64]" />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-rosegold-500">
              Divisha Makeovers
            </p>
            <h1 className="font-display text-3xl font-bold text-gray-950 sm:text-4xl">
              Book Appointment
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Choose your service category, select the package, and reserve your slot.
            </p>
          </div>
          <div className="rounded-2xl border border-rosegold-100 bg-softpink-50 px-4 py-3 text-sm text-gray-600">
            <span className="font-semibold text-rosegold-700">{activeCategory.label}</span>
            <span className="mx-2 text-rosegold-300">/</span>
            <span>{selectedItemCount} selected</span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { number: 1, label: 'Services' },
            { number: 2, label: 'Details' },
            { number: 3, label: 'Payment' },
          ].map((item) => (
            <div key={item.number} className="space-y-2">
              <div className={`h-1.5 rounded-full ${step >= item.number ? 'bg-rosegold-500' : 'bg-gray-200'}`} />
              <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${step >= item.number ? 'text-rosegold-700' : 'text-gray-400'}`}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {error && <Alert message={error} onClose={() => setError('')} />}

      {step === 1 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
          <div className="rounded-2xl border border-softpink-200 bg-white/90 p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
            <input
              placeholder="Search by package name..."
              className="input-field flex-1 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategory('');
              }}
              className="btn-secondary whitespace-nowrap"
            >
              Reset
            </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {BOOKING_CATEGORIES.map((item) => {
                const isActive = category === item.value;
                return (
                  <button
                    key={item.value || 'all'}
                    type="button"
                    onClick={() => setCategory(item.value)}
                    className={`min-h-[72px] rounded-2xl border px-3 py-3 text-left transition-all ${
                      isActive
                        ? 'border-rosegold-500 bg-[#2b151b] text-white shadow-[0_14px_35px_rgba(92,55,61,0.22)]'
                        : 'border-softpink-200 bg-white text-gray-700 hover:border-rosegold-300 hover:bg-softpink-50'
                    }`}
                  >
                    <span className={`mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                      isActive ? 'bg-white/15 text-white' : 'bg-rosegold-50 text-rosegold-700'
                    }`}>
                      {item.code}
                    </span>
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className={`mt-0.5 block text-[11px] ${isActive ? 'text-white/65' : 'text-gray-400'}`}>
                      {item.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-5">
            {serviceGroups.map(([groupName, services]) => {
              const meta = getCategoryMeta(groupName);

              return (
                <section key={groupName} className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-xl font-semibold text-gray-950">{meta.label}</p>
                      <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
                        {services.length} package{services.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${meta.accent}`}>
                      {meta.code}
                    </span>
                  </div>

                  <div className="grid gap-3">
                    {services.map((svc) => {
                      const isSelected = selectedIds.has(svc._id);
                      return (
                        <button
                          key={svc._id}
                          type="button"
                          onClick={() => dispatch(toggleService(svc))}
                          className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all sm:p-5 ${
                            isSelected
                              ? 'border-rosegold-500 bg-[#fff8f4] shadow-[0_16px_40px_rgba(183,110,121,0.16)] ring-2 ring-rosegold-200'
                              : 'border-softpink-200 bg-white hover:-translate-y-0.5 hover:border-rosegold-300 hover:shadow-[0_16px_40px_rgba(92,55,61,0.10)]'
                          }`}
                        >
                          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#e7c59d] via-[#b76e79] to-[#416d64]" />
                          <div className="flex gap-4">
                            <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${meta.accent}`}>
                              {meta.code}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <p className="break-words pr-1 text-base font-semibold leading-6 text-gray-950">
                                    {svc.name}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-500">
                                    {svc.category} <span className="mx-1 text-rosegold-300">/</span> {svc.duration} min
                                  </p>
                                </div>
                                <p className="shrink-0 text-lg font-bold text-rosegold-700">
                                  {formatCurrency(svc.price)}
                                </p>
                              </div>
                              <div className="mt-3 flex items-center gap-2 text-xs font-medium">
                                <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-rosegold-500' : 'bg-gray-200'}`} />
                                <span className={isSelected ? 'text-rosegold-700' : 'text-gray-400'}>
                                  {isSelected ? 'Selected for booking' : 'Tap to select'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="hidden">
            {list.map((svc) => {
              const isSelected = selected.some((s) => s._id === svc._id);
              return (
                <button
                  key={svc._id}
                  onClick={() => dispatch(toggleService(svc))}
                  className={`card w-full text-left transition-all ${isSelected ? 'ring-2 ring-rosegold-400 bg-rosegold-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{svc.name}</p>
                      <p className="text-xs text-gray-500">{svc.category} · {svc.duration} min</p>
                    </div>
                    <p className="font-semibold text-rosegold-600">{formatCurrency(svc.price)}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="card space-y-3">
            <p className="font-medium text-sm">Custom Service Request</p>
            <textarea
              className="input-field"
              rows="2"
              placeholder="Describe service not listed..."
              value={form.customServiceRequest}
              onChange={(e) => setForm({ ...form, customServiceRequest: e.target.value })}
            />
            {customServices.map((cs, i) => (
              <div key={i} className="grid grid-cols-[1fr_120px_90px_auto] gap-2 max-sm:grid-cols-1">
                <input placeholder="Service name" className="input-field" value={cs.name}
                  onChange={(e) => {
                    const updated = [...customServices];
                    updated[i].name = e.target.value;
                    setCustomServices(updated);
                  }} />
                <input type="number" placeholder="Price ₹" className="input-field" value={cs.price}
                  onChange={(e) => {
                    const updated = [...customServices];
                    updated[i].price = e.target.value;
                    setCustomServices(updated);
                  }} />
                <input type="number" aria-label={`Quantity for custom service ${i + 1}`} min="1" max="100" step="1" className="input-field" value={cs.quantity}
                  onChange={e => setCustomServices(customServices.map((item, index) => index === i ? { ...item, quantity: e.target.value } : item))} />
                <button
                  type="button"
                  onClick={() => removeCustomService(i)}
                  className="rounded-xl border border-red-200 px-3 text-sm text-red-600 transition-colors hover:bg-red-50 max-sm:py-2"
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addCustomService} className="text-sm text-rosegold-600">+ Add custom service with price</button>
          </div>

          </div>

          <aside className="h-fit rounded-2xl border border-white/70 bg-[#2b151b] p-5 text-white shadow-[0_24px_70px_rgba(43,21,27,0.20)] lg:sticky lg:top-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#e7c59d]">
              Booking Summary
            </p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-sm text-white/65">Selected services</p>
              <p className="mt-1 text-3xl font-bold">{selectedItemCount}</p>
              <p className="mt-3 font-display text-3xl text-[#f5d59e]">{formatCurrency(total)}</p>
            </div>

            <div className="mt-4 max-h-56 space-y-2 overflow-auto pr-1">
              {selected.length === 0 && completeCustomServices.length === 0 ? (
                <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/60">
                  No service selected yet.
                </p>
              ) : (
                <>
                  {selected.map((svc) => (
                    <div key={svc._id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-sm font-semibold leading-5">{svc.name}</p>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <label className="flex items-center gap-2 text-xs text-white/75">
                          Number of services
                          <input type="number" min="1" max="100" step="1" aria-label={`Quantity for ${svc.name}`} value={svc.quantity || 1}
                            onFocus={event => event.target.select()}
                            onChange={e => dispatch(setServiceQuantity({ id: svc._id, quantity: e.target.value }))}
                            className="w-16 rounded-lg border border-white/20 bg-white px-2 py-1.5 text-gray-900" />
                        </label>
                        <p className="text-xs text-white/70">{formatCurrency(svc.price)} × {svc.quantity || 1} = {formatCurrency(svc.price * (svc.quantity || 1))}</p>
                      </div>
                    </div>
                  ))}
                  {completeCustomServices.map((svc) => (
                    <div key={svc.name} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-sm font-semibold leading-5">{svc.name}</p>
                      <p className="mt-1 text-xs text-white/55">{formatCurrency(svc.price)} × {svc.quantity} = {formatCurrency(svc.price * svc.quantity)}</p>
                    </div>
                  ))}
                </>
              )}
            </div>

            {(selectedItemCount > 0 || form.customServiceRequest.trim()) && (
              <button
                type="button"
                onClick={() => {
                  dispatch(clearSelected());
                  setCustomServices([]);
                  setForm({ ...form, customServiceRequest: '' });
                }}
                className="mt-4 w-full rounded-xl border border-white/15 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10"
              >
                Clear selection
              </button>
            )}

            <button
              onClick={goToStepTwo}
              disabled={!hasBookingItems || hasPartialCustomService}
              className="mt-4 w-full rounded-xl bg-[#e7c59d] px-5 py-3 font-semibold text-[#2b151b] transition-colors hover:bg-[#f3d9ad] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </aside>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="label">Appointment Date *</label>
            <input type="date" required className="input-field" min={todayIso()}
              value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} />
          </div>
          <div>
            <label className="label">Appointment Time *</label>
            <select
              required
              className="input-field bg-white"
              value={form.appointmentTime}
              onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })}
            >
              <option value="">Select time</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {TIME_SLOTS.filter((_, index) => index % 2 === 0).map((slot) => {
                const isSelected = form.appointmentTime === slot.value;
                return (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => setForm({ ...form, appointmentTime: slot.value })}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-rosegold-500 bg-rosegold-500 text-white shadow-sm'
                        : 'border-softpink-200 bg-white text-gray-700 hover:border-rosegold-300 hover:bg-softpink-50'
                    }`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label">Venue / Location *</label>
            <input required className="input-field" placeholder="Event venue or address"
              value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input-field" rows="3" placeholder="Any special requirements..."
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
            <button
              onClick={goToPayment}
              className={`btn-primary flex-1 ${appointmentDetailsComplete ? '' : 'opacity-60'}`}
              aria-disabled={!appointmentDetailsComplete}
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="card bg-softpink-50 space-y-2">
            <div className="flex justify-between"><span>Total Amount</span><span className="font-bold">{formatCurrency(total)}</span></div>
            <div>
              <label className="label">Advance Amount (₹1 to {formatCurrency(total)})</label>
              <input type="number" min="0" max={total} className="input-field" value={form.advanceAmount}
                onChange={(e) => setForm({ ...form, advanceAmount: e.target.value })} />
            </div>
            <div className="flex justify-between text-sm"><span>Advance to Submit</span><span>{formatCurrency(advance)}</span></div>
            <div className="flex justify-between font-semibold text-rosegold-700"><span>Balance After Verification</span><span>{formatCurrency(remaining)}</span></div>
          </div>

          <div className="space-y-3">
            <label className={`card block cursor-pointer ${form.paymentOption === 'pay_now' ? 'ring-2 ring-rosegold-400' : ''}`}>
              <input type="radio" name="payment" value="pay_now" className="mr-2"
                checked={form.paymentOption === 'pay_now'}
                onChange={() => setForm({ ...form, paymentOption: 'pay_now' })} />
              <span className="font-medium">Pay Advance Now</span>
              <p className="text-xs font-medium text-amber-700 mt-1">Payment is not confirmed until the owner verifies it in the UPI or bank app.</p>
              <p className="text-xs text-gray-500 mt-1">Upload your payment screenshot for owner verification.</p>
            </label>
            <label className={`card block cursor-pointer ${form.paymentOption === 'pay_later' ? 'ring-2 ring-rosegold-400' : ''}`}>
              <input type="radio" name="payment" value="pay_later" className="mr-2"
                checked={form.paymentOption === 'pay_later'}
                onChange={() => setForm({ ...form, paymentOption: 'pay_later' })} />
              <span className="font-medium">Request Pay Later</span>
              <p className="text-xs text-gray-500 mt-1">Admin will approve your booking</p>
            </label>
          </div>

          {form.paymentOption === 'pay_now' && settings && (
            <div className="card space-y-3">
              <div className="flex flex-col items-center gap-3 text-center">
                {generatedQrCode || (paymentAmount > 0 && settings.qrCodeUrl && !qrImageFailed) ? (
                  <img
                    src={generatedQrCode || settings.qrCodeUrl}
                    alt="Payment QR"
                    className="w-48 rounded-lg border border-softpink-200 bg-white p-2 shadow-sm"
                    loading="lazy"
                    onError={() => setQrImageFailed(true)}
                  />
                ) : (
                  <div className="w-48 rounded-lg border border-dashed border-rosegold-300 bg-softpink-50 p-5 text-sm text-gray-600">
                    {settings.upiId ? 'Enter an advance amount within the booking total to generate the payment QR.' : 'Payment QR will appear after UPI details are configured.'}
                  </div>
                )}
                {generatedQrCode && (
                  <p className="text-[11px] text-gray-500">
                    QR generated from the UPI ID for this booking amount.
                  </p>
                )}
                <div className="w-full max-w-xs rounded-2xl border border-rosegold-200 bg-softpink-50 px-4 py-3">
                  <div className="flex items-center justify-between text-xs font-medium text-gray-600">
                    <span>Screenshot reminder</span>
                    <span className={paymentTimer === 0 ? 'text-red-500' : 'text-rosegold-700'}>
                      {paymentTimer === 0 ? 'Upload screenshot' : paymentTimerLabel}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        paymentTimer === 0 ? 'bg-red-400' : 'bg-rosegold-500'
                      }`}
                      style={{ width: `${paymentTimerProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500">Return here after paying to upload your screenshot. The timer does not cancel a payment.</p>
                </div>
              </div>
              {settings.upiId && <p className="text-center text-sm">UPI: <strong>{settings.upiId}</strong></p>}
              <UpiPaymentOptions settings={settings} amount={paymentAmount} qrCode={generatedQrCode} />
              <p className="text-xs text-gray-500 text-center">{settings.paymentInstructions}</p>
              <div>
                <label className="label">Upload Payment Screenshot</label>
                <input type="file" accept="image/*" className="input-field"
                  onChange={(e) => setScreenshot(e.target.files[0])} />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Submitting...' : form.paymentOption === 'pay_now' ? 'Submit for Verification' : 'Request Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
