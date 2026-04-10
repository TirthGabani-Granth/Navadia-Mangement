import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Heart, Phone, Clock, MapPin, Sparkles, Users, Award } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-200">
              <span className="text-white text-xl font-black">N</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Navadiya Dental</h1>
              <p className="text-xs text-slate-400">Dr. Jatin Navadiya</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <span className="flex items-center gap-2 text-slate-500"><Phone size={14} /> +91 98765 43210</span>
            <span className="flex items-center gap-2 text-slate-500"><Clock size={14} /> Mon-Sat, 9AM-6PM</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
            <Sparkles size={16} /> Your Smile is Our Priority
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight">
            Modern Dental Care<br />
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">For Your Family</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10">
            Experience gentle, professional dental care with Dr. Jatin Navadiya. 
            From routine checkups to advanced treatments, we're here for your smile.
          </p>

          {/* Portal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <button
              onClick={() => navigate('/admin')}
              className="group relative overflow-hidden bg-white rounded-3xl p-8 text-left shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-teal-200/50 transition-all duration-500 border border-slate-100 hover:border-teal-200 w-full"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-100 to-transparent rounded-bl-full opacity-50"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-5 shadow-lg shadow-teal-200 group-hover:scale-110 transition-transform">
                  <Shield size={26} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Doctor Panel</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Manage team tasks, activity, salary & clinic operations
                </p>
                <span className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm group-hover:gap-4 transition-all">
                  Open Dashboard →
                </span>
              </div>
            </button>

            <button
              onClick={() => navigate('/staff-login')}
              className="group relative overflow-hidden bg-white rounded-3xl p-8 text-left shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-cyan-200/50 transition-all duration-500 border border-slate-100 hover:border-cyan-200 w-full"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-100 to-transparent rounded-bl-full opacity-50"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-5 shadow-lg shadow-cyan-200 group-hover:scale-110 transition-transform">
                  <Users size={26} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Team Member Portal</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Check-in, view your tasks, request leave, and check voicemails
                </p>
                <span className="inline-flex items-center gap-2 text-cyan-600 font-semibold text-sm group-hover:gap-4 transition-all">
                  Team Login →
                </span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-12 bg-white/50">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
              <Users size={22} className="text-teal-600" />
            </div>
            <p className="text-sm text-slate-500">Happy Clients</p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-3">
              <Award size={22} className="text-cyan-600" />
            </div>
            <p className="text-3xl font-bold text-slate-800">10+</p>
            <p className="text-sm text-slate-500">Years Experience</p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
              <Sparkles size={22} className="text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-slate-800">15+</p>
            <p className="text-sm text-slate-500">Treatments</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
          <MapPin size={14} /> Navadiya Dental Clinic, Gujarat
        </div>
      </footer>
    </div>
  );
}
