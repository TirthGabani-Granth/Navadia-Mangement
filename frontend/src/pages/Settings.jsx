import React, { useState } from 'react';
import { Save, Building2, User, MapPin, Phone, Clock, Check } from 'lucide-react';
import api from '../api';

export default function Settings() {
  const [settings, setSettings] = useState({
    clinicName: 'Navadiya Dental Clinic',
    doctorName: 'Dr. Jatin Navadiya',
    phone: '+91 98765 43210',
    address: 'Navadiya Dental Clinic, Gujarat, India',
    openTime: '09:00',
    closeTime: '18:00',
    slotDuration: 30,
    currency: '₹',
    remindersEnabled: true,
    reminderChannel: 'WhatsApp',
  });
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    api.get('/settings/automation')
      .then((res) => {
        setSettings((prev) => ({
          ...prev,
          remindersEnabled: res.data.reminders_enabled,
          reminderChannel: res.data.reminder_channel,
        }));
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      await api.put('/settings/automation', {
        reminders_enabled: settings.remindersEnabled,
        reminder_channel: settings.reminderChannel,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert('Failed to save automation settings');
    }
  };

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 mt-1">Configure your clinic profile and preferences</p>
      </div>

      {/* Clinic Info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-500 to-cyan-500">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Building2 size={18} /> Clinic Information
          </h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Clinic Name</label>
              <input
                value={settings.clinicName}
                onChange={e => set('clinicName', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Doctor Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={settings.doctorName}
                  onChange={e => set('doctorName', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={settings.phone}
                  onChange={e => set('phone', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
              <input
                value={settings.currency}
                onChange={e => set('currency', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-4 text-slate-400" />
                <textarea
                  value={settings.address}
                  onChange={e => set('address', e.target.value)}
                  rows={2}
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-500 to-cyan-500">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Clock size={18} /> Working Hours & Scheduling
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Opening Time</label>
              <input
                type="time"
                value={settings.openTime}
                onChange={e => set('openTime', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Closing Time</label>
              <input
                type="time"
                value={settings.closeTime}
                onChange={e => set('closeTime', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Slot Duration (min)</label>
              <input
                type="number"
                value={settings.slotDuration}
                onChange={e => set('slotDuration', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
                min={10}
                max={120}
                step={5}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-500 to-indigo-500">
          <h2 className="font-semibold text-white">Smart Reminders</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-xl border border-slate-200 px-4 py-3">
            <label className="text-sm font-medium text-slate-700">Enable Smart Appointment Reminders</label>
            <p className="text-xs text-slate-500 mt-1">24 hours and 2 hours before appointments.</p>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => set('remindersEnabled', !settings.remindersEnabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  settings.remindersEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {settings.remindersEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Reminder Channel</label>
            <select
              value={settings.reminderChannel}
              onChange={(e) => set('reminderChannel', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
            >
              <option value="WhatsApp">WhatsApp</option>
              <option value="SMS">SMS</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl shadow-lg transition-all ${
            saved
              ? 'bg-emerald-500 text-white shadow-emerald-200'
              : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-teal-200 hover:shadow-xl hover:shadow-teal-300'
          }`}
        >
          {saved ? <Check size={18} /> : <Save size={18} />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
