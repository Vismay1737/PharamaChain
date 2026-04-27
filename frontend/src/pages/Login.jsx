import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Lock, User as UserIcon, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    const success = await login(username, password);
    setIsLoggingIn(false);
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#060a14] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-[-20%] right-[-15%] w-[600px] h-[600px] bg-teal-500/8 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-15%] w-[500px] h-[500px] bg-indigo-500/5 blur-[150px] rounded-full" />
      <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-rose-500/3 blur-[100px] rounded-full" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(20,184,166,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10">

        {/* Logo Section */}
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-teal-500/30 rotate-6">
            <ShieldCheck size={38} className="text-white -rotate-6" />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight">Pharma<span className="text-teal-400">Chain</span></h1>
          <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-[0.3em] flex items-center justify-center gap-1.5">
            <Zap size={10} className="text-teal-400" /> AI-Powered Supply Chain Guardian
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 border-white/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username"
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 transition-all text-white placeholder:text-slate-700 text-sm" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password"
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 transition-all text-white placeholder:text-slate-700 text-sm" required />
              </div>
            </div>

            <button type="submit" disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-400 text-white py-4 rounded-xl text-sm font-black tracking-widest uppercase flex items-center justify-center gap-2 group shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:translate-y-[-1px] active:translate-y-0 transition-all disabled:opacity-40">
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-8 flex justify-between items-center text-[9px] text-slate-600 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" /> Secured
            </div>
            <div>AES-256 · Blockchain Verified</div>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-700 mt-6">
          Google Solution Challenge 2026 · SDG 3: Good Health
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
