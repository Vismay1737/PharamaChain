import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { AlertOctagon, CheckCircle2, BrainCircuit, ShieldCheck, Sparkles, Activity, Filter, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Alerts = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['alerts'], queryFn: async () => { const res = await api.get('/alerts/'); return res.data.data; } });
  const ackMutation = useMutation({
    mutationFn: (id) => api.put(`/alerts/${id}/acknowledge`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alerts'] }); toast.success('Alert acknowledged.'); }
  });
  const alerts = data?.items || [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden t-bg">
      <Header title="AI Safety Alerts" />
      <main className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-semibold t-text-muted uppercase tracking-wider flex items-center gap-2"><BrainCircuit size={14} className="dark:text-green-400 text-green-500" /> Gemini AI Detection Archive</h3>
          <button className="flex items-center gap-1.5 px-3 py-2 card text-xs font-medium t-text-secondary hover:t-text"><Filter size={13} /> Filter</button>
        </div>
        <div className="space-y-3">
          {isLoading ? <div className="p-16 flex justify-center"><LoadingSpinner size={36} /></div>
          : alerts.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl dark:bg-green-500/10 bg-green-50 flex items-center justify-center"><ShieldCheck size={32} className="dark:text-green-400 text-green-500" /></div>
              <h3 className="text-lg font-bold t-text mb-1">All Systems Nominal</h3>
              <p className="text-sm t-text-muted max-w-sm mx-auto mb-6">Gemini AI is monitoring all shipments. No anomalies detected.</p>
              <div className="flex items-center justify-center gap-6 text-xs">
                <span className="flex items-center gap-1.5 dark:text-green-400 text-green-600"><Activity size={13} className="animate-pulse" /> Monitoring Active</span>
                <span className="flex items-center gap-1.5 dark:text-green-400 text-green-600"><Sparkles size={13} /> 0 Threats</span>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {alerts.map((alert, idx) => (
                <motion.div key={alert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                  className={`card p-5 border-l-4 ${alert.is_acknowledged ? 't-border opacity-60' : 'border-red-500'}`}>
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${alert.is_acknowledged ? 't-bg t-text-muted' : 'dark:bg-red-500/10 bg-red-50 dark:text-red-400 text-red-500'}`}><AlertOctagon size={20} /></div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-sm font-bold t-text">{alert.anomaly_type}</h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${alert.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-orange-100 text-orange-600'}`}>{alert.severity}</span>
                        </div>
                        <p className="text-[11px] t-text-muted font-mono mb-2">Batch: {alert.batch_id}</p>
                        <div className="t-bg p-3 rounded-lg text-xs t-text-secondary italic leading-relaxed relative">
                          <BrainCircuit size={12} className="absolute -top-1.5 -right-1.5 dark:text-green-400 text-green-500" />
                          "{alert.gemini_analysis || alert.root_cause}"
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row lg:flex-col justify-between items-end gap-3 min-w-[180px]">
                      <div className="text-right">
                        <p className="text-[10px] t-text-muted">Detection Time</p>
                        <p className="text-xs font-semibold t-text">{new Date(alert.created_at).toLocaleString()}</p>
                      </div>
                      {!alert.is_acknowledged ? (
                        <button onClick={() => ackMutation.mutate(alert.id)} className="btn-primary flex items-center gap-1.5 text-xs w-full justify-center"><CheckCircle2 size={14} /> Acknowledge</button>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold t-text-muted t-bg px-3 py-2 rounded-lg"><UserCheck size={12} /> By {alert.acknowledged_by || 'system'}</div>
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
