import React, { useState, useEffect } from 'react';
import BookingForm from '../components/BookingForm';
import AppointmentTable from '../components/AppointmentTable';
import api from '../api';
import { Calendar, Plus } from 'lucide-react';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [showBooking, setShowBooking] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      const patientsRes = await api.get('/patients');
      const patientMap = {};
      patientsRes.data.forEach(p => patientMap[p.id] = p.name);
      const enhancedApps = res.data.map(app => ({
        ...app,
        patient_name: patientMap[app.patient_id] || "Unknown"
      }));
      enhancedApps.sort((a, b) => new Date(a.appointment_time) - new Date(b.appointment_time));
      setAppointments(enhancedApps);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      if (status === 'Completed') {
        await api.post(`/appointments/${id}/complete`);
      } else {
        await api.post(`/appointments/${id}/status`, { status });
      }
      fetchAppointments();
    } catch (error) {
      console.error(error);
    }
  };

  const handleBookingSuccess = () => {
    fetchAppointments();
    setShowBooking(false);
    alert("Appointment booked successfully!");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-500 mt-1">Schedule and manage all clinic appointments</p>
        </div>
        <button 
          onClick={() => setShowBooking(!showBooking)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-200 hover:shadow-xl hover:shadow-teal-300 transition-all"
        >
          {showBooking ? <Calendar size={18} /> : <Plus size={18} />}
          {showBooking ? 'View Appointments' : 'New Appointment'}
        </button>
      </div>

      {showBooking ? (
        <BookingForm onSuccess={handleBookingSuccess} />
      ) : (
        <AppointmentTable appointments={appointments} onUpdateStatus={handleUpdateStatus} />
      )}
    </div>
  );
}
