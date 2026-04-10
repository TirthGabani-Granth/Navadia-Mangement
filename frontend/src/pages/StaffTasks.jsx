import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Check, Clock, Calendar } from 'lucide-react';
import api from '../api';

export default function StaffTasks() {
  const { user } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.filter(t => t.assigned_to === user.id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [user.id]);

  const updateStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      await fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const pendingTasks = tasks.filter(t => t.status !== 'Done');
  const doneTasks = tasks.filter(t => t.status === 'Done');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Tasks</h1>
        <p className="text-slate-500 mt-1">Review and complete your daily assignments</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Clock size={18} className="text-amber-500" /> Pending ({pendingTasks.length})</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {pendingTasks.map((t) => (
            <div key={t.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-slate-50 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-800">{t.title}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{t.priority}</span>
                </div>
                {t.description && <p className="text-sm text-slate-500 mb-2">{t.description}</p>}
                {t.due_date && <p className="text-xs text-amber-600 flex items-center gap-1"><Calendar size={12} /> Due {new Date(t.due_date).toLocaleDateString()}</p>}
              </div>
              <div className="flex items-center gap-2">
                {t.status === 'To Do' && (
                  <button onClick={() => updateStatus(t.id, 'In Progress')} className="px-4 py-2 bg-sky-50 text-sky-600 hover:bg-sky-100 font-semibold text-sm rounded-xl transition-colors">Start Work</button>
                )}
                <button onClick={() => updateStatus(t.id, 'Done')} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-emerald-200">
                  <Check size={16} /> Mark Done
                </button>
              </div>
            </div>
          ))}
          {!pendingTasks.length && <div className="p-8 text-center text-slate-400">You have no pending tasks! Good job!</div>}
        </div>
      </div>

      {doneTasks.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden opacity-75 grayscale hover:grayscale-0 transition-all hover:opacity-100">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Check size={18} className="text-emerald-500" /> Completed Recently</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {doneTasks.slice(0, 5).map((t) => (
              <div key={t.id} className="p-5 flex items-center justify-between gap-4">
                <div className="line-through text-slate-400">{t.title}</div>
                <button onClick={() => updateStatus(t.id, 'To Do')} className="text-xs font-semibold text-sky-500 hover:text-sky-600 px-3 py-1 bg-sky-50 rounded-lg">Undo</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
