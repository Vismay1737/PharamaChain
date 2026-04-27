import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { 
  AlertOctagon, 
  ShieldAlert, 
  CheckCircle2, 
  Eye, 
  Filter,
  BrainCircuit,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Alerts = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await api.get('/alerts/');
      return res.data.data;
    }
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id) => api.put(`/alerts/${id}/acknowledge`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert acknowledged and archived.');
    }
  });

  const alerts = data?.items || [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]">
      <Header title="AI Safety Alerts" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <BrainCircuit size={18} className="text-teal-400" />
                Gemini AI Detection Archive
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 glass-card text-xs font-bold text-slate-400 hover:text-white transition-all hover:border-teal-500/30">
                <Filter size={14} /> FILTER BY SEVERITY
            </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
                <div className="p-20 flex justify-center"><LoadingSpinner size={40} /></div>
            ) : alerts.length === 0 ? (
                /* Beautiful empty state */
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-16 text-center relative overflow-hidden"
                >
                    {/* Decorative background */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/5 blur-[100px] rounded-full" />
                    
                    <div className="relative z-10">
                        <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20 flex items-center justify-center">
                            <ShieldCheck size={48} className="text-teal-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3">All Systems Nominal</h3>
                        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed mb-8">
                            Gemini AI is actively monitoring all active shipments. No anomalies have been detected in the current sensor telemetry stream.
                        </p>
                        
                        <div className="flex items-center justify-center gap-8 text-xs">
                            <div className="flex items-center gap-2 text-teal-400">
                                <Activity size={14} className="animate-pulse" />
                                <span className="font-bold uppercase tracking-wider">AI Monitoring Active</span>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400">
                                <Sparkles size={14} />
                                <span className="font-bold uppercase tracking-wider">0 Threats Detected</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <AnimatePresence>
                {alerts.map((alert, idx) => (
                    <motion.div 
                        key={alert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`glass-card p-6 border-l-4 transition-all hover:scale-[1.01] ${
                            alert.is_acknowledged ? 'border-slate-600 opacity-60' : 'border-rose-500 glow-red'
                        }`}
                    >
                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                    alert.is_acknowledged ? 'bg-slate-500/10 text-slate-500' : 'bg-rose-500/10 text-rose-400 animate-pulse'
                                }`}>
                                    <AlertOctagon size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-black text-white uppercase tracking-tight">{alert.anomaly_type}</h4>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                                            alert.severity === 'CRITICAL' ? 'bg-rose-500 text-white' : 
                                            alert.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                                            'bg-amber-500/20 text-amber-400'
                                        }`}>{alert.severity}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-mono mb-3">BATCH: {alert.batch_id}</p>
                                    <div className="glass-card p-4 text-xs text-slate-300 leading-relaxed italic relative">
                                        <BrainCircuit size={14} className="absolute -top-2 -right-2 text-teal-400" />
                                        "{alert.gemini_analysis || alert.root_cause}"
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row lg:flex-col justify-between items-end gap-4 min-w-[200px]">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Detection Time</p>
                                    <p className="text-xs font-bold text-white">{new Date(alert.created_at).toLocaleString()}</p>
                                </div>
                                
                                {!alert.is_acknowledged ? (
                                    <button 
                                        onClick={() => acknowledgeMutation.mutate(alert.id)}
                                        className="btn-teal flex items-center gap-2 w-full justify-center"
                                    >
                                        <CheckCircle2 size={16} /> ACKNOWLEDGE
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase glass-card px-4 py-2">
                                        <UserCheck size={14} /> ACKNOWLEDGED BY {alert.acknowledged_by || 'SYSTEM'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>
            )}
        </div>
      </main>
    </div>
  );
};

export default Alerts;
