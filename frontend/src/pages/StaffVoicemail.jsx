import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Play, Square, Mic, AlertTriangle, Check } from 'lucide-react';
import api from '../api';

export default function StaffVoicemail() {
  const { user } = useOutletContext();
  const [vms, setVms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const [audioObj, setAudioObj] = useState(null);

  const fetchVms = async () => {
    try {
      const res = await api.get(`/voicemail/${user.id}`);
      setVms(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchVms(); }, [user.id]);

  useEffect(() => {
    return () => { if (audioObj) { audioObj.pause(); audioObj.src = ""; } };
  }, [audioObj]);

  const togglePlay = async (vmData) => {
    const { voicemail } = vmData;
    if (playingId === voicemail.id) {
      // stop playing
      if (audioObj) { audioObj.pause(); audioObj.currentTime = 0; }
      setPlayingId(null);
      return;
    }
    
    // Stop currently playing if any
    if (audioObj) { audioObj.pause(); audioObj.src = ""; }
    
    // Create new audio from base64
    if (!voicemail.audio_data) return;
    
    try {
      const newAudio = new Audio(voicemail.audio_data);
      newAudio.onended = () => setPlayingId(null);
      setAudioObj(newAudio);
      setPlayingId(voicemail.id);
      newAudio.play();
      
      if (!voicemail.is_listened) {
        await api.put(`/voicemail/${voicemail.id}/listened`);
        await fetchVms();
      }
    } catch (e) {
      console.error("Failed to play audio", e);
      alert("Failed to play audio format");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading voicemails...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Voicemail Inbox</h1>
        <p className="text-slate-500 mt-1">Listen to voice messages and instructions</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {vms.map((item) => {
            const vm = item.voicemail;
            const sender = item.sender;
            return (
              <div key={vm.id} className={`p-5 flex gap-4 transition-colors ${!vm.is_listened && vm.is_emergency ? 'bg-red-50' : !vm.is_listened ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50'}`}>
                <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${vm.is_emergency ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                  {vm.is_emergency ? <AlertTriangle size={20} /> : <Mic size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800 text-sm">
                      {sender ? sender.name : 'Admin'} {vm.is_emergency && <span className="ml-2 text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Urgent</span>}
                    </h4>
                    <span className="text-[10px] text-slate-400">{new Date(vm.created_at).toLocaleString()}</span>
                  </div>
                  {vm.message && <p className="text-sm text-slate-600 mb-3">{vm.message}</p>}
                  
                  {vm.audio_data && (
                    <div className="flex items-center gap-3">
                      <button onClick={() => togglePlay(item)} className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${playingId === vm.id ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-800 text-white hover:bg-slate-700 shadow-md'}`}>
                        {playingId === vm.id ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-1" />}
                      </button>
                      <div className="flex-1 max-w-[200px] h-2 bg-slate-200 rounded-full overflow-hidden">
                        {playingId === vm.id && <div className="h-full bg-rose-500 w-full animate-pulse"></div>}
                      </div>
                    </div>
                  )}
                </div>
                {vm.is_listened && <div className="self-start text-emerald-500" title="Listened"><Check size={18} /></div>}
              </div>
            );
          })}
          {!vms.length && (
            <div className="p-16 text-center text-slate-400">
              <Mic className="mx-auto mb-4 text-slate-300" size={40} />
              <p>No voicemails received.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
