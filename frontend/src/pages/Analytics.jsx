import React, { useState, useEffect } from 'react';
import api from '../api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0ea5e9', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4'];

export default function Analytics() {
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/appointments'), api.get('/bills')])
      .then(([a, b]) => { setAppointments(a.data); setBills(b.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const apptByDay = appointments.reduce((a, app) => {
    const day = new Date(app.appointment_time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    a[day] = (a[day] || 0) + 1; return a;
  }, {});
  const apptData = Object.entries(apptByDay).slice(-7).map(([date, count]) => ({ date, count }));

  const treatCounts = appointments.reduce((a, app) => { a[app.treatment_type] = (a[app.treatment_type] || 0) + 1; return a; }, {});
  const treatData = Object.entries(treatCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-7 w-7 border-2 border-sky-500 border-t-transparent"></div>
    </div>
  );

  const Card = ({ title, children }) => (
    <div className="bg-white rounded-xl border border-slate-100 p-5">
      <h3 className="text-sm font-semibold text-slate-600 mb-4">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-700">Analytics</h1>
        <p className="text-sm text-slate-400 mt-0.5">Clinic performance and trends.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Appointments per Day">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={apptData.length > 0 ? apptData : [{ date: 'No Data', count: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Appointments" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Treatment Distribution">
          {treatData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={treatData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3}>
                  {treatData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-slate-400">No data yet</div>
          )}
        </Card>

        <Card title="Summary">
          <div className="space-y-3">
            {[
              { label: 'Total Appointments', value: appointments.length, dot: 'bg-sky-500' },
              { label: 'Revenue Collected', value: `₹${bills.filter(b => b.status === 'Paid').reduce((s, b) => s + b.amount, 0).toLocaleString()}`, dot: 'bg-emerald-500' },
              { label: 'Pending Invoices', value: bills.filter(b => b.status === 'Unpaid').length, dot: 'bg-amber-500' },
              { label: 'Unique Patients', value: new Set(appointments.map(a => a.patient_id)).size, dot: 'bg-purple-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="flex items-center gap-2 text-xs text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${item.dot}`}></span> {item.label}
                </span>
                <span className="text-sm font-bold text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
