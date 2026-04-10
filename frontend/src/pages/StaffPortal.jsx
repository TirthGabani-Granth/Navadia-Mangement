import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Bell, Clock, CheckSquare, Sparkles, Mic } from 'lucide-react';
import api from '../api';

export default function StaffPortal() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ unread_notifs: 0, pending_tasks: 0, checked_in: false, unread_vms: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [notifs, tasks, attend, vms] = await Promise.all([
          api.get(`/notifications/${user.id}`),
          api.get('/tasks'),
          api.get(`/attendance/${user.id}`),
          api.get(`/voicemail/${user.id}`)
        ]);

        const today = new Date().toISOString().split('T')[0];
        const todayAtt = attend.data.find(a => a.date === today);
        const checkedIn = todayAtt && !todayAtt.check_out;

        const myTasks = tasks.data.filter(t => t.assigned_to === user.id && t.status !== 'Done');
        const unreadN = notifs.data.filter(n => !n.is_read).length;
        const unreadV = vms.data.filter(v => !v.voicemail.is_listened).length;

        setStats({ 
          unread_notifs: unreadN, 
          pending_tasks: myTasks.length, 
          checked_in: !!checkedIn,
          unread_vms: unreadV
        });
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, [user.id]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-teal-200/50">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute right-20 bottom-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2"></div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-teal-200" />
            <span className="text-teal-100 text-sm font-medium">Team Member Portal</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-teal-100 max-w-sm leading-relaxed">Here's your overview for today. You look ready to make some smiles brighter!</p>
        </div>
      </div>

      {/* Quick Actions / Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => navigate('/portal/attendance')} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all text-left group">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stats.checked_in ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
            <Clock size={20} />
          </div>
          <p className="font-semibold text-slate-800">Attendance</p>
          <p className="text-xs text-slate-500 mt-1">{stats.checked_in ? 'Checked In' : 'Not Checked In'}</p>
        </button>

        <button onClick={() => navigate('/portal/tasks')} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all text-left group">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
            <CheckSquare size={20} />
          </div>
          <p className="font-semibold text-slate-800">My Tasks</p>
          <p className="text-xs text-slate-500 mt-1">{stats.pending_tasks} pending</p>
        </button>

        <button onClick={() => navigate('/portal/notifications')} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all text-left group relative">
          {stats.unread_notifs > 0 && (
            <span className="absolute top-4 right-4 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
            <Bell size={20} />
          </div>
          <p className="font-semibold text-slate-800">Alerts</p>
          <p className="text-xs text-slate-500 mt-1">{stats.unread_notifs} unread</p>
        </button>

        <button onClick={() => navigate('/portal/voicemail')} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all text-left group relative">
          {stats.unread_vms > 0 && (
            <span className="absolute top-4 right-4 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
          <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center mb-3">
            <Mic size={20} />
          </div>
          <p className="font-semibold text-slate-800">Voicemail</p>
          <p className="text-xs text-slate-500 mt-1">{stats.unread_vms} new</p>
        </button>
      </div>
    </div>
  );
}
