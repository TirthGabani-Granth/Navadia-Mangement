import React, { useState } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';
import api from '../api';

export default function DoctorNotesModal({ appointment, patientName, onClose, onSaved }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!note.trim()) return;
    setLoading(true);
    try {
      await api.post('/notes', { patient_id: appointment.patient_id, appointment_id: appointment.id, note: note.trim() });
      onSaved?.(); onClose();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center text-sky-500 border border-sky-100"><FileText size={15} /></div>
            <div><h2 className="text-sm font-bold text-slate-700">Doctor's Note</h2><p className="text-[10px] text-slate-400">Patient: {patientName}</p></div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X size={16} /></button>
        </div>
        <div className="p-5">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Clinical Notes</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={5} placeholder="Observations, treatment performed, prescription..." className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none resize-none" autoFocus />
        </div>
        <div className="flex items-center justify-end gap-2 px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={handleSave} disabled={!note.trim() || loading} className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-lg disabled:opacity-50">
            {loading && <Loader2 size={13} className="animate-spin" />} Save Note
          </button>
        </div>
      </div>
    </div>
  );
}
