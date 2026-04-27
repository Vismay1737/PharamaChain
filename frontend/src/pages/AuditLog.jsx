import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { 
  Database, 
  History, 
  Cpu, 
  User as UserIcon,
  ShieldCheck,
  Zap
} from 'lucide-react';

const AuditLog = () => {
  const { data: batches, isLoading } = useQuery({
    queryKey: ['audit-batches'],
    queryFn: async () => {
      const res = await api.get('/batches/');
      return res.data.data;
    }
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]">
      <Header title="System Audit Ledger" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center">
                <Database size={24} />
            </div>
            <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Technical Provenance</h3>
                <p className="text-xs text-slate-500 font-medium">Irreversible history of decentralized operations and AI inferences.</p>
            </div>
        </div>

        <div className="space-y-4">
            {isLoading ? (
                <div className="p-20 flex justify-center"><LoadingSpinner size={40} /></div>
            ) : (
                batches?.items?.map((batch, idx) => (
                    <div key={idx} className="glass-card p-6 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center text-slate-500 group-hover:text-amber-400 transition-colors">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <p className="text-xs font-black text-white uppercase tracking-wider">BLOCK_MINT_{idx + 1042}</p>
                                    <span className="text-[10px] font-bold text-slate-600 bg-navy-900 px-2 py-0.5 rounded">SUCCESS</span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1 font-mono">Payload: DrugBatch registered for {batch.drug_name} (ID: {batch.batch_id})</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Operator</p>
                                <div className="flex items-center gap-1.5 justify-end text-xs font-bold text-white">
                                    <UserIcon size={12} className="text-teal-400" />
                                    {batch.manufacturer}
                                </div>
                            </div>
                            <div className="text-right border-l border-navy-700 pl-8">
                                <p className="text-[10px] font-bold text-slate-500 uppercase">Timestamp</p>
                                <p className="text-xs font-bold text-white uppercase">{new Date(batch.created_at).toLocaleString()}</p>
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

export default AuditLog;
