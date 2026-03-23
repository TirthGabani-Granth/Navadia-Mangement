import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Star, Phone, MessageSquare, Send, CheckCircle, Loader2 } from 'lucide-react';

export default function CustomerReview() {
  const [phone, setPhone] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [patientId, setPatientId] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    setLookupLoading(true);
    try {
      const patientsRes = await api.get('/patients');
      const matchedPatient = patientsRes.data.find(p => p.phone === phone.trim());
      if (!matchedPatient) {
        alert('No patient found with this phone number. Please book an appointment first.');
        return;
      }
      setPatientId(matchedPatient.id);
      const apptsRes = await api.get('/appointments');
      const myAppts = apptsRes.data.filter(a => a.patient_id === matchedPatient.id && a.status === 'Completed');
      setAppointments(myAppts);
    } catch (err) {
      console.error(err);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return alert('Please select a star rating.');
    if (!selectedAppt && appointments.length > 0) return alert('Please select an appointment to review.');
    setLoading(true);
    try {
      await api.post('/reviews', {
        patient_id: patientId,
        appointment_id: selectedAppt || null,
        rating,
        comment,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800">Thank You! 🎉</h2>
        <p className="text-slate-500">Your review has been submitted. We appreciate your feedback!</p>
        <button
          onClick={() => { setSubmitted(false); setRating(0); setComment(''); setPhone(''); setAppointments([]); setPatientId(null); setSelectedAppt(null); }}
          className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 transition-colors"
        >
          Submit Another Review
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Leave a Review</h1>
        <p className="text-slate-500 mt-1 text-sm">We'd love to hear about your experience at our clinic.</p>
      </div>

      {/* Step 1 — Phone Lookup */}
      {!patientId ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Identify yourself
          </h2>
          <form onSubmit={handleLookup} className="flex gap-3">
            <div className="relative flex-1">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Your phone number..."
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all text-sm"
                required
              />
            </div>
            <button type="submit" disabled={lookupLoading} className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white font-semibold rounded-xl text-sm hover:bg-teal-700 transition-colors disabled:opacity-70">
              {lookupLoading ? <Loader2 size={15} className="animate-spin" /> : null}
              {lookupLoading ? 'Looking...' : 'Verify'}
            </button>
          </form>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Step 2 — Select Appointment */}
          {appointments.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                Select your visit
              </h2>
              <div className="space-y-2">
                {appointments.map(a => (
                  <label key={a.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedAppt === a.id ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input type="radio" name="appt" value={a.id} checked={selectedAppt === a.id} onChange={() => setSelectedAppt(a.id)} className="text-teal-600" />
                    <span className="text-sm text-slate-700">
                      <strong>{a.treatment_type}</strong> — {new Date(a.appointment_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Star Rating */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">{appointments.length > 0 ? 3 : 2}</span>
              Rate your experience
            </h2>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={36}
                    className={`transition-colors ${(hovered || rating) >= n ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-slate-500 font-medium">
                {rating ? ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][rating] : 'Select a rating'}
              </span>
            </div>
          </div>

          {/* Step 4 — Comment */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">{appointments.length > 0 ? 4 : 3}</span>
              <MessageSquare size={16} /> Add a comment <span className="text-xs font-normal text-slate-400">(optional)</span>
            </h2>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              placeholder="Tell us what you loved or what we can improve..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !rating}
              className="flex items-center gap-2 px-7 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors disabled:opacity-60 shadow-md shadow-teal-200"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
