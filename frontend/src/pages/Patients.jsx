import React, { useState, useEffect } from 'react';
import api from '../api';
import { Phone, ExternalLink, Users, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/patients').then(res => { setPatients(res.data); setLoading(false); }).catch(console.error);
  }, []);

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.phone.includes(search)
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
          <p className="text-slate-500 mt-1">All registered patients and their records</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patients..."
            className="w-full sm:w-72 pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <Users size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">No patients found</p>
          <p className="text-slate-400 text-sm mt-1">Book an appointment to register a new patient</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(patient => (
            <div key={patient.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-teal-200">
                  {patient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">{patient.name}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Phone size={14} /> {patient.phone}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => navigate(`/admin/patients/${patient.id}`)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-600 text-sm font-semibold hover:from-teal-100 hover:to-cyan-100 transition-all border border-teal-100"
              >
                <ExternalLink size={16} /> View Full Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
