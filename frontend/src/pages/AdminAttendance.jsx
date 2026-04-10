import React, { useState, useEffect } from 'react';
import { Clock, Users } from 'lucide-react';
import api from '../api';

export default function AdminAttendance() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/today')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' }) : '--';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Today's Attendance</h1>
          <p className="text-slate-500 mt-1">{new Date().toDateString()}</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
          <Users className="text-teal-500" size={20} />
          <span className="font-bold text-slate-800">{data.length} Present</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Staff Member</th>
              <th className="px-6 py-4">Check-In</th>
              <th className="px-6 py-4">Check-Out</th>
              <th className="px-6 py-4">Hours</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {data.map(({ attendance: att, staff }) => (
              <tr key={att.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">{staff?.name?.charAt(0) || '?'}</div>
                    <span className="font-semibold text-slate-800">{staff?.name || 'Unknown'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-600">{formatTime(att.check_in)}</td>
                <td className="px-6 py-4 font-medium text-slate-600">{formatTime(att.check_out)}</td>
                <td className="px-6 py-4 text-emerald-600 font-bold">{att.hours_worked || '--'}</td>
                <td className="px-6 py-4">
                  {att.check_out ? (
                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold">Shift Ended</span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-bold animate-pulse">Active</span>
                  )}
                </td>
              </tr>
            ))}
            {!loading && !data.length && (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">No staff checked in today.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
