import React, { useState, useEffect } from 'react';
import api from '../api';
import TreatmentProgress from '../components/TreatmentProgress';

export default function Treatments() {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/treatments/active');
        const patientsRes = await api.get('/patients');
        const map = {};
        patientsRes.data.forEach(p => map[p.id] = p.name);
        setTreatments(res.data.map(t => ({ ...t, patient_name: map[t.patient_id] || "Unknown" })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-7 w-7 border-2 border-sky-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-700">Active Treatments</h1>
        <p className="text-sm text-slate-400 mt-0.5">Track multi-session treatment progress.</p>
      </div>
      {treatments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-sm text-slate-400">
          No active multi-session treatments.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {treatments.map(t => (
            <div key={t.id}>
              <p className="text-xs font-medium text-slate-400 mb-1.5">Patient: {t.patient_name}</p>
              <TreatmentProgress plan={t} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
