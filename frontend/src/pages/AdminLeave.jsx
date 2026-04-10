import React, { useState, useEffect } from 'react';
import { CalendarOff, Check, X } from 'lucide-react';
import api from '../api';

export default function AdminLeave() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get('/leave/all');
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id, status) => {
    try {
      const note = prompt(`Any note for this ${status}? (Optional)`);
      if (note === null) return; // User cancelled prompt
      await api.put(`/leave/${id}`, { status, admin_note: note });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Leave Requests</h1>
        <p className="text-slate-500 mt-1">Review and manage team time-off requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading && <p>Loading...</p>}
        {data.map(({ leave, staff }) => (
          <div key={leave.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">{staff?.name?.charAt(0)}</div>
                <div>
                  <h4 className="font-bold text-slate-800 leading-tight">{staff?.name}</h4>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{leave.leave_type}</p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded font-bold ${
                leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                leave.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700 animate-pulse'
              }`}>{leave.status}</span>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-xl mb-3 text-sm">
              <p className="font-semibold text-slate-700 mb-1">{new Date(leave.start_date).toLocaleDateString()} &rarr; {new Date(leave.end_date).toLocaleDateString()}</p>
              <p className="text-slate-600 text-xs line-clamp-3">"{leave.reason}"</p>
            </div>

            <div className="mt-auto flex gap-2 pt-2 border-t border-slate-100">
              {leave.status === 'Pending' && (
                <>
                  <button onClick={() => handleAction(leave.id, 'Approved')} className="flex-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white font-semibold flex items-center justify-center gap-2 py-2 rounded-xl transition-colors text-sm">
                    <Check size={16} /> Approve
                  </button>
                  <button onClick={() => handleAction(leave.id, 'Rejected')} className="flex-1 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white font-semibold flex items-center justify-center gap-2 py-2 rounded-xl transition-colors text-sm">
                    <X size={16} /> Reject
                  </button>
                </>
              )}
              {leave.status !== 'Pending' && leave.admin_note && (
                <p className="text-xs text-slate-500 w-full"><span className="font-semibold">Note:</span> {leave.admin_note}</p>
              )}
            </div>
          </div>
        ))}
        {!loading && !data.length && <div className="col-span-full p-10 text-center text-slate-400 font-medium">No leave requests found.</div>}
      </div>
    </div>
  );
}
