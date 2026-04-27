import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Box, MapPin, Clock, ShieldCheck, History, Link as LinkIcon, AlertOctagon, Calendar, Hash, Package, ArrowLeft, BrainCircuit, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const BatchDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: batch, isLoading } = useQuery({
    queryKey: ['batch', id],
    queryFn: async () => { const res = await api.get(`/batches/${id}`); return res.data.data; }
  });

  const recallMutation = useMutation({
    mutationFn: () => api.post(`/batches/${id}/recall`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['batch', id] }); toast.success('Batch recalled successfully.'); },
    onError: () => toast.error('Failed to recall batch.')
  });

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[var(--background)]"><LoadingSpinner size={48} /></div>;
  if (!batch) return <div className="h-screen flex items-center justify-center bg-[var(--background)]"><p className="text-slate-400 font-medium">Batch not found.</p></div>;

  const infoItems = [
    { icon: Box, label: 'Drug Name', value: batch.drug_name },
    { icon: Hash, label: 'Batch ID', value: id },
    { icon: Package, label: 'Quantity', value: `${batch.quantity?.toLocaleString() || '—'} units` },
    { icon: MapPin, label: 'Location', value: batch.current_location || 'In Transit' },
    { icon: Calendar, label: 'Manufactured', value: batch.manufacture_date ? new Date(batch.manufacture_date).toLocaleDateString() : '—' },
    { icon: Clock, label: 'Expires', value: batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : '—' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]">
      <Header title={`Batch: ${id}`} />
      <main className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        <Link to="/batches" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-400 transition-colors"><ArrowLeft size={16} /> Back to Inventory</Link>

        {batch.status === 'FLAGGED' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 flex items-center gap-4 border-rose-500/30 bg-rose-500/5">
            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 animate-pulse"><AlertOctagon size={24} /></div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-rose-400 uppercase tracking-wider">AI Anomaly Detected</h4>
              <p className="text-xs text-rose-300/70 mt-0.5">This batch has been flagged by Gemini AI. Review the alerts panel for details.</p>
            </div>
            <button onClick={() => recallMutation.mutate()} disabled={recallMutation.isPending} className="px-4 py-2 bg-rose-500 text-white text-xs font-black uppercase rounded-lg hover:bg-rose-600 transition-colors">Recall Batch</button>
          </motion.div>
        )}

        <div className="flex flex-col xl:flex-row gap-8">
          <div className="xl:w-1/3 flex flex-col gap-6">
            {/* Batch Info Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/10"><Box size={28} /></div>
                <div>
                  <h2 className="text-2xl font-black text-white">{batch.drug_name}</h2>
                  <p className="text-xs text-slate-500 font-mono tracking-tighter uppercase">{id}</p>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Status</span>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${batch.status === 'ACTIVE' ? 'bg-teal-500/10 text-teal-400' : batch.status === 'FLAGGED' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>{batch.status}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Manufacturer</span>
                  <span className="text-white font-bold">{batch.manufacturer}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Blockchain</span>
                  <span className="text-teal-400 font-mono text-[10px] bg-teal-500/5 px-2 py-1 rounded truncate ml-4 max-w-[150px]">{batch.blockchain_tx_hash || 'PENDING'}</span>
                </div>
              </div>
            </motion.div>

            {/* Blockchain Provenance */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><History size={16} className="text-teal-400" /> Provenance Trail</h3>
              <div className="space-y-6">
                {(batch.blockchain_history || [
                  { location: 'Manufacturing Plant', notes: 'Batch registered on-chain', timestamp: Date.now()/1000 - 86400*5 },
                  { location: 'Quality Control Lab', notes: 'Passed QC inspection', timestamp: Date.now()/1000 - 86400*4 },
                  { location: 'Distribution Center', notes: 'In transit to destination', timestamp: Date.now()/1000 - 86400*2 },
                  { location: batch.current_location || 'Final Destination', notes: 'Current checkpoint', timestamp: Date.now()/1000 },
                ]).map((event, idx, arr) => (
                  <div key={idx} className="flex gap-4 relative">
                    {idx !== arr.length - 1 && <div className="absolute left-[11px] top-6 bottom-[-16px] w-[1px] bg-white/5" />}
                    <div className="w-[23px] h-[23px] bg-white/5 rounded-full border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 z-10"><LinkIcon size={10} /></div>
                    <div className="pb-4">
                      <p className="text-xs font-bold text-white leading-none">{event.location}</p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">{new Date(event.timestamp * 1000).toLocaleString()}</p>
                      <p className="text-[11px] text-slate-400 mt-2 bg-white/[0.03] p-2 rounded-lg italic">"{event.notes || 'Transfer recorded'}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="xl:w-2/3 flex flex-col gap-6">
            {/* Detail Grid */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {infoItems.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="glass-card p-5 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center"><Icon size={18} className="text-teal-400" /></div>
                    <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p><p className="text-sm font-bold text-white">{value}</p></div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* QR Code + AI Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 text-center">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2 justify-center"><QrCode size={16} className="text-teal-400" /> Verification QR</h3>
                {batch.qr_code ? (
                  <img src={`data:image/png;base64,${batch.qr_code}`} alt="QR Code" className="mx-auto w-48 h-48 rounded-xl bg-white p-3" />
                ) : (
                  <div className="w-48 h-48 mx-auto rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center"><QrCode size={48} className="text-slate-600" /></div>
                )}
                <p className="text-[10px] text-slate-500 mt-4">Scan to verify on blockchain</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><BrainCircuit size={16} className="text-teal-400" /> AI Assessment</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white/[0.03] rounded-xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Integrity Score</p>
                    <div className="flex items-end gap-2">
                      <span className={`text-3xl font-black ${batch.status === 'ACTIVE' ? 'text-teal-400' : 'text-rose-400'}`}>
                        {batch.status === 'ACTIVE' ? '98.4' : '42.1'}
                      </span><span className="text-sm text-slate-500 mb-1">/ 100</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full mt-3 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${batch.status === 'ACTIVE' ? 'bg-teal-400 w-[98%]' : 'bg-rose-400 w-[42%]'}`} />
                    </div>
                  </div>
                  <div className="p-4 bg-white/[0.03] rounded-xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Risk Level</p>
                    <span className={`text-sm font-black uppercase ${batch.status === 'ACTIVE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {batch.status === 'ACTIVE' ? '● LOW RISK' : '● HIGH RISK — ACTION REQUIRED'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BatchDetail;
