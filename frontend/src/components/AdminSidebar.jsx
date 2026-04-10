import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, Stethoscope, Receipt, TrendingUp,
  Settings, ChevronLeft, ChevronRight, Bell, Star, ArrowLeft,
  UserCog, ListTodo, Activity, Wallet, Clock, CalendarOff, Mic
} from 'lucide-react';

const NAV = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { name: 'Salary & Earnings', icon: Wallet, path: '/admin/salary' },
  { type: 'divider', label: 'Team' },
  { name: 'Team', icon: UserCog, path: '/admin/team' },
  { name: 'Attendance', icon: Clock, path: '/admin/attendance' },
  { name: 'Tasks', icon: ListTodo, path: '/admin/tasks' },
  { name: 'Leave Requests', icon: CalendarOff, path: '/admin/leave' },
  { name: 'Voicemail', icon: Mic, path: '/admin/voicemail' },
  { name: 'Activity', icon: Activity, path: '/admin/activity' },
  { type: 'divider' },
  { name: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden" onClick={() => setMobileOpen(false)} />}
      
      <aside className={`fixed md:static inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-slate-100 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md shadow-teal-200 flex-shrink-0">
              N
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="font-bold text-slate-800 text-sm truncate">Navadiya Dental</p>
                <p className="text-[10px] text-slate-400 truncate">Dr. Jatin Navadiya</p>
              </div>
            )}
          </div>
          <button onClick={() => setCollapsed(!collapsed)} className="hidden md:flex w-7 h-7 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV.map((item, i) => {
            if (item.type === 'divider') {
              return (
                <div key={i} className="my-4">
                  {item.label && !collapsed && (
                    <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
                  )}
                  <div className="border-t border-slate-100" />
                </div>
              );
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
                title={collapsed ? item.name : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Back */}
        <div className="p-3 border-t border-slate-50">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 text-[13px] transition-all ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <ArrowLeft size={16} />
            {!collapsed && <span>Back Home</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
