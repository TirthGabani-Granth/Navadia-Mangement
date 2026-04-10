import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CalendarOff, Send } from 'lucide-react';
import api from '../api';

export default function StaffLeave() {
  const { user } = useOutletContext();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ start_date: '', end_date: '', reason: '', leave_type: 'Casual' });

  const fetchLeave = async () => {
    try {
      const res = await api.get(`/leave/${user.id}`);
      setLeaves(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeave(); }, [user.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leave', { ...form, staff_id: user.id });
      setForm({ start_date: '', end_date: '', reason: '', leave_type: 'Casual' });
      await fetchLeave();
      alert('Leave request submitted!');
    } catch (e) {
      console.error(e);
      alert('Error submitting request');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Approved') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'Rejected') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leave Requests</h1>
          <p className="text-slate-500 mt-1">Apply for time off</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date *</label>
                <input required type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">End Date *</label>
                <input required type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Type *</label>
              <select value={form.leave_type} onChange={e => setForm({...form, leave_type: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                <option>Casual</option><option>Sick</option><option>Emergency</option><option>Personal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Reason *</label>
              <textarea required rows={3} value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Why do you need time off?" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none"></textarea>
            </div>
            <button type="submit" className="w-full flex justify-center items-center gap-2 py-3 bg-slate-800 text-white rounded-xl shadow-md hover:bg-slate-700 transition-colors font-semibold disabled:opacity-50">
              <Send size={16} /> Submit Request
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-fit">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">My Requests</h3>
        </div>
        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {loading && <div className="p-6 text-center text-slate-400">Loading...</div>}
          {leaves.map((l) => (
            <div key={l.id} className="p-5 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-slate-800">{l.leave_type} Leave</div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusColor(l.status)}`}>{l.status}</span>
              </div>
              <p className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded inline-block mb-3">{l.start_date} to {l.end_date}</p>
              <p className="text-sm text-slate-600 line-clamp-2">{l.reason}</p>
              {l.admin_note && <div className="mt-3 p-2 bg-sky-50 border-l-2 border-sky-500 text-xs text-slate-700"><span className="font-bold">Admin Note:</span> {l.admin_note}</div>}
            </div>
          ))}
          {!loading && !leaves.length && <div className="p-8 text-center text-slate-400">No past requests.</div>}
        </div>
      </div>
    </div>
  );
}
