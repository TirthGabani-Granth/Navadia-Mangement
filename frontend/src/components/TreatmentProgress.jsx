import React from 'react';
import { CheckCircle2, Clock, Hourglass } from 'lucide-react';

export default function TreatmentProgress({ plan }) {
  const { treatment_name, total_sessions, completed_sessions, status, next_appointment } = plan;
  const pct = (completed_sessions / total_sessions) * 100;

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-700">{treatment_name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Status: <span className="font-medium text-slate-600">{status}</span></p>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-sky-600">{completed_sessions}</span>
          <span className="text-sm text-slate-400"> / {total_sessions}</span>
          <p className="text-[10px] text-slate-400">Sessions</p>
        </div>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-5 overflow-hidden">
        <div className="bg-sky-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%` }}></div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: total_sessions }).map((_, i) => {
          const num = i + 1;
          const done = num <= completed_sessions;
          const isNext = num === completed_sessions + 1 && status !== 'Completed';
          const Icon = done ? CheckCircle2 : isNext ? Clock : Hourglass;
          const color = done ? 'text-emerald-500' : isNext ? 'text-amber-500' : 'text-slate-300';
          const bg = done ? 'bg-emerald-50' : isNext ? 'bg-amber-50' : 'bg-slate-50';
          const label = done ? 'Done' : isNext ? 'Next' : 'Pending';

          return (
            <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg border ${isNext ? 'border-amber-200' : 'border-slate-100'} ${bg}`}>
              <div className="flex items-center gap-2">
                <Icon size={15} className={color} />
                <div>
                  <p className="text-xs font-medium text-slate-700">Session {num}</p>
                  {isNext && next_appointment && <p className="text-[10px] text-slate-400">{new Date(next_appointment).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>}
                </div>
              </div>
              <span className={`text-[10px] font-medium ${color}`}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
