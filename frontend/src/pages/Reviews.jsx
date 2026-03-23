import React, { useState, useEffect } from 'react';
import api from '../api';
import { Star, MessageSquare } from 'lucide-react';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/reviews').then(res => { setReviews(res.data); setLoading(false); }).catch(console.error); }, []);

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-7 w-7 border-2 border-sky-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-700">Patient Reviews</h1>
        <p className="text-sm text-slate-400 mt-0.5">Feedback from patients after treatment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-5 flex flex-col items-center justify-center">
          <p className="text-4xl font-bold text-slate-700">{avg}</p>
          <div className="flex gap-0.5 mt-1.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={16} className={s <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-1">{reviews.length} reviews</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 md:col-span-2">
          <div className="space-y-1.5">
            {[5,4,3,2,1].map(n => {
              const count = reviews.filter(r => r.rating === n).length;
              return (
                <div key={n} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-3">{n}</span>
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-400 h-1.5 rounded-full transition-all duration-700" style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%' }} />
                  </div>
                  <span className="text-xs text-slate-400 w-4 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-10 text-center">
          <MessageSquare size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-500">No reviews yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-100 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-xs font-bold text-sky-600 border border-sky-100">
                    {r.patient_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{r.patient_name}</p>
                    <p className="text-[10px] text-slate-400">{new Date(r.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />)}
                </div>
              </div>
              {r.comment && <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2.5 border border-slate-100">"{r.comment}"</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
