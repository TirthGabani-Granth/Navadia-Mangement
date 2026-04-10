import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, Clock, CheckSquare, CalendarOff, Bell, Mic, LogOut } from 'lucide-react';

const NAV = [
  { name: 'Dashboard', path: '/portal', icon: LayoutDashboard },
  { name: 'Attendance', path: '/portal/attendance', icon: Clock },
  { name: 'Tasks', path: '/portal/tasks', icon: CheckSquare },
  { name: 'Leave', path: '/portal/leave', icon: CalendarOff },
  { name: 'Notifications', path: '/portal/notifications', icon: Bell },
  { name: 'Voicemail', path: '/portal/voicemail', icon: Mic },
];

export default function StaffLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('staff_token');
    if (!data) {
      navigate('/staff-login');
    } else {
      setUser(JSON.parse(data));
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 md:flex-row flex-col">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold">
            {user.name.charAt(0)}
          </div>
          <span className="font-semibold text-slate-800">{user.name}</span>
        </div>
        <button onClick={() => { localStorage.removeItem('staff_token'); navigate('/staff-login'); }} className="text-slate-400 hover:text-red-500">
          <LogOut size={20} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex inset-y-0 left-0 z-30 flex-col w-64 bg-white border-r border-slate-200">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md shadow-teal-200">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-slate-800 text-sm truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.role}</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/portal'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => { localStorage.removeItem('staff_token'); navigate('/staff-login'); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 text-sm font-medium transition-all">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50 pb-24 md:pb-8">
        <Outlet context={{ user }} />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-40">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/portal'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive ? 'text-teal-600 font-medium' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              <Icon size={20} />
              <span className="text-[10px]">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
