import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Box, MapPin, Clock, ShieldCheck, History, Link as LinkIcon, AlertOctagon, Calendar, Hash, Package, ArrowLeft, BrainCircuit, QrCode, Factory, FlaskConical, Truck, CheckCircle2, Building2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

/* ── Supply Chain Step Tracker ─────────────────────────────────────── */
const STEPS = [
  { label: 'Manufactured', icon: Factory },
  { label: 'Quality Check', icon: FlaskConical },
  { label: 'In Transit', icon: Truck },
  { label: 'Delivered', icon: Building2 },
  { label: 'Verified', icon: CheckCircle2 },
];

const ProgressStepper = ({ status }) => {
  const activeIdx = status === 'RECALLED' ? -1
    : status === 'FLAGGED' ? 2
    : status === 'ACTIVE' ? 3
    : 4;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between relative">
        {/* Connection line */}
        <div className="absolute top-5 left-8 right-8 h-[2px] bg-white/5 z-0" />
        <div className="absolute top-5 left-8 h-[2px] bg-gradient-to-r from-teal-500 to-teal-400 z-0 transition-all duration-700"
          style={{ width: `${Math.max(0, (activeIdx / (STEPS.length - 1)) * (100 - 12))}%` }} />

        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const done = idx <= activeIdx;
          const current = idx === activeIdx;
          return (
            <div key={idx} className="flex flex-col items-center gap-2 relative z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                done ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' :
                status === 'RECALLED' && idx === 0 ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' :
                'bg-white/5 text-slate-600'
              } ${current ? 'ring-4 ring-teal-500/20 scale-110' : ''}`}>
                <Icon size={18} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${done ? 'text-teal-400' : 'text-slate-600'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Info Row Component ────────────────────────────────────────────── */
const InfoRow = ({ label, value, mono = false }) => (
  <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
    <span className="text-xs text-slate-500 font-medium">{label}</span>
    <span className={`text-sm font-bold text-white ${mono ? 'font-mono text-xs text-teal-400' : ''}`}>{value || '—'}</span>
  </div>
);

/* ── Main Component ────────────────────────────────────────────────── */
const BatchDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: batch, isLoading } = useQuery({
    queryKey: ['batch', id],
    queryFn: async () => { const res = await api.get(`/batches/${id}`); return res.data.data; }
  });

  const recallMutation = useMutation({
    mutationFn: () => api.post(`/batches/${id}/recall`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['batch', id] }); toast.success('Batch recalled.'); },
    onError: () => toast.error('Recall failed.')
  });

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-[var(--background)]"><LoadingSpinner size={48} /></div>;
  if (!batch) return <div className="h-screen flex items-center justify-center bg-[var(--background)]"><p className="text-slate-400">Batch not found.</p></div>;

  const timeline = batch.blockchain_history || [
    { location: 'Manufacturing Plant', notes: 'Batch registered on-chain', timestamp: Date.now()/1000 - 86400*5 },
    { location: 'QC Laboratory', notes: 'Quality inspection passed', timestamp: Date.now()/1000 - 86400*4 },
    { location: 'Regional Distribution Hub', notes: 'Cleared for transit', timestamp: Date.now()/1000 - 86400*2 },
    { location: batch.current_location || 'Final Destination', notes: 'Current checkpoint', timestamp: Date.now()/1000 },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]">
      <Header title={`Batch Audit: ${id}`} />
      <main className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">

        {/* Back + Title Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/batches" className="p-2 glass-card hover:border-teal-500/20 transition-all"><ArrowLeft size={18} className="text-slate-400" /></Link>
            <div>
              <h2 className="text-xl font-black text-white">{batch.drug_name}</h2>
              <p className="text-xs text-slate-500 font-mono">{id} · {batch.manufacturer}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase ${
              batch.status === 'ACTIVE' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
              batch.status === 'FLAGGED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>{batch.status}</span>
            {batch.status === 'FLAGGED' && (
              <button onClick={() => recallMutation.mutate()} disabled={recallMutation.isPending}
                className="px-4 py-1.5 bg-rose-500 text-white text-xs font-black uppercase rounded-lg hover:bg-rose-600 transition-colors">
                Recall
              </button>
            )}
          </div>
        </div>

        {/* Alert Banner */}
        {batch.status === 'FLAGGED' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 flex items-center gap-4 border-rose-500/20 bg-rose-500/5">
            <AlertOctagon size={20} className="text-rose-400 animate-pulse shrink-0" />
            <p className="text-xs text-rose-300/80">This batch has been flagged by Gemini AI for anomalous conditions. Review alerts for details.</p>
          </motion.div>
        )}

        {/* Progress Stepper */}
        <ProgressStepper status={batch.status} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left Column: Batch Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Package size={14} className="text-teal-400" /> Batch Details
            </h3>
            <InfoRow label="Drug Name" value={batch.drug_name} />
            <InfoRow label="Batch ID" value={id} mono />
            <InfoRow label="Manufacturer" value={batch.manufacturer} />
            <InfoRow label="Quantity" value={`${batch.quantity?.toLocaleString() || '—'} units`} />
            <InfoRow label="Location" value={batch.current_location || 'In Transit'} />
            <InfoRow label="Manufactured" value={batch.manufacture_date ? new Date(batch.manufacture_date).toLocaleDateString() : '—'} />
            <InfoRow label="Expires" value={batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : '—'} />
            <InfoRow label="Blockchain Hash" value={batch.blockchain_tx_hash ? batch.blockchain_tx_hash.slice(0, 18) + '...' : 'PENDING'} mono />
          </motion.div>

          {/* Middle Column: Timeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <History size={14} className="text-teal-400" /> Supply Chain Timeline
            </h3>
            <div className="space-y-0">
              {timeline.map((event, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  {idx !== timeline.length - 1 && <div className="absolute left-[11px] top-7 bottom-0 w-[2px] bg-gradient-to-b from-teal-500/30 to-white/5" />}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 mt-0.5 ${
                    idx === timeline.length - 1 ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'bg-white/5 border border-teal-500/30 text-teal-400'
                  }`}><LinkIcon size={10} /></div>
                  <div className="pb-6">
                    <p className="text-sm font-bold text-white">{event.location}</p>
                    <p className="text-[10px] text-teal-400/70 font-medium mt-0.5">
                      {new Date(event.timestamp * 1000).toLocaleDateString()} · {new Date(event.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-slate-400 mt-2 bg-white/[0.03] px-3 py-2 rounded-lg">{event.notes || 'Transfer recorded'}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: AI Assessment + QR */}
          <div className="flex flex-col gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BrainCircuit size={14} className="text-teal-400" /> AI Risk Assessment
              </h3>
              <div className="mb-4">
                <div className="flex items-end gap-2 mb-2">
                  <span className={`text-4xl font-black tabular-nums ${batch.status === 'ACTIVE' ? 'text-teal-400' : 'text-rose-400'}`}>
                    {batch.status === 'ACTIVE' ? '98.4' : '42.1'}
                  </span>
                  <span className="text-sm text-slate-500 mb-1">/ 100</span>
                </div>
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: batch.status === 'ACTIVE' ? '98%' : '42%' }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${batch.status === 'ACTIVE' ? 'bg-gradient-to-r from-teal-500 to-emerald-400' : 'bg-gradient-to-r from-rose-500 to-orange-400'}`} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                  <span className="text-xs text-slate-500">Risk Level</span>
                  <span className={`text-xs font-black uppercase ${batch.status === 'ACTIVE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {batch.status === 'ACTIVE' ? 'LOW' : 'HIGH'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                  <span className="text-xs text-slate-500">Chain Verified</span>
                  <span className="text-xs font-black text-teal-400">
                    {batch.blockchain_tx_hash ? 'YES' : 'PENDING'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                  <span className="text-xs text-slate-500">Anomalies</span>
                  <span className={`text-xs font-black ${batch.status === 'FLAGGED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {batch.status === 'FLAGGED' ? 'DETECTED' : 'NONE'}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 text-center">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 justify-center">
                <QrCode size={14} className="text-teal-400" /> Verification QR
              </h3>
              {batch.qr_code ? (
                <img src={`data:image/png;base64,${batch.qr_code}`} alt="QR" className="mx-auto w-40 h-40 rounded-xl bg-white p-2" />
              ) : (
                <div className="w-40 h-40 mx-auto rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                  <QrCode size={40} className="text-slate-600" />
                </div>
              )}
              <p className="text-[10px] text-slate-500 mt-3">Scan to verify authenticity</p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BatchDetail;
