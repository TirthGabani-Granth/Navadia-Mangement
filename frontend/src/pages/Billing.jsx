import React, { useState, useEffect } from 'react';
import api from '../api';
import BillingPanel from '../components/BillingPanel';
import { Receipt, IndianRupee, CheckCircle, Clock } from 'lucide-react';

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [patientMap, setPatientMap] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [billsRes, patientsRes] = await Promise.all([api.get('/bills'), api.get('/patients')]);
      const map = {};
      patientsRes.data.forEach(p => (map[p.id] = p.name));
      setPatientMap(map);
      setBills(billsRes.data.sort((a, b) => (a.status === 'Paid') - (b.status === 'Paid')));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const totalPaid = bills.filter(b => b.status === 'Paid').reduce((s, b) => s + b.amount, 0);
  const totalPending = bills.filter(b => b.status === 'Unpaid').reduce((s, b) => s + b.amount, 0);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Billing & Payments</h1>
        <p className="text-slate-500 mt-1">Manage invoices and record patient payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-200">
            <Receipt size={22} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{bills.length}</p>
            <p className="text-sm text-slate-500">Total Invoices</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle size={22} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">₹{totalPaid.toLocaleString()}</p>
            <p className="text-sm text-slate-500">Collected</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <Clock size={22} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">₹{totalPending.toLocaleString()}</p>
            <p className="text-sm text-slate-500">Pending</p>
          </div>
        </div>
      </div>

      {bills.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <Receipt size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">No invoices yet</p>
          <p className="text-slate-400 text-sm mt-1">Complete a treatment to generate a bill</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {bills.map(bill => (
            <BillingPanel key={bill.id} bill={bill} patientName={patientMap[bill.patient_id] || 'Unknown'} onPaymentSuccess={fetchData} />
          ))}
        </div>
      )}
    </div>
  );
}
