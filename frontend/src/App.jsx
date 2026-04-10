import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Landing
import LandingPage from './pages/LandingPage';

// Admin Panel
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Salary from './pages/Salary';

// Team Management
import TeamMembers from './pages/TeamMembers';
import TaskBoard from './pages/TaskBoard';
import TeamActivity from './pages/TeamActivity';
import AdminAttendance from './pages/AdminAttendance';
import AdminLeave from './pages/AdminLeave';
import AdminVoicemail from './pages/AdminVoicemail';

// Staff Portal
import StaffLogin from './pages/StaffLogin';
import StaffLayout from './components/StaffLayout';
import StaffPortal from './pages/StaffPortal';
import StaffAttendance from './pages/StaffAttendance';
import StaffTasks from './pages/StaffTasks';
import StaffLeave from './pages/StaffLeave';
import StaffNotifications from './pages/StaffNotifications';
import StaffVoicemail from './pages/StaffVoicemail';

// Customer Portal removed

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Staff Portal */}
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/portal" element={<StaffLayout />}>
          <Route index element={<StaffPortal />} />
          <Route path="attendance" element={<StaffAttendance />} />
          <Route path="tasks" element={<StaffTasks />} />
          <Route path="leave" element={<StaffLeave />} />
          <Route path="notifications" element={<StaffNotifications />} />
          <Route path="voicemail" element={<StaffVoicemail />} />
        </Route>

        {/* Admin Panel */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="salary" element={<Salary />} />
          <Route path="team" element={<TeamMembers />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="tasks" element={<TaskBoard />} />
          <Route path="leave" element={<AdminLeave />} />
          <Route path="voicemail" element={<AdminVoicemail />} />
          <Route path="activity" element={<TeamActivity />} />
          <Route path="settings" element={<Settings />} />
        </Route>

{/* Customer Portal removed */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
