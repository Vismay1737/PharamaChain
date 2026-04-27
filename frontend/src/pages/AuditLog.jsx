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
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]">
      <Header title="Audit Log" />
      <main className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center"><Database size={20} /></div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Blockchain Provenance</h3>
            <p className="text-[11px] text-gray-400">Immutable history of all supply chain operations</p>
          </div>
        </div>
        <div className="space-y-2.5">
          {isLoading ? <div className="p-16 flex justify-center"><LoadingSpinner size={36} /></div>
          : batches?.items?.map((batch, idx) => (
            <div key={idx} className="card p-4 flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors"><ShieldCheck size={18} /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-gray-900">BLOCK_MINT_{idx + 1042}</p>
                    <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">SUCCESS</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">{batch.drug_name} · {batch.batch_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">Operator</p>
                  <div className="flex items-center gap-1 justify-end text-xs font-semibold text-gray-700"><UserIcon size={11} className="text-green-500" />{batch.manufacturer}</div>
                </div>
                <div className="text-right border-l border-gray-100 pl-6">
                  <p className="text-[10px] text-gray-400">Timestamp</p>
                  <p className="text-xs font-semibold text-gray-700">{new Date(batch.created_at).toLocaleString()}</p>
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
