import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { 
  Plus, 
  ChevronRight, 
  Box, 
  MapPin, 
  Clock
} from 'lucide-react';
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

  const getStatusColor = (s) => {
    switch(s) {
        case 'ACTIVE': return 'bg-teal-500/10 text-teal-500';
        case 'FLAGGED': return 'bg-amber-500/10 text-amber-500';
        case 'RECALLED': return 'bg-red-500/10 text-red-500';
        default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]">
      <Header title="Batch Inventory" />

      <main className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
                {['', 'ACTIVE', 'FLAGGED', 'RECALLED'].map(s => (
                    <button 
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                            status === s 
                            ? 'bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20' 
                            : 'bg-white dark:bg-navy-800 border-slate-200 dark:border-navy-700 text-slate-500 hover:border-teal-500/50'
                        }`}
                    >
                        {s || 'ALL'}
                    </button>
                ))}
            </div>
            
            <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-teal flex items-center gap-2"
            >
                <Plus size={18} /> Register New Batch
            </button>
        </div>

        <RegisterBatchModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
        />


        <div className="glass-card overflow-hidden">
            {isLoading ? (
                <div className="p-20 flex justify-center"><LoadingSpinner size={40} /></div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead className="bg-navy-800/20 border-b border-slate-200 dark:border-navy-700">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Drug Identity</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Batch ID</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Manufacturer</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last Checkpoint</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-navy-700">
                        {data?.items?.map((batch) => (
                            <tr key={batch.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/40 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                                            <Box size={20} />
                                        </div>
                                        <span className="font-bold text-sm text-slate-800 dark:text-white uppercase">{batch.drug_name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-xs font-mono text-slate-500">{batch.batch_id}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{batch.manufacturer}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getStatusColor(batch.status)}`}>
                                        {batch.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                                            <MapPin size={12} className="text-teal-400" />
                                            {batch.current_location}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                            <Clock size={10} />
                                            {new Date(batch.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <Link 
                                        to={`/batches/${batch.batch_id}`}
                                        className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 rounded-lg transition-all inline-block"
                                    >
                                        <ChevronRight size={20} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            
            <div className="p-4 border-t border-slate-200 dark:border-navy-700 flex justify-between items-center bg-slate-50 dark:bg-navy-800/10">
                <p className="text-xs text-slate-500 font-medium">Showing {data?.items?.length || 0} results</p>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border border-slate-200 dark:border-navy-700 rounded text-xs font-bold text-slate-500 disabled:opacity-30"
                    >
                        PREV
                    </button>
                    <button 
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= (data?.pages || 1)}
                        className="px-3 py-1 border border-slate-200 dark:border-navy-700 rounded text-xs font-bold text-slate-500 disabled:opacity-30"
                    >
                        NEXT
                    </button>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default Batches;
