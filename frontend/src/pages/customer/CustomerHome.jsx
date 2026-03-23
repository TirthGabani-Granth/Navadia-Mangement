import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ClipboardList, Star, ArrowRight, Phone, Heart, Sparkles, Shield } from 'lucide-react';

export default function CustomerHome() {
  const navigate = useNavigate();

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-3xl p-8 md:p-12 text-white">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute right-32 bottom-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2"></div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-orange-200" />
            <span className="text-orange-100 text-sm font-medium">Welcome to Navadiya Dental</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Your Smile is Our Priority</h1>
          <p className="text-orange-100 max-w-lg mb-8 leading-relaxed">
            Book appointments, check your visits, and share feedback - all in one place. 
            Dr. Jatin Navadiya and team are here for your dental care.
          </p>
          <button
            onClick={() => navigate('/customer/book')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
          >
            Book Appointment <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { 
            title: 'Book Appointment', 
            desc: 'Schedule a new visit with Dr. Navadiya', 
            icon: Calendar, 
            path: '/customer/book',
            gradient: 'from-blue-500 to-cyan-500',
            shadow: 'shadow-blue-200'
          },
          { 
            title: 'My Appointments', 
            desc: 'Check your upcoming and past visits', 
            icon: ClipboardList, 
            path: '/customer/appointments',
            gradient: 'from-emerald-500 to-teal-500',
            shadow: 'shadow-emerald-200'
          },
          { 
            title: 'Leave a Review', 
            desc: 'Share your experience with us', 
            icon: Star, 
            path: '/customer/review',
            gradient: 'from-amber-500 to-orange-500',
            shadow: 'shadow-amber-200'
          },
        ].map(({ title, desc, icon: Icon, path, gradient, shadow }) => (
          <button
            key={title}
            onClick={() => navigate(path)}
            className="group text-left bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg ${shadow} group-hover:scale-110 transition-transform`}>
              <Icon size={26} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
            <p className="text-slate-500 text-sm mb-4">{desc}</p>
            <span className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm group-hover:gap-3 transition-all">
              Get Started <ArrowRight size={14} />
            </span>
          </button>
        ))}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Phone size={22} className="text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 mb-1">Need Help?</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              Call us at <strong className="text-slate-700">+91 98765 43210</strong><br />
              Monday to Saturday, 9:00 AM - 6:00 PM
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
            <Heart size={22} className="text-rose-500" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 mb-1">Your Health Matters</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              We recommend a dental checkup every 6 months.<br />
              Stay on top of your oral health!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
