import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, ShieldCheck, User } from 'lucide-react';
import api from '../api';

export default function StaffLogin() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/staff/login', { phone });
      localStorage.setItem('staff_token', JSON.stringify(res.data));
      navigate('/portal');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your phone number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-teal-100/50 border border-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-200 mx-auto mb-6">
          <ShieldCheck size={32} className="text-white" />
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Team Member Portal</h2>
          <p className="text-slate-500 mt-1">Enter your registered phone number</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
              <Phone size={14} className="text-teal-500" /> Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium tracking-wide placeholder:text-slate-400 placeholder:font-normal"
              placeholder="+91 98765 43210"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !phone}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-teal-200 hover:shadow-xl hover:shadow-teal-300 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>Access Portal <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          <button onClick={() => navigate('/')} className="hover:text-teal-600 transition-colors">
            Back to Home
          </button>
        </p>
      </div>
    </div>
  );
}
