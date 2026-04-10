import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Clock, CheckCircle2, History } from 'lucide-react';
import api from '../api';

export default function StaffAttendance() {
  const { user } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);

  const fetchAttendance = async () => {
    try {
      const res = await api.get(`/attendance/${user.id}`);
      setAttendance(res.data);
      const today = new Date().toISOString().split('T')[0];
      const todayData = res.data.find(a => a.date === today);
      setTodayRecord(todayData || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, [user.id]);

  const handleAction = async (action) => {
    setLoading(true);
    try {
      if (action === 'in') {
        await api.post('/attendance/checkin', { staff_id: user.id });
      } else {
        await api.post('/attendance/checkout', { staff_id: user.id });
      }
      await fetchAttendance();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && !attendance.length) return <div className="flex justify-center p-10"><div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
        <p className="text-slate-500 mt-1">Mark your daily check-in and check-out</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
          <Clock size={32} className={todayRecord?.check_in && !todayRecord?.check_out ? 'text-teal-500' : 'text-slate-400'} />
        </div>
        
        <h2 className="text-xl font-bold text-slate-800 mb-6">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h2>

        {!todayRecord ? (
          <button onClick={() => handleAction('in')} disabled={loading} className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-2xl shadow-lg shadow-teal-200 hover:shadow-xl hover:shadow-teal-300 transition-all text-lg mb-4">
            Check In Now
          </button>
        ) : !todayRecord.check_out ? (
          <div className="space-y-4">
            <p className="text-emerald-600 font-medium flex items-center justify-center gap-2">
              <CheckCircle2 size={18} /> Checked in at {formatTime(todayRecord.check_in)}
            </p>
            <button onClick={() => handleAction('out')} disabled={loading} className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300 transition-all text-lg mb-4">
              Check Out
            </button>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 rounded-2xl inline-block w-full sm:w-auto">
            <p className="font-semibold text-slate-700 mb-2">Shift Completed</p>
            <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
              <div><span className="block text-xs uppercase tracking-wider mb-1">In</span><span className="font-medium text-slate-800">{formatTime(todayRecord.check_in)}</span></div>
              <div><span className="block text-xs uppercase tracking-wider mb-1">Out</span><span className="font-medium text-slate-800">{formatTime(todayRecord.check_out)}</span></div>
            </div>
            <p className="mt-4 text-xs font-medium text-teal-600 bg-teal-50 py-1 px-3 rounded-full inline-block">Total: {todayRecord.hours_worked} hours</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <History className="text-slate-400" size={20} />
          <h3 className="font-bold text-slate-800">Recent History</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {attendance.map(record => (
            <div key={record.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-semibold text-slate-800">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</p>
                <p className="text-xs text-slate-500">{record.status}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-slate-600"><span className="text-slate-400 text-xs mr-2">IN</span>{formatTime(record.check_in)}</p>
                <p className="text-slate-600"><span className="text-slate-400 text-xs mr-2">OUT</span>{formatTime(record.check_out)}</p>
              </div>
            </div>
          ))}
          {!attendance.length && <div className="p-8 text-center text-slate-500">No attendance records found.</div>}
        </div>
      </div>
    </div>
  );
}
