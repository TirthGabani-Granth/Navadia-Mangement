import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import TreatmentProgress from '../components/TreatmentProgress';
import ReviewPanel from '../components/ReviewPanel';
import { Phone, ArrowLeft, CalendarCheck, Star, FileText, ChevronDown, ChevronUp, User } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const c = { Scheduled: 'bg-blue-50 text-blue-600', Waiting: 'bg-amber-50 text-amber-600', 'In Treatment': 'bg-purple-50 text-purple-600', Completed: 'bg-emerald-50 text-emerald-600' };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${c[status] || 'bg-slate-50 text-slate-500'}`}>{status}</span>;
};

const Section = ({ title, icon: Icon, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <button className="w-full flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors" onClick={() => setOpen(o => !o)}>
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Icon size={15} className="text-sky-500" /> {title}</span>
        {open ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
};

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewAppId, setReviewAppId] = useState(null);

  useEffect(() => { api.get(`/patients/${id}`).then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false)); }, [id]);

  if (loading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-7 w-7 border-2 border-sky-500 border-t-transparent"></div></div>;
  if (!data) return <div className="text-center text-slate-400 py-20 text-sm">Patient not found.</div>;

  const { patient, appointments, treatments, notes, reviews } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft size={14} /> Back</button>

      <div className="bg-sky-500 rounded-xl p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">{patient.name.charAt(0).toUpperCase()}</div>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{patient.name}</h1>
            <p className="flex items-center gap-1.5 text-sky-100 text-xs"><Phone size={12} /> {patient.phone}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sky-200 text-[10px]">Patient ID</p>
            <p className="text-sm font-mono font-bold">#{String(patient.id).padStart(4, '0')}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[{ l: 'Appointments', v: appointments.length }, { l: 'Completed', v: appointments.filter(a => a.status === 'Completed').length }, { l: 'Reviews', v: reviews.length }].map(i => (
            <div key={i.l} className="bg-white/10 rounded-lg p-2.5 text-center"><p className="text-lg font-bold">{i.v}</p><p className="text-[10px] text-sky-200">{i.l}</p></div>
          ))}
        </div>
      </div>

      <Section title="Appointments" icon={CalendarCheck}>
        {appointments.length === 0 ? <p className="text-xs text-slate-400">No appointments.</p> : (
          <div className="space-y-2">
            {appointments.map(a => (
              <div key={a.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-medium text-slate-700">{a.treatment_type}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{new Date(a.appointment_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={a.status} />
                  {a.status === 'Completed' && !reviews.find(r => r.appointment_id === a.id) && (
                    <button onClick={() => setReviewAppId(a.id)} className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded hover:bg-amber-100 flex items-center gap-0.5"><Star size={10} /> Review</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {treatments.length > 0 && (
        <Section title="Treatment Plans" icon={User}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{treatments.map(t => <TreatmentProgress key={t.id} plan={t} />)}</div>
        </Section>
      )}

      <Section title="Doctor's Notes" icon={FileText}>
        {notes.length === 0 ? <p className="text-xs text-slate-400">No notes.</p> : (
          <div className="space-y-2">{notes.map(n => (
            <div key={n.id} className="bg-amber-50 border border-amber-100 rounded-lg p-3">
              <p className="text-xs text-slate-600">{n.note}</p>
              <p className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
          ))}</div>
        )}
      </Section>

      {reviewAppId && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
            <div className="flex justify-between items-center mb-4"><h2 className="text-sm font-bold text-slate-700">Leave a Review</h2><button onClick={() => setReviewAppId(null)} className="text-slate-400 hover:text-slate-600 text-sm">X</button></div>
            <ReviewPanel patientId={patient.id} appointmentId={reviewAppId} onSubmit={() => { setTimeout(() => setReviewAppId(null), 1500); api.get(`/patients/${id}`).then(r => setData(r.data)); }} />
          </div>
        </div>
      )}
    </div>
  );
}
