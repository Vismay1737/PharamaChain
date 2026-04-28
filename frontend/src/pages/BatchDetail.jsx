import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Box, MapPin, Clock, ShieldCheck, History, Link as LinkIcon, AlertOctagon, Calendar, Hash, Package, ArrowLeft, BrainCircuit, QrCode, Factory, FlaskConical, Truck, CheckCircle2, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const STEPS = [
  { label: 'Processing', icon: Factory },
  { label: 'Packaging', icon: FlaskConical },
  { label: 'In Transit', icon: Truck },
  { label: 'Delivery', icon: Building2 },
  { label: 'Verified', icon: CheckCircle2 },
];

const ProgressStepper = ({ status }) => {
  const activeIdx = status === 'RECALLED' ? -1 : status === 'FLAGGED' ? 2 : status === 'ACTIVE' ? 3 : 4;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-[18px] left-8 right-8 h-[3px] t-bg z-0" />
        <div className="absolute top-[18px] left-8 h-[3px] bg-green-500 z-0 transition-all duration-700 rounded-full"
          style={{ width: `${Math.max(0, (activeIdx / (STEPS.length - 1)) * (100 - 12))}%` }} />
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const done = idx <= activeIdx;
          return (
            <div key={idx} className="flex flex-col items-center gap-2 relative z-10">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                done ? 'bg-green-500 border-green-500 text-white' : 't-card t-border t-text-muted'
              }`}><Icon size={16} /></div>
              <span className={`text-[10px] font-semibold ${done ? 'dark:text-green-400 text-green-600' : 't-text-muted'}`}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, mono = false }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-xs t-text-muted">{label}</span>
    <span className={`text-sm font-semibold ${mono ? 'font-mono text-xs dark:text-green-400 text-green-600' : 't-text'}`}>{value || '—'}</span>
  </div>
);

const BatchDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: batch, isLoading } = useQuery({
    queryKey: ['batch', id],
    queryFn: async () => { const res = await api.get(`/batches/${id}`); return res.data.data; }
  });
  const recallMutation = useMutation({
    mutationFn: () => api.post(`/batches/${id}/recall`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['batch', id] }); toast.success('Batch recalled.'); }
  });

  if (isLoading) return <div className="h-screen flex items-center justify-center"><LoadingSpinner size={36} /></div>;
  if (!batch) return <div className="h-screen flex items-center justify-center"><p className="t-text-muted">Not found.</p></div>;

  const timeline = batch.blockchain_history || [
    { location: 'Manufacturing Plant', notes: 'Batch registered', timestamp: Date.now()/1000 - 86400*5 },
    { location: 'QC Laboratory', notes: 'Quality check passed', timestamp: Date.now()/1000 - 86400*4 },
    { location: 'Distribution Hub', notes: 'Cleared for transit', timestamp: Date.now()/1000 - 86400*2 },
    { location: batch.current_location || 'Destination', notes: 'Current checkpoint', timestamp: Date.now()/1000 },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden t-bg">
      <Header title={`Batch: ${id}`} />
      <main className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Link to="/batches" className="text-xs t-text-muted hover:dark:text-green-400 text-green-600 flex items-center gap-1"><ArrowLeft size={14} /> Back</Link>
          <span className="text-gray-300">›</span>
          <span className="text-xs font-semibold t-text">{batch.drug_name} · {id}</span>
          {batch.status === 'FLAGGED' && <button onClick={() => recallMutation.mutate()} className="ml-auto px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600">Recall</button>}
        </div>

        {batch.status === 'FLAGGED' && (
          <div className="card p-4 flex items-center gap-3 dark:border-red-500/30 border-red-200 dark:bg-red-500/10 bg-red-50">
            <AlertOctagon size={18} className="dark:text-red-400 text-red-500 shrink-0" />
            <p className="text-xs text-red-600">AI flagged this batch for anomalous conditions. Check alerts for details.</p>
          </div>
        )}

        <ProgressStepper status={batch.status} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
            <h3 className="text-xs font-semibold t-text-muted uppercase tracking-wider mb-3 flex items-center gap-2"><Package size={14} className="dark:text-green-400 text-green-500" /> Batch Details</h3>
            <InfoRow label="Drug Name" value={batch.drug_name} />
            <InfoRow label="Batch ID" value={id} mono />
            <InfoRow label="Manufacturer" value={batch.manufacturer} />
            <InfoRow label="Quantity" value={`${batch.quantity?.toLocaleString() || '—'} units`} />
            <InfoRow label="Location" value={batch.current_location || 'In Transit'} />
            <InfoRow label="Manufactured" value={batch.manufacture_date ? new Date(batch.manufacture_date).toLocaleDateString() : '—'} />
            <InfoRow label="Expires" value={batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : '—'} />
            <InfoRow label="Chain Hash" value={batch.blockchain_tx_hash ? batch.blockchain_tx_hash.slice(0, 18) + '...' : 'PENDING'} mono />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-5">
            <h3 className="text-xs font-semibold t-text-muted uppercase tracking-wider mb-4 flex items-center gap-2"><History size={14} className="dark:text-green-400 text-green-500" /> Supply Chain Timeline</h3>
            <div className="space-y-0">
              {timeline.map((event, idx) => (
                <div key={idx} className="flex gap-3 relative">
                  {idx !== timeline.length - 1 && <div className="absolute left-[9px] top-6 bottom-0 w-[2px] t-bg" />}
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 mt-0.5 ${
                    idx === timeline.length - 1 ? 'bg-green-500 text-white' : 't-card border-2 dark:border-green-500/30 border-green-200 dark:text-green-400 text-green-500'
                  }`}><LinkIcon size={8} /></div>
                  <div className="pb-5">
                    <p className="text-sm font-semibold t-text">{event.location}</p>
                    <p className="text-[10px] t-text-muted mt-0.5">{new Date(event.timestamp * 1000).toLocaleDateString()} · {new Date(event.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-xs t-text-secondary mt-1.5 t-bg px-3 py-1.5 rounded-lg">{event.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="flex flex-col gap-5">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
              <h3 className="text-xs font-semibold t-text-muted uppercase tracking-wider mb-3 flex items-center gap-2"><BrainCircuit size={14} className="dark:text-green-400 text-green-500" /> AI Assessment</h3>
              <div className="mb-3">
                <div className="flex items-end gap-1.5 mb-2">
                  <span className={`text-3xl font-bold ${batch.status === 'ACTIVE' ? 'dark:text-green-400 text-green-600' : 'dark:text-red-400 text-red-500'}`}>{batch.status === 'ACTIVE' ? '98' : '42'}</span>
                  <span className="text-sm t-text-muted mb-0.5">/ 100</span>
                </div>
                <div className="w-full h-2 t-bg rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: batch.status === 'ACTIVE' ? '98%' : '42%' }} transition={{ duration: 1 }}
                    className={`h-full rounded-full ${batch.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
              </div>
              {[{ l: 'Risk', v: batch.status === 'ACTIVE' ? 'Low' : 'High', c: batch.status === 'ACTIVE' ? 'dark:text-green-400 text-green-600' : 'dark:text-red-400 text-red-500' },
                { l: 'Chain', v: batch.blockchain_tx_hash ? 'Verified' : 'Pending', c: 'dark:text-green-400 text-green-600' },
                { l: 'Anomalies', v: batch.status === 'FLAGGED' ? 'Detected' : 'None', c: batch.status === 'FLAGGED' ? 'dark:text-red-400 text-red-500' : 'dark:text-green-400 text-green-600' }
              ].map(r => (
                <div key={r.l} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs t-text-muted">{r.l}</span>
                  <span className={`text-xs font-bold ${r.c}`}>{r.v}</span>
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-5 text-center">
              <h3 className="text-xs font-semibold t-text-muted uppercase tracking-wider mb-3 flex items-center gap-2 justify-center"><QrCode size={14} className="dark:text-green-400 text-green-500" /> QR Code</h3>
              <div className="w-36 h-36 mx-auto rounded-lg t-bg border border-dashed t-border flex items-center justify-center">
                <QrCode size={36} className="text-gray-300" />
              </div>
              <p className="text-[10px] t-text-muted mt-2">Scan to verify</p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BatchDetail;
