import React from 'react';
import { Bell, Menu, Search } from 'lucide-react';

export default function AdminHeader({ setMobileOpen }) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors" onClick={() => setMobileOpen(true)}>
          <Menu size={20} />
        </button>
        
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 w-72">
          <Search size={16} className="text-slate-400" />
          <input type="text" placeholder="Search patients, appointments..." className="bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none flex-1" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-slate-700">Dr. Jatin Navadiya</p>
            <p className="text-[11px] text-slate-400">Dental Surgeon</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md shadow-teal-200">
            JN
          </div>
        </div>
      </div>
    </header>
  );
}
