import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Plus, ChevronRight, Box, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import RegisterBatchModal from '../components/Batches/RegisterBatchModal';

const Batches = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['batches', page, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page });
      if (status) params.append('status', status);
      const res = await api.get(`/batches/?${params.toString()}`);
      return res.data.data;
    }
  });

  const getStatusStyle = (s) => {
    switch(s) {
      case 'ACTIVE': return 'bg-green-50 text-green-600';
      case 'FLAGGED': return 'bg-red-50 text-red-500';
      case 'RECALLED': return 'bg-amber-50 text-amber-600';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]">
      <Header title="Batch Inventory" />
      <main className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-2">
            {['', 'ACTIVE', 'FLAGGED', 'RECALLED'].map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all border ${
                  status === s ? 'bg-green-500 text-white border-green-500 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:border-green-300'
                }`}>{s || 'ALL'}</button>
            ))}
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Register Batch
          </button>
        </div>

        <RegisterBatchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="p-16 flex justify-center"><LoadingSpinner size={36} /></div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-100">
                <tr>
                  {['Drug', 'Batch ID', 'Manufacturer', 'Status', 'Location', ''].map(h => (
                    <th key={h} className="px-5 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.items?.map(batch => (
                  <tr key={batch.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center"><Box size={16} /></div>
                        <span className="text-sm font-semibold text-gray-900">{batch.drug_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className="text-xs text-gray-400 font-mono">{batch.batch_id}</span></td>
                    <td className="px-5 py-4"><span className="text-xs text-gray-500">{batch.manufacturer}</span></td>
                    <td className="px-5 py-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusStyle(batch.status)}`}>{batch.status}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500"><MapPin size={12} className="text-green-500" />{batch.current_location || 'In Transit'}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5"><Clock size={10} />{new Date(batch.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link to={`/batches/${batch.batch_id}`} className="p-1.5 text-gray-300 hover:text-green-500 transition-all inline-block"><ChevronRight size={18} /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
            <p className="text-xs text-gray-400">{data?.items?.length || 0} results</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border border-gray-200 rounded text-xs font-medium text-gray-500 disabled:opacity-30 hover:bg-gray-50">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= (data?.pages || 1)} className="px-3 py-1 border border-gray-200 rounded text-xs font-medium text-gray-500 disabled:opacity-30 hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Batches;
