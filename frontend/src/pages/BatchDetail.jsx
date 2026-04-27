import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import AnomalyChart from '../components/Dashboard/AnomalyChart';
import SupplyChainMap from '../components/Dashboard/SupplyChainMap';
import { 
  Box, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  History,
  Link as LinkIcon,
  AlertOctagon
} from 'lucide-react';

const AlertBanner = ({ type, rootCause }) => (
    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-4 mb-6 animate-pulse">
        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white">
            <AlertOctagon size={24} />
        </div>
        <div>
            <h4 className="text-sm font-black text-red-500 uppercase tracking-widest">{type}</h4>
            <p className="text-xs text-red-400 font-medium">{rootCause}</p>
        </div>
    </div>
);

const BatchDetail = () => {
  const { id } = useParams();

  const { data: batch, isLoading } = useQuery({
    queryKey: ['batch', id],
    queryFn: async () => {
      const res = await api.get(`/batches/${id}`);
      return res.data.data;
    }
  });

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-navy-900"><LoadingSpinner size={48} /></div>;
  if (!batch) return (
    <div className="h-screen flex items-center justify-center bg-navy-900">
      <p className="text-slate-400 font-medium">Batch not found or failed to load.</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]">
      <Header title={`Batch Audit: ${id}`} />

      <main className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {batch.status === 'FLAGGED' && (
            <AlertBanner type="AI Anomaly Detected" rootCause="Temperature excursion beyond 8°C threshold detected in transit." />
        )}

        {/* Top Header Section */}
        <div className="flex flex-col xl:flex-row gap-8">
            <div className="xl:w-1/3 flex flex-col gap-6">
                <div className="glass-card p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                            <Box size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white">{batch.drug_name}</h2>
                            <p className="text-xs text-slate-500 font-mono tracking-tighter uppercase">{id}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-navy-700">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Current Status</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                batch.status === 'ACTIVE' ? 'bg-teal-500/10 text-teal-500' : 'bg-red-500/10 text-red-500'
                            }`}>{batch.status}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Manufacturer</span>
                            <span className="text-white font-bold">{batch.manufacturer}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Blockchain Pointer</span>
                            <span className="text-teal-400 font-mono text-[10px] bg-teal-500/5 px-2 py-1 rounded truncate ml-4 max-w-[150px]">
                                {batch.blockchain_tx_hash || 'PENDING SIGNATURE'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <History size={16} className="text-teal-500" />
                        Blockchain Provenance
                    </h3>
                    <div className="space-y-6">
                        {batch.blockchain_history?.map((event, idx) => (
                            <div key={idx} className="flex gap-4 relative">
                                {idx !== batch.blockchain_history.length - 1 && (
                                    <div className="absolute left-[11px] top-6 bottom-[-16px] w-[1px] bg-navy-700"></div>
                                )}
                                <div className="w-[23px] h-[23px] bg-navy-800 rounded-full border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 z-10">
                                    <LinkIcon size={12} />
                                </div>
                                <div className="pb-4">
                                    <p className="text-xs font-bold text-white leading-none">{event.location}</p>
                                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">{new Date(event.timestamp * 1000).toLocaleString()}</p>
                                    <p className="text-[11px] text-slate-400 mt-2 bg-navy-800/50 p-2 rounded-lg italic">"{event.notes || 'Routine transfer recorded on-chain.'}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="xl:w-2/3 flex flex-col gap-8">
                <div className="h-[400px]">
                    <SupplyChainMap logs={batch.sensor_history} center={[batch.sensor_history?.[0]?.latitude || 19.07, batch.sensor_history?.[0]?.longitude || 72.87]} />
                </div>
                <div className="h-[350px]">
                    <AnomalyChart data={batch.sensor_history} />
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default BatchDetail;
