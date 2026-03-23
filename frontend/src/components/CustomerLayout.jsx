import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Calendar, ClipboardList, Star, ArrowLeft, Menu, X, Heart } from 'lucide-react';

const NAV = [
  { name: 'Home', icon: Home, path: '/customer' },
  { name: 'Book Appointment', icon: Calendar, path: '/customer/book' },
  { name: 'My Appointments', icon: ClipboardList, path: '/customer/appointments' },
  { name: 'Leave Review', icon: Star, path: '/customer/review' },
];

export default function CustomerLayout() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-200">
              N
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-slate-800 text-sm">Navadiya Dental</p>
              <p className="text-xs text-slate-400">Patient Portal</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/customer'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200'
                        : 'text-slate-600 hover:bg-orange-50'
                    }`
                  }
                >
                  <Icon size={16} /> {item.name}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft size={16} /> Back
            </button>
            <button className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white p-4 space-y-1">
            {NAV.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/customer'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                        : 'text-slate-600 hover:bg-orange-50'
                    }`
                  }
                >
                  <Icon size={18} /> {item.name}
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
