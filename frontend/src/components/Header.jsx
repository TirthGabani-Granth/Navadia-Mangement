import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';

export default function Header({ setMobileOpen }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 transition-colors">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md" onClick={() => setMobileOpen(true)}>
          <Menu size={20} />
        </button>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search patients, appointments..."
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-800 leading-none">Dr. Sarah Smith</p>
            <p className="text-xs text-slate-500 mt-1 leading-none">Premier Dental Care</p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"
            alt="Doctor profile"
            className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm"
          />
        </div>
      </div>
    </header>
  );
}
