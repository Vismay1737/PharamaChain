import React, { useState, useRef, useEffect } from 'react';
import { api } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import { BrainCircuit, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTIONS = [
  "What batches are currently flagged?",
  "Summarize the supply chain health",
  "What is the risk for Remdesivir batch PC-2601?",
  "Generate a safety compliance report",
];

const AiChat = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I'm **PharmaChain AI**, powered by Google Gemini. I can analyze your supply chain, assess batch risks, and generate reports. How can I help?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await api.post('/chat/', { message: msg });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I couldn't process that. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]">
      <Header title="AI Assistant" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 1 && (
            <div className="mt-6 mb-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center">
                  <BrainCircuit size={32} className="text-green-500" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Gemini-Powered Intelligence</h2>
                <p className="text-sm text-gray-400">Ask about batches, risks, or compliance</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-w-xl mx-auto">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)} className="card p-3.5 text-left text-sm text-gray-600 hover:border-green-300 hover:text-green-700 transition-all flex items-start gap-2.5">
                    <Sparkles size={14} className="text-green-500 shrink-0 mt-0.5" />{s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'ai' && <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center shrink-0"><Bot size={14} className="text-white" /></div>}
                <div className={`max-w-[70%] p-3.5 rounded-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-green-500 text-white' : 'card text-gray-700'}`}>
                  {msg.text.split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className={msg.role === 'user' ? 'text-white' : 'text-green-600'}>{part}</strong> : part)}
                </div>
                {msg.role === 'user' && <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0"><User size={14} className="text-white" /></div>}
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex gap-2.5"><div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center"><Bot size={14} className="text-white" /></div>
              <div className="card p-3.5 rounded-xl"><Loader2 size={16} className="text-green-500 animate-spin" /></div></div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2.5 max-w-2xl mx-auto">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about your supply chain..." className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-300" disabled={loading} />
            <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-4 flex items-center gap-1.5 disabled:opacity-30"><Send size={15} /></button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
