import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Bell, Check, Info, CalendarOff, CheckSquare, Mic } from 'lucide-react';
import api from '../api';

const ICONS = {
  general: Info,
  leave: CalendarOff,
  task: CheckSquare,
  voicemail: Mic,
};

const COLORS = {
  general: 'bg-blue-100 text-blue-600',
  leave: 'bg-amber-100 text-amber-600',
  task: 'bg-emerald-100 text-emerald-600',
  voicemail: 'bg-purple-100 text-purple-600',
};

export default function StaffNotifications() {
  const { user } = useOutletContext();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await api.get(`/notifications/${user.id}`);
      setNotifs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifs(); }, [user.id]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      await fetchNotifs();
    } catch (e) {}
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Alerts & Notifications</h1>
        <p className="text-slate-500 mt-1">Updates regarding your tasks and schedule</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading && <div className="p-10 text-center text-slate-400">Loading...</div>}
        <div className="divide-y divide-slate-100">
          {notifs.map(n => {
            const Icon = ICONS[n.notification_type] || Info;
            const colorClass = COLORS[n.notification_type] || COLORS.general;
            return (
              <div key={n.id} className={`p-4 sm:p-5 flex gap-4 ${n.is_read ? 'opacity-60 bg-white' : 'bg-slate-50/50'}`}>
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${colorClass}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`font-bold text-sm truncate ${n.is_read ? 'text-slate-600' : 'text-slate-800'}`}>{n.title}</h4>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{n.message}</p>
                </div>
                {!n.is_read && (
                  <button onClick={() => markRead(n.id)} className="self-center p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-emerald-500 transition-colors" title="Mark as read">
                    <Check size={18} />
                  </button>
                )}
              </div>
            );
          })}
          {!loading && !notifs.length && (
            <div className="p-16 text-center">
              <Bell className="mx-auto text-slate-300 mb-4" size={40} />
              <p className="text-slate-500 font-medium">All caught up!</p>
              <p className="text-slate-400 text-sm">No new notifications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
