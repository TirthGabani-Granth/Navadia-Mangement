import React, { useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import api from '../api';

export default function AssistantChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! Ask: "How many tasks today?" or "Who is on shift?"' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || loading) return;
    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/assistant/chat', { message });
      setMessages((prev) => [...prev, { role: 'assistant', text: res.data.answer }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Unable to answer right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
          <MessageCircle size={16} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">AI Chat Assistant</h3>
          <p className="text-xs text-slate-500">Quick answers from clinic data</p>
        </div>
      </div>

      <div className="space-y-2 max-h-52 overflow-auto pr-1 mb-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-sm rounded-lg px-3 py-2 ${
              m.role === 'assistant' ? 'bg-slate-50 text-slate-700' : 'bg-cyan-50 text-cyan-800 ml-8'
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
          placeholder="Ask about today's clinic..."
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-3 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-60"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
