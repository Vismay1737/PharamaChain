import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    const success = await login(username, password);
    setIsLoggingIn(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Decorative Blurs */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full" />

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card p-10 relative z-10 border-white/5"
        >
            <div className="text-center mb-10">
                <div className="w-20 h-20 bg-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-teal-500/40 rotate-12">
                    <ShieldCheck size={40} className="text-white -rotate-12" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight">Pharma<span className="text-teal-400">Chain</span></h1>
                <p className="text-slate-500 text-sm font-medium mt-2">DECENTRALIZED SUPPLY CHAIN VIGILANCE</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Identity Node</label>
                    <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="username"
                            className="w-full bg-navy-800 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all text-white placeholder:text-slate-600"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Access Cipher</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-navy-800 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all text-white placeholder:text-slate-600"
                            required
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoggingIn}
                    className="w-full btn-teal py-4 text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2 group"
                >
                    {isLoggingIn ? 'Verifying Cipher...' : (
                        <>
                            Initialize Session
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-12 flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    NODE-SECURED
                </div>
                <div>AES-256-GCM ACTIVE</div>
            </div>
        </motion.div>
    </div>
  );
};

export default Login;
