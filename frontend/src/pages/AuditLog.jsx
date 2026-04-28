import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Database, ShieldCheck, User as UserIcon } from 'lucide-react';

const AuditLog = () => {
  const { data: batches, isLoading } = useQuery({
    queryKey: ['audit-batches'],
    queryFn: async () => { const res = await api.get('/batches/'); return res.data.data; }
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden t-bg">
      <Header title="Audit Log" />
      <main className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 dark:bg-indigo-500/10 bg-indigo-50 dark:text-indigo-400 text-indigo-500 rounded-lg flex items-center justify-center"><Database size={20} /></div>
          <div>
            <h3 className="text-sm font-bold t-text">Blockchain Provenance</h3>
            <p className="text-[11px] t-text-muted">Immutable history of all supply chain operations</p>
          </div>
        </div>
        <div className="space-y-2.5">
          {isLoading ? <div className="p-16 flex justify-center"><LoadingSpinner size={36} /></div>
          : batches?.items?.map((batch, idx) => (
            <div key={idx} className="card p-4 flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 dark:bg-green-500/10 bg-green-50 rounded-lg flex items-center justify-center dark:text-green-400 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors"><ShieldCheck size={18} /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold t-text">BLOCK_MINT_{idx + 1042}</p>
                    <span className="text-[9px] font-bold dark:text-green-400 text-green-600 dark:bg-green-500/10 bg-green-50 px-1.5 py-0.5 rounded">SUCCESS</span>
                  </div>
                  <p className="text-[11px] t-text-muted font-mono mt-0.5">{batch.drug_name} · {batch.batch_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] t-text-muted">Operator</p>
                  <div className="flex items-center gap-1 justify-end text-xs font-semibold t-text"><UserIcon size={11} className="dark:text-green-400 text-green-500" />{batch.manufacturer}</div>
                </div>
                <div className="text-right border-l t-border pl-6">
                  <p className="text-[10px] t-text-muted">Timestamp</p>
                  <p className="text-xs font-semibold t-text">{new Date(batch.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AuditLog;
