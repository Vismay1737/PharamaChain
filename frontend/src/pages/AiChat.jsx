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
    { role: 'ai', text: "Hello! I'm **PharmaChain AI**, powered by Google Gemini. I can analyze your pharmaceutical supply chain, assess batch risks, and generate compliance reports. How can I help?" }
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
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I couldn't process that request. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]">
      <Header title="AI Assistant" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.length === 1 && (
            <div className="mt-8 mb-4">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-teal-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
                  <BrainCircuit size={40} className="text-teal-400" />
                </div>
                <h2 className="text-xl font-black text-white mb-1">Gemini-Powered Intelligence</h2>
                <p className="text-sm text-slate-500">Ask about batches, risks, compliance, or supply chain health</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)} className="glass-card p-4 text-left text-sm text-slate-300 hover:text-teal-400 hover:border-teal-500/30 transition-all flex items-start gap-3">
                    <Sparkles size={16} className="text-teal-500 shrink-0 mt-0.5" />{s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'ai' && <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-500 flex items-center justify-center shrink-0"><Bot size={16} className="text-white" /></div>}
                <div className={`max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-teal-500/10 border border-teal-500/20 text-white' : 'glass-card text-slate-200'}`}>
                  {msg.text.split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className="text-teal-400">{part}</strong> : part)}
                </div>
                {msg.role === 'user' && <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0"><User size={16} className="text-white" /></div>}
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex gap-3"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-500 flex items-center justify-center"><Bot size={16} className="text-white" /></div>
              <div className="glass-card p-4 rounded-2xl"><Loader2 size={18} className="text-teal-400 animate-spin" /></div></div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t border-white/5 bg-[var(--background)]/80 backdrop-blur-xl">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-3 max-w-3xl mx-auto">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about your supply chain..." className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30" disabled={loading} />
            <button type="submit" disabled={loading || !input.trim()} className="btn-teal px-5 flex items-center gap-2 disabled:opacity-30"><Send size={16} /></button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
