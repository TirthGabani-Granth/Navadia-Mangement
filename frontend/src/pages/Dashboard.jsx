import React, { useState, useEffect } from 'react';
import DashboardCards from '../components/DashboardCards';
import AppointmentTable from '../components/AppointmentTable';
import api from '../api';
import { Sparkles } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      if (status === 'Completed') {
        await api.post(`/appointments/${id}/complete`);
      } else {
        await api.post(`/appointments/${id}/status`, { status });
      }
      fetchDashboardData();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute right-20 bottom-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2"></div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-teal-200" />
            <span className="text-teal-100 text-sm">Good morning</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Welcome back, Dr. Jatin!</h1>
          <p className="text-teal-100">Here's what's happening at your clinic today.</p>
        </div>
      </div>

      <DashboardCards data={data} />
      
      <AppointmentTable
        appointments={data?.todays_appointments || []}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
