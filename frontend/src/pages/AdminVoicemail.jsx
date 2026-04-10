import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Send, AlertTriangle, Users } from 'lucide-react';
import api from '../api';

export default function AdminVoicemail() {
  const [staff, setStaff] = useState([]);
  const [toAll, setToAll] = useState(true);
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [isEmergency, setIsEmergency] = useState(false);
  const [message, setMessage] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBase64, setAudioBase64] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    api.get('/staff').then(res => setStaff(res.data.filter(s => s.status === 'Active')));
  }, []);

  const handleStaffSelect = (e) => {
    const opts = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setSelectedStaffIds(opts);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => setAudioBase64(reader.result);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (e) {
      alert("Microphone permission denied or not available");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop tracks to release mic
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const discardRecording = () => {
    setAudioUrl(null);
    setAudioBase64(null);
  };

  const sendVoicemail = async () => {
    if (!audioBase64 && !message) {
      alert("Please record audio or type a message.");
      return;
    }
    try {
      await api.post('/voicemail/broadcast', {
        to_all: toAll,
        to_staff_ids: toAll ? [] : selectedStaffIds,
        audio_data: audioBase64,
        message: message,
        is_emergency: isEmergency
      });
      alert('Voicemail sent successfully!');
      discardRecording();
      setMessage('');
      setIsEmergency(false);
    } catch (e) {
      console.error(e);
      alert('Failed to send.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Voicemail Broadcasting</h1>
        <p className="text-slate-500 mt-1">Send voice instructions to your team directly to their portal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
          <div>
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Users size={18} /> Recipients</h3>
            <div className="flex items-center gap-4 mb-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer border p-2 rounded-lg bg-slate-50">
                <input type="radio" checked={toAll} onChange={() => setToAll(true)} className="accent-teal-500" /> All Staff
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer border p-2 rounded-lg bg-slate-50">
                <input type="radio" checked={!toAll} onChange={() => setToAll(false)} className="accent-teal-500" /> Specific Staff
              </label>
            </div>
            {!toAll && (
              <select multiple value={selectedStaffIds} onChange={handleStaffSelect} className="w-full border border-slate-200 rounded-xl p-2 text-sm outline-none focus:border-teal-500 h-32 bg-slate-50">
                {staff.map(s => <option key={s.id} value={s.id} className="p-1">{s.name} - {s.role}</option>)}
              </select>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 mb-2 mt-4">Written Message (Optional)</h3>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Add text to accompany voice..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm resize-none outline-none focus:border-teal-500"></textarea>
          </div>

          <div>
            <label className="flex items-center gap-2 font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 cursor-pointer">
              <input type="checkbox" checked={isEmergency} onChange={e => setIsEmergency(e.target.checked)} className="accent-red-500 w-4 h-4" />
              <AlertTriangle size={18} /> Mark as Emergency/Urgent
            </label>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <h3 className="font-semibold text-slate-800 mb-8 self-start w-full border-b pb-2">Record Audio</h3>
          
          {!audioUrl ? (
            <div className="flex flex-col items-center">
              <button 
                onMouseDown={startRecording} 
                onMouseUp={stopRecording} 
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 shadow-lg shadow-red-200 scale-110 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 shadow-md text-white'}`}
              >
                <Mic size={40} className="text-white" />
              </button>
              <p className="mt-6 font-medium text-slate-500">
                {isRecording ? <span className="text-red-500 font-bold">Recording... (release to stop)</span> : "Hold to Record"}
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center space-y-6">
              <div className="w-full bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                <audio src={audioUrl} controls className="w-full h-10" />
              </div>
              <div className="flex gap-4 w-full">
                <button onClick={discardRecording} className="flex-1 py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors">Discard</button>
                <button onClick={sendVoicemail} className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-teal-200 hover:shadow-teal-300 transition-all flex items-center justify-center gap-2">
                  <Send size={18} /> Send Voicemail
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
