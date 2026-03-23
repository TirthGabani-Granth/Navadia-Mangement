import React, { useState } from 'react';
import { CheckCircle2, Clock, PlayCircle, CalendarClock, FileText, MoreHorizontal } from 'lucide-react';
import DoctorNotesModal from './DoctorNotesModal';

const StatusBadge = ({ status }) => {
  const styles = {
    "Scheduled": "bg-blue-50 text-blue-600 border-blue-100",
    "Waiting": "bg-amber-50 text-amber-600 border-amber-100",
    "In Treatment": "bg-purple-50 text-purple-600 border-purple-100",
    "Completed": "bg-emerald-50 text-emerald-600 border-emerald-100",
  };
  const icons = { "Scheduled": CalendarClock, "Waiting": Clock, "In Treatment": PlayCircle, "Completed": CheckCircle2 };
  const Icon = icons[status] || Clock;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${styles[status] || "bg-slate-50 text-slate-600 border-slate-100"}`}>
      <Icon size={14} /> {status}
    </span>
  );
};

export default function AppointmentTable({ appointments = [], onUpdateStatus }) {
  const [notesFor, setNotesFor] = useState(null);

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
        <CalendarClock size={48} className="mx-auto text-slate-200 mb-4" />
        <p className="text-slate-500 font-medium">No appointments scheduled for today</p>
        <p className="text-slate-400 text-sm mt-1">New appointments will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">Today's Appointments</h3>
            <p className="text-sm text-slate-500 mt-0.5">{appointments.length} scheduled</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Treatment</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {appointments.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm">
                        {app.patient_name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800">{app.patient_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{app.treatment_type}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(app.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={app.status} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {app.status === 'Scheduled' && (
                        <button onClick={() => onUpdateStatus(app.id, 'Waiting')} className="px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors border border-amber-100">
                          Mark Waiting
                        </button>
                      )}
                      {(app.status === 'Scheduled' || app.status === 'Waiting') && (
                        <button onClick={() => onUpdateStatus(app.id, 'In Treatment')} className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-100">
                          Start Treatment
                        </button>
                      )}
                      {app.status === 'In Treatment' && (
                        <>
                          <button
                            onClick={() => setNotesFor({ appointment: app, patientName: app.patient_name })}
                            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
                          >
                            <FileText size={13} /> Notes
                          </button>
                          <button onClick={() => onUpdateStatus(app.id, 'Completed')} className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-sm hover:shadow-md transition-all">
                            Complete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {notesFor && (
        <DoctorNotesModal
          appointment={notesFor.appointment}
          patientName={notesFor.patientName}
          onClose={() => setNotesFor(null)}
          onSaved={() => {}}
        />
      )}
    </>
  );
}
