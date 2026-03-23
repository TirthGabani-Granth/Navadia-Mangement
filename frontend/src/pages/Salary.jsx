import React, { useState, useEffect } from 'react';
import { Wallet, IndianRupee, TrendingUp, CreditCard, Banknote, Smartphone, ArrowDown, ArrowUp, Calculator, Receipt, PieChart } from 'lucide-react';
import api from '../api';

export default function Salary() {
  const [bills, setBills] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/bills'), api.get('/appointments')])
      .then(([b, a]) => { setBills(b.data); setAppointments(a.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = bills.filter(b => b.status === 'Paid').reduce((s, b) => s + b.amount, 0);
  const pendingAmount = bills.filter(b => b.status === 'Unpaid').reduce((s, b) => s + b.amount, 0);
  const totalBilled = bills.reduce((s, b) => s + b.amount, 0);
  const completedAppts = appointments.filter(a => a.status === 'Completed').length;

  const expenseRate = 0.30;
  const expenses = Math.round(totalRevenue * expenseRate);
  const netEarnings = totalRevenue - expenses;

  const treatmentBreakdown = bills.reduce((acc, b) => {
    if (!acc[b.treatment_name]) acc[b.treatment_name] = { count: 0, total: 0, paid: 0 };
    acc[b.treatment_name].count++;
    acc[b.treatment_name].total += b.amount;
    if (b.status === 'Paid') acc[b.treatment_name].paid += b.amount;
    return acc;
  }, {});
  const treatmentList = Object.entries(treatmentBreakdown).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.total - a.total);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Salary & Earnings</h1>
        <p className="text-slate-500 mt-1">Track revenue, expenses and net earnings</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
              <IndianRupee size={22} className="text-white" />
            </div>
            <span className="text-sm text-slate-500">Total Revenue</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">{bills.filter(b => b.status === 'Paid').length} paid invoices</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Wallet size={22} className="text-amber-600" />
            </div>
            <span className="text-sm text-slate-500">Pending</span>
          </div>
          <p className="text-3xl font-bold text-amber-600">₹{pendingAmount.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">{bills.filter(b => b.status === 'Unpaid').length} unpaid</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <ArrowDown size={22} className="text-red-500" />
            </div>
            <span className="text-sm text-slate-500">Expenses (30%)</span>
          </div>
          <p className="text-3xl font-bold text-red-500">₹{expenses.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Materials, rent, utilities</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-200">
              <TrendingUp size={22} className="text-white" />
            </div>
            <span className="text-sm text-slate-500">Net Earnings</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">₹{netEarnings.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">After expenses</p>
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-500 to-cyan-500">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Calculator size={18} /> Earnings Breakdown
          </h2>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <span className="text-slate-600">Total Billed</span>
            <span className="font-bold text-slate-800">₹{totalBilled.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
            <span className="text-emerald-600 flex items-center gap-2"><ArrowUp size={16} /> Collected</span>
            <span className="font-bold text-emerald-600">₹{totalRevenue.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
            <span className="text-amber-600">Pending Collection</span>
            <span className="font-bold text-amber-600">₹{pendingAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
            <span className="text-red-500 flex items-center gap-2"><ArrowDown size={16} /> Expenses (30%)</span>
            <span className="font-bold text-red-500">- ₹{expenses.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-white">
            <span className="font-semibold">Net Take-Home</span>
            <span className="text-2xl font-bold">₹{netEarnings.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Appointments', value: appointments.length },
          { label: 'Completed', value: completedAppts },
          { label: 'Total Invoices', value: bills.length },
          { label: 'Collection Rate', value: `${totalBilled > 0 ? Math.round((totalRevenue / totalBilled) * 100) : 0}%` },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm">
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Treatment Revenue */}
      {treatmentList.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <PieChart size={18} className="text-teal-500" /> Revenue by Treatment
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Treatment</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Count</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Total</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {treatmentList.map(t => (
                  <tr key={t.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">{t.name}</td>
                    <td className="px-6 py-4 text-center text-slate-500">{t.count}</td>
                    <td className="px-6 py-4 text-right text-slate-700">₹{t.total.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-emerald-600 font-semibold">₹{t.paid.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-5">
          <CreditCard size={18} className="text-teal-500" /> Accepted Payment Methods
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-3 p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-200">
              <Smartphone size={22} className="text-white" />
            </div>
            <span className="font-semibold text-slate-700">UPI / GPay</span>
            <span className="text-xs text-slate-500">Online Payment</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-200">
              <CreditCard size={22} className="text-white" />
            </div>
            <span className="font-semibold text-slate-700">Card</span>
            <span className="text-xs text-slate-500">Debit / Credit</span>
          </div>
          <div className="flex flex-col items-center gap-3 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
              <Banknote size={22} className="text-white" />
            </div>
            <span className="font-semibold text-slate-700">Cash</span>
            <span className="text-xs text-slate-500">At Counter</span>
          </div>
        </div>
      </div>
    </div>
  );
}
