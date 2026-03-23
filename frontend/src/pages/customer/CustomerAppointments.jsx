import React, { useState } from 'react';
import api from '../../api';
import { Search, Phone, Calendar, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';

const STATUS_STYLES = {
  Scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: <Clock size={14} /> },
  Completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: <CheckCircle size={14} /> },
  Cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: <XCircle size={14} /> },
};

export default function CustomerAppointments() {
  const [phone, setPhone] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    try {
      const res = await api.get('/appointments');
      const allAppts = res.data;
      // Get all patients to match phone
      const patientsRes = await api.get('/patients');
      const matchedPatient = patientsRes.data.find(p => p.phone === phone.trim());
      if (matchedPatient) {
        const myAppts = allAppts.filter(a => a.patient_id === matchedPatient.id);
        setAppointments(myAppts);
      } else {
        setAppointments([]);
      }
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">My Appointments</h1>
        <p className="text-slate-500 mt-1 text-sm">Enter your phone number to view your appointment history.</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Enter your phone number..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-2xl transition-colors disabled:opacity-70 text-sm"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? 'Looking...' : 'Search'}
        </button>
      </form>

      {/* Results */}
      {searched && (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-14 bg-white rounded-2xl border border-slate-200">
              <Calendar size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No appointments found for this number.</p>
              <p className="text-slate-400 text-sm mt-1">Try booking a new appointment!</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 font-medium">{appointments.length} appointment(s) found</p>
              {appointments
                .sort((a, b) => new Date(b.appointment_time) - new Date(a.appointment_time))
                .map(appt => {
                  const style = STATUS_STYLES[appt.status] || STATUS_STYLES['Scheduled'];
                  const dt = new Date(appt.appointment_time);
                  return (
                    <div key={appt.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start justify-between gap-4 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex flex-col items-center justify-center text-teal-700 flex-shrink-0">
                          <span className="text-xs font-bold">{dt.toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                          <span className="text-xl font-extrabold leading-none">{dt.getDate()}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">{appt.treatment_type}</h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {dt.toLocaleString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                        {style.icon} {appt.status}
                      </span>
                    </div>
                  );
                })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
