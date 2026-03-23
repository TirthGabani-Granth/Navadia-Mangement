import React, { useState, useEffect } from 'react';
import api from '../api';
import { Bell, BellOff, Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReminders = async () => {
    try { const res = await api.get('/reminders'); setReminders(res.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const dismiss = async (id) => {
    try { await api.post(`/reminders/${id}/dismiss`); fetchReminders(); }
    catch (e) { console.error(e); }
  };

  useEffect(() => { fetchReminders(); }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-7 w-7 border-2 border-sky-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-700">Reminders</h1>
          <p className="text-sm text-slate-400 mt-0.5">Automated follow-up reminders.</p>
        </div>
        <span className="text-xs font-medium text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100 flex items-center gap-1">
          <Bell size={13} /> {reminders.length} Pending
        </span>
      </div>

      {reminders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-10 text-center">
          <BellOff size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-500">All clear! No pending reminders.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((rem) => (
            <div key={rem.id} className={`bg-white rounded-xl border p-4 flex items-start justify-between gap-3 ${rem.overdue ? 'border-red-200' : 'border-slate-100'}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${rem.overdue ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                  {rem.overdue ? <AlertTriangle size={16} /> : <Clock size={16} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-slate-700">{rem.patient_name}</p>
                    {rem.overdue && <span className="text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Overdue</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{rem.reminder_type}</p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar size={10} /> {new Date(rem.reminder_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </p>
                </div>
              </div>
              <button onClick={() => dismiss(rem.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100">
                <CheckCircle2 size={13} /> Done
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
