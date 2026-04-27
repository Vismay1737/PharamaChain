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
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]">
      <Header title="AI Safety Alerts" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <BrainCircuit size={18} className="text-teal-500" />
                Gemini AI Detection Archive
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-navy-800 border border-navy-700 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all">
                <Filter size={14} /> FILTER BY SEVERITY
            </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
                <div className="p-20 flex justify-center"><LoadingSpinner size={40} /></div>
            ) : (
                data?.items?.map((alert) => (
                    <div 
                        key={alert.id} 
                        className={`glass-card p-6 border-l-4 transition-all hover:bg-navy-800/20 ${
                            alert.is_acknowledged ? 'border-slate-500 opacity-60' : 'border-red-500 shadow-lg shadow-red-500/5'
                        }`}
                    >
                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                    alert.is_acknowledged ? 'bg-slate-500/10 text-slate-500' : 'bg-red-500/10 text-red-500 animate-pulse'
                                }`}>
                                    <AlertOctagon size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-black text-white uppercase tracking-tight">{alert.anomaly_type}</h4>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                                            alert.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-orange-500/20 text-orange-500'
                                        }`}>{alert.severity}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-mono mb-3">BATCH: {alert.batch_id}</p>
                                    <div className="bg-navy-900 border border-navy-700 p-4 rounded-xl text-xs text-slate-300 leading-relaxed italic relative">
                                        <BrainCircuit size={14} className="absolute -top-2 -right-2 text-teal-500" />
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
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase bg-slate-500/5 px-4 py-2 rounded-lg">
                                        <UserCheck size={14} /> ACKNOWLEDGED BY {alert.acknowledged_by || 'SYSTEM'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </main>
    </div>
  );
};

export default Alerts;
