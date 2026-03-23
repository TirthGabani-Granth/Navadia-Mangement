import React, { useState, useEffect } from 'react';
import { UserPlus, Search, X, Phone, Mail, Briefcase, Users, UserCheck, UserX, Trash2, Edit3, GraduationCap } from 'lucide-react';
import api from '../api';

const ROLES = ['Dentist', 'Dental Hygienist', 'Dental Assistant', 'Receptionist', 'Office Manager'];

const SPECIALIZATIONS = [
  'General Dentistry',
  'Orthodontics (Braces)',
  'Endodontics (Root Canal)',
  'Periodontics (Gum Treatment)',
  'Prosthodontics (Crowns/Dentures)',
  'Pediatric Dentistry',
  'Oral Surgery',
  'Cosmetic Dentistry',
  'Implantology',
  'Teeth Whitening',
  'Dental X-Ray',
  'Sterilization & Hygiene',
  'Patient Coordination',
  'Billing & Insurance',
  'Front Desk',
];

const COLORS = ['#14b8a6', '#0ea5e9', '#8b5cf6', '#f43f5e', '#f59e0b', '#06b6d4', '#6366f1', '#ec4899', '#22c55e'];

const STATUS_STYLE = {
  Active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'On Leave': 'bg-amber-50 text-amber-600 border-amber-100',
  Inactive: 'bg-slate-100 text-slate-400 border-slate-200',
};

export default function TeamMembers() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState({
    name: '', role: 'Dentist', email: '', phone: '', specialization: '', avatar_color: COLORS[0]
  });

  const fetchStaff = async () => {
    try { const res = await api.get('/staff'); setStaff(res.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStaff(); }, []);

  const resetForm = () => {
    setForm({ name: '', role: 'Dentist', email: '', phone: '', specialization: '', avatar_color: COLORS[Math.floor(Math.random() * COLORS.length)] });
    setEditingMember(null);
  };

  const openAdd = () => { resetForm(); setShowModal(true); };
  const openEdit = (m) => {
    setEditingMember(m);
    setForm({ name: m.name, role: m.role, email: m.email || '', phone: m.phone || '', specialization: m.specialization || '', avatar_color: m.avatar_color });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await api.put(`/staff/${editingMember.id}`, form);
      } else {
        await api.post('/staff', form);
      }
      setShowModal(false);
      resetForm();
      fetchStaff();
    } catch (e) { console.error(e); alert('Failed to save.'); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/staff/${id}`);
      fetchStaff();
    } catch (e) { console.error(e); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/staff/${id}`, { status: newStatus });
      fetchStaff();
    } catch (e) { console.error(e); }
  };

  const filtered = staff.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || (s.email || '').toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filterRole === 'All' || s.role === filterRole);
  });

  const activeCount = staff.filter(s => s.status === 'Active').length;
  const onLeaveCount = staff.filter(s => s.status === 'On Leave').length;

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Team Members</h1>
          <p className="text-slate-500 mt-1">Manage your clinic staff and their roles</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-200 hover:shadow-xl hover:shadow-teal-300 transition-all">
          <UserPlus size={18} /> Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-200">
            <Users size={22} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{staff.length}</p>
            <p className="text-sm text-slate-500">Total Members</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <UserCheck size={22} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{activeCount}</p>
            <p className="text-sm text-slate-500">Active</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <UserX size={22} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{onLeaveCount}</p>
            <p className="text-sm text-slate-500">On Leave</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
        >
          <option value="All">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Team Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <Users size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">No team members found</p>
          <p className="text-slate-400 text-sm mt-1">Add your first team member to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(member => (
            <div key={member.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md" style={{ backgroundColor: member.avatar_color }}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{member.name}</h3>
                    <p className="text-xs text-slate-500">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(member)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-600 transition-colors">
                    <Edit3 size={15} />
                  </button>
                  <button onClick={() => handleDelete(member.id, member.name)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {member.specialization && (
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <GraduationCap size={14} className="text-teal-500" />
                  <span>{member.specialization}</span>
                </div>
              )}

              <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                {member.email && <div className="flex items-center gap-2"><Mail size={13} /> {member.email}</div>}
                {member.phone && <div className="flex items-center gap-2"><Phone size={13} /> {member.phone}</div>}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <select
                  value={member.status}
                  onChange={e => handleStatusChange(member.id, e.target.value)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border cursor-pointer outline-none ${STATUS_STYLE[member.status]}`}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <span className="text-xs text-slate-400">{member.active_tasks} active tasks</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editingMember ? 'Edit Team Member' : 'Add Team Member'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                  placeholder="Dr. Priya Sharma"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role *</label>
                  <select
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm cursor-pointer"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Specialization</label>
                  <select
                    value={form.specialization}
                    onChange={e => setForm({ ...form, specialization: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm cursor-pointer"
                  >
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                    placeholder="email@clinic.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Avatar Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, avatar_color: c })}
                      className={`w-9 h-9 rounded-full transition-all ${form.avatar_color === c ? 'ring-2 ring-offset-2 ring-teal-500 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl shadow-md shadow-teal-200 hover:shadow-lg hover:shadow-teal-300 transition-all">
                  {editingMember ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
