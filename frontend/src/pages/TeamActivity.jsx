import React, { useState, useEffect } from 'react';
import { Activity, UserPlus, CheckCircle2, RefreshCw, Trash2, Edit, Clock, Users } from 'lucide-react';
import api from '../api';

const ACTION_META = {
  member_added: { icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  member_updated: { icon: Edit, color: 'text-sky-500', bg: 'bg-sky-50' },
  member_deactivated: { icon: Trash2, color: 'text-red-400', bg: 'bg-red-50' },
  task_created: { icon: CheckCircle2, color: 'text-sky-500', bg: 'bg-sky-50' },
  task_updated: { icon: RefreshCw, color: 'text-amber-500', bg: 'bg-amber-50' },
  task_deleted: { icon: Trash2, color: 'text-red-400', bg: 'bg-red-50' },
};

function timeAgo(d) {
  const diff = Math.floor((new Date() - new Date(d)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function TeamActivity() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/activity'), api.get('/team/stats')])
      .then(([l, s]) => { setLogs(l.data); setStats(s.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-7 w-7 border-2 border-sky-500 border-t-transparent"></div></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-700">Team Activity</h1>
        <p className="text-sm text-slate-400 mt-0.5">Track what's happening across your team.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Members', val: stats.total_members, icon: Users, bg: 'bg-sky-50', color: 'text-sky-600' },
            { label: 'Tasks', val: stats.total_tasks, icon: CheckCircle2, bg: 'bg-sky-50', color: 'text-sky-600' },
            { label: 'Done', val: stats.tasks_done, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
            { label: 'Overdue', val: stats.overdue_tasks, icon: Clock, bg: 'bg-red-50', color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`p-1.5 rounded-lg ${s.bg}`}><s.icon size={13} className={s.color} /></div>
                <span className="text-[10px] text-slate-400">{s.label}</span>
              </div>
              <p className="text-lg font-bold text-slate-700">{s.val}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-1.5">
          <Activity size={14} className="text-sky-500" />
          <h2 className="text-sm font-semibold text-slate-600">Recent Activity</h2>
          <span className="text-[10px] text-slate-400 ml-auto">{logs.length} events</span>
        </div>

        {logs.length === 0 ? (
          <div className="p-10 text-center"><Activity size={28} className="mx-auto text-slate-200 mb-2" /><p className="text-sm text-slate-400">No activity yet</p></div>
        ) : (
          <div className="divide-y divide-slate-50">
            {logs.map(log => {
              const meta = ACTION_META[log.action] || { icon: Activity, color: 'text-slate-400', bg: 'bg-slate-50' };
              const Icon = meta.icon;
              return (
                <div key={log.id} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className={`p-1.5 rounded-lg ${meta.bg} flex-shrink-0 mt-0.5`}><Icon size={13} className={meta.color} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold flex-shrink-0" style={{ backgroundColor: log.staff_color }}>{log.staff_name.charAt(0)}</span>
                      <span className="text-xs font-medium text-slate-600">{log.staff_name}</span>
                      <span className="text-[10px] text-slate-400">{timeAgo(log.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-500">{log.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
