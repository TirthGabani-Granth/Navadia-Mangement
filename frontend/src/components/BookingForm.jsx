import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, AlertCircle, Stethoscope } from 'lucide-react';
import api from '../api';

const TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

export default function BookingForm({ onSuccess }) {
  const [form, setForm] = useState({
    patient_name: '', phone: '', treatment_type: 'Dental Checkup',
    date: new Date().toISOString().split('T')[0], time: '10:00', emergency: false
  });
  const [catalog, setCatalog] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get('/treatments/catalog').then(r => setCatalog(r.data)).catch(console.error); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/appointments', {
        patient_name: form.patient_name, phone: form.phone, treatment_type: form.treatment_type,
        preferred_time: new Date(`${form.date}T${form.time}:00`).toISOString()
      });
      onSuccess();
      setForm({ ...form, patient_name: '', phone: '', emergency: false });
    } catch (e) { alert(e.response?.data?.detail || "Booking failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-teal-500 to-cyan-500">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar size={20} /> New Appointment
        </h2>
        <p className="text-teal-100 text-sm mt-1">Schedule a visit for a patient</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Patient Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Patient Name</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                value={form.patient_name}
                onChange={e => setForm({ ...form, patient_name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                placeholder="Full name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </div>

        {/* Treatment */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
            <Stethoscope size={16} className="text-teal-500" /> Treatment Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.keys(catalog).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, treatment_type: t })}
                className={`px-4 py-3 rounded-xl border-2 text-left transition-all ${
                  form.treatment_type === t
                    ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50 text-teal-700 shadow-md'
                    : 'border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-medium text-sm">{t}</div>
                <div className="text-xs text-slate-400 mt-1">{catalog[t].duration} min • ₹{catalog[t].price}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-teal-500" /> Date
            </label>
            <input
              required
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Emergency?</label>
            <label className="flex items-center gap-3 h-[50px] cursor-pointer">
              <input
                type="checkbox"
                checked={form.emergency}
                onChange={e => setForm({ ...form, emergency: e.target.checked })}
                className="w-5 h-5 text-red-500 rounded border-slate-300 cursor-pointer"
              />
              <span className="text-sm text-slate-600 flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500" /> Mark as Emergency Case
              </span>
            </label>
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-teal-500" /> Preferred Time
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {TIMES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, time: t })}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                  form.time === t
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-200'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">
            * If this slot is unavailable, the system will automatically assign the next available time
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-200 hover:shadow-xl hover:shadow-teal-300 transition-all disabled:opacity-60"
          >
            {loading ? "Booking..." : "Confirm Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
}
