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

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    const success = await login(username, password);
    setIsLoggingIn(false);
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PharmaChain</h1>
          <p className="text-xs text-gray-400 mt-1">AI-Powered Supply Chain Guardian</p>
        </div>

        <div className="card p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 text-sm text-gray-900 placeholder:text-gray-400" required />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 text-sm text-gray-900 placeholder:text-gray-400" required />
              </div>
            </div>
            <button type="submit" disabled={isLoggingIn}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-40 shadow-sm">
              {isLoggingIn ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-4">Google Solution Challenge 2026 · SDG 3</p>
      </motion.div>
    </div>
  );
};

export default Login;
