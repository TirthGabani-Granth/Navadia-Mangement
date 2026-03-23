import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Calendar, Tag, Trash2, ChevronDown, CheckCircle2, Circle, Loader, AlertTriangle, GripVertical } from 'lucide-react';
import api from '../api';

const STATUSES = ['To Do', 'In Progress', 'Done'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const CATEGORIES = ['General', 'Patient Care', 'Equipment', 'Admin', 'Cleaning'];

const PRIORITY_STYLES = {
  Low: { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400' },
  Medium: { bg: 'bg-sky-50', text: 'text-sky-600', dot: 'bg-sky-500' },
  High: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  Urgent: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
};

const COL_COLORS = {
  'To Do': { header: 'bg-slate-50 text-slate-600', count: 'bg-slate-200 text-slate-600' },
  'In Progress': { header: 'bg-amber-50 text-amber-600', count: 'bg-amber-200 text-amber-700' },
  'Done': { header: 'bg-emerald-50 text-emerald-600', count: 'bg-emerald-200 text-emerald-700' },
};

const COL_ICONS = { 'To Do': Circle, 'In Progress': Loader, 'Done': CheckCircle2 };
const INPUT = "w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none text-sm transition-all";

export default function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('All');
  const [form, setForm] = useState({ title: '', description: '', assigned_to: '', priority: 'Medium', category: 'General', due_date: '' });

  const fetchAll = async () => {
    try {
      const [t, s, st] = await Promise.all([api.get('/tasks'), api.get('/staff'), api.get('/team/stats')]);
      setTasks(t.data); setStaff(s.data.filter(x => x.status === 'Active')); setStats(st.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...form, assigned_to: form.assigned_to ? parseInt(form.assigned_to) : null, due_date: form.due_date ? new Date(form.due_date).toISOString() : null });
      setShowModal(false); setForm({ title: '', description: '', assigned_to: '', priority: 'Medium', category: 'General', due_date: '' }); fetchAll();
    } catch (e) { console.error(e); }
  };

  const handleStatus = async (id, s) => { try { await api.put(`/tasks/${id}`, { status: s }); fetchAll(); } catch (e) { console.error(e); } };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/tasks/${id}`); fetchAll(); } catch (e) { console.error(e); } };

  const filtered = useMemo(() => tasks.filter(t => (filterPriority === 'All' || t.priority === filterPriority) && (filterAssignee === 'All' || String(t.assigned_to) === filterAssignee)), [tasks, filterPriority, filterAssignee]);
  const columns = useMemo(() => STATUSES.map(s => ({ status: s, tasks: filtered.filter(t => t.status === s) })), [filtered]);

  const isOverdue = (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Done';
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null;

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-7 w-7 border-2 border-sky-500 border-t-transparent"></div></div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-700">Task Board</h1>
          <p className="text-sm text-slate-400 mt-0.5">Organize your team's work.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-lg transition-all">
          <Plus size={15} /> New Task
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'To Do', val: stats.tasks_todo, color: 'text-slate-700' },
            { label: 'In Progress', val: stats.tasks_in_progress, color: 'text-amber-600' },
            { label: 'Done', val: stats.tasks_done, color: 'text-emerald-600' },
            { label: 'Overdue', val: stats.overdue_tasks, color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-3.5 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-[10px] text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-5">
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-sky-400 outline-none">
          <option value="All">All Priorities</option>
          {PRIORITIES.map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-sky-400 outline-none">
          <option value="All">All Assignees</option>
          {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {columns.map(col => {
          const Icon = COL_ICONS[col.status]; const colors = COL_COLORS[col.status];
          return (
            <div key={col.status} className="flex flex-col">
              <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-t-xl text-xs font-semibold ${colors.header}`}>
                <span className="flex items-center gap-1.5"><Icon size={13} /> {col.status}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors.count}`}>{col.tasks.length}</span>
              </div>
              <div className="bg-slate-50/50 border border-t-0 border-slate-100 rounded-b-xl p-2.5 space-y-2.5 min-h-[160px] flex-1">
                {col.tasks.map(task => {
                  const ps = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;
                  const od = isOverdue(task);
                  return (
                    <div key={task.id} className={`bg-white rounded-lg border p-3 hover:shadow-sm transition-all ${od ? 'border-red-200' : 'border-slate-100'}`}>
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <h4 className="text-xs font-medium text-slate-700 leading-snug flex-1">{task.title}</h4>
                        <button onClick={() => handleDelete(task.id)} className="text-slate-300 hover:text-red-400 flex-shrink-0"><Trash2 size={12} /></button>
                      </div>
                      {task.description && <p className="text-[10px] text-slate-400 mb-2 line-clamp-2">{task.description}</p>}
                      <div className="flex flex-wrap gap-1 mb-2">
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${ps.bg} ${ps.text}`}>{task.priority}</span>
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-50 text-slate-500">{task.category}</span>
                        {od && <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-red-50 text-red-500">Overdue</span>}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <div className="flex items-center gap-2">
                          {task.assigned_to_name && <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] text-white font-bold" style={{ backgroundColor: task.assigned_to_color || '#94a3b8' }}>{task.assigned_to_name.charAt(0)}</span>{task.assigned_to_name.split(' ')[0]}</span>}
                          {task.due_date && <span className={`flex items-center gap-0.5 ${od ? 'text-red-500' : ''}`}><Calendar size={9} /> {fmtDate(task.due_date)}</span>}
                        </div>
                      </div>
                      {col.status !== 'Done' && (
                        <div className="mt-2 pt-2 border-t border-slate-50 flex gap-1.5">
                          {STATUSES.filter(s => s !== col.status).map(s => (
                            <button key={s} onClick={() => handleStatus(task.id, s)} className="text-[10px] font-medium text-sky-600 hover:bg-sky-50 px-1.5 py-0.5 rounded transition-all">
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {col.tasks.length === 0 && <div className="flex flex-col items-center justify-center py-8 text-slate-300"><GripVertical size={18} /><p className="text-[10px] mt-1">Empty</p></div>}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-700">New Task</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-slate-100 text-slate-400"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-3">
              <div><label className="block text-xs font-medium text-slate-500 mb-1">Title *</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={INPUT} /></div>
              <div><label className="block text-xs font-medium text-slate-500 mb-1">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={`${INPUT} resize-none`} rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-500 mb-1">Assign To</label><select value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} className={INPUT}><option value="">Unassigned</option>{staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div><label className="block text-xs font-medium text-slate-500 mb-1">Priority</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={INPUT}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-500 mb-1">Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={INPUT}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label className="block text-xs font-medium text-slate-500 mb-1">Due Date</label><input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className={INPUT} /></div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white rounded-lg">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
