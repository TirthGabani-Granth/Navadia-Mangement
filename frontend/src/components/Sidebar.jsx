import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Stethoscope, ReceiptText, LineChart, Settings, ChevronLeft, ChevronRight, Bell, Star } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Appointments', icon: Calendar, path: '/appointments' },
  { name: 'Patients', icon: Users, path: '/patients' },
  { name: 'Treatments', icon: Stethoscope, path: '/treatments' },
  { name: 'Billing', icon: ReceiptText, path: '/billing' },
  { name: 'Reminders', icon: Bell, path: '/reminders' },
  { name: 'Reviews', icon: Star, path: '/reviews' },
  { name: 'Analytics', icon: LineChart, path: '/analytics' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const toggleCollapse = () => setCollapsed(!collapsed);

  return (
    <>
      <div className={`fixed inset-0 bg-slate-900/50 z-20 md:hidden ${mobileOpen ? 'block' : 'hidden'}`} onClick={() => setMobileOpen(false)} />
      <div className={`fixed md:static inset-y-0 left-0 bg-white border-r border-slate-200 z-30 transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Logo Area */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200">
          <div className="flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              D
            </div>
            {!collapsed && <span className="font-semibold text-slate-800 truncate text-lg">DentalSync</span>}
          </div>
          <button onClick={toggleCollapse} className="hidden md:flex p-1.5 rounded-md hover:bg-slate-100 text-slate-500">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-teal-50 text-teal-600 font-medium' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  } ${collapsed ? 'justify-center' : 'justify-start'}`
                }
                title={collapsed ? item.name : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
}
