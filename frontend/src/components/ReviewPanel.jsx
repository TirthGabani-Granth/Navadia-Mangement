import React, { useState } from 'react';
import { Star } from 'lucide-react';
import api from '../api';

export default function ReviewPanel({ patientId, appointmentId, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setLoading(true);
    try { await api.post('/reviews', { patient_id: patientId, appointment_id: appointmentId, rating, comment }); setSubmitted(true); onSubmit?.(); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (submitted) return (
    <div className="text-center py-5">
      <p className="text-sm font-semibold text-slate-700">Thank you for your feedback!</p>
      <p className="text-xs text-slate-400 mt-1">Your review helps us improve.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-slate-500 mb-2 text-center">How was your experience?</p>
        <div className="flex justify-center gap-1.5">
          {[1,2,3,4,5].map(s => (
            <button key={s} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(s)} className="transition-transform hover:scale-110">
              <Star size={28} className={`transition-colors ${s <= (hovered || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
            </button>
          ))}
        </div>
        {rating > 0 && <p className="text-center text-[11px] text-slate-400 mt-1">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</p>}
      </div>
      <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Optional comment..." rows={3} className="w-full p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-400 outline-none resize-none" />
      <button disabled={!rating || loading} onClick={handleSubmit} className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-lg disabled:opacity-40">{loading ? 'Submitting...' : 'Submit'}</button>
    </div>
  );
}
