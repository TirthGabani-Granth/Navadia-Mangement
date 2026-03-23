import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Landing
import LandingPage from './pages/LandingPage';

// Admin Panel
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Treatments from './pages/Treatments';
import Billing from './pages/Billing';
import Analytics from './pages/Analytics';
import Reminders from './pages/Reminders';
import Reviews from './pages/Reviews';
import Settings from './pages/Settings';
import Salary from './pages/Salary';

// Team Management
import TeamMembers from './pages/TeamMembers';
import TaskBoard from './pages/TaskBoard';
import TeamActivity from './pages/TeamActivity';

// Customer Portal
import CustomerLayout from './components/CustomerLayout';
import CustomerHome from './pages/customer/CustomerHome';
import CustomerBook from './pages/customer/CustomerBook';
import CustomerAppointments from './pages/customer/CustomerAppointments';
import CustomerReview from './pages/customer/CustomerReview';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Admin Panel */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patients/:id" element={<PatientDetail />} />
          <Route path="treatments" element={<Treatments />} />
          <Route path="billing" element={<Billing />} />
          <Route path="salary" element={<Salary />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="team" element={<TeamMembers />} />
          <Route path="tasks" element={<TaskBoard />} />
          <Route path="activity" element={<TeamActivity />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Customer Portal */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerHome />} />
          <Route path="book" element={<CustomerBook />} />
          <Route path="appointments" element={<CustomerAppointments />} />
          <Route path="review" element={<CustomerReview />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
