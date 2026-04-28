import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import { Search, ShieldCheck, ShieldAlert, Box, MapPin, Calendar, Clock, Hash, FileCheck, AlertOctagon, History, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const VerifyDrug = () => {
  const [batchId, setBatchId] = useState('');
  const [searchId, setSearchId] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [reportDetails, setReportDetails] = useState('');

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['verify', searchId],
    queryFn: async () => { const res = await api.get(`/batches/${searchId}/verify`); return res.data.data; },
    enabled: !!searchId,
    retry: false
  });

  const reportMutation = useMutation({
    mutationFn: async (data) => { await api.post('/alerts/report', data); },
    onSuccess: () => {
      toast.success('Report submitted successfully. Thank you for keeping the supply chain safe.');
      setIsReporting(false);
      setReportDetails('');
    },
    onError: () => toast.error('Failed to submit report. Please try again.')
  });

  const handleSearch = (e) => { e.preventDefault(); if (batchId.trim()) setSearchId(batchId.trim().toUpperCase()); };

  const submitReport = (e) => {
    e.preventDefault();
    if (!reportDetails.trim()) return;
    reportMutation.mutate({ batch_id: searchId, issue_type: 'COUNTERFEIT_SUSPICION', details: reportDetails });
  };

  const timeline = result?.blockchain_history || [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden t-bg">
      <Header title="Verify Drug" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-xl mx-auto pb-12">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl dark:bg-green-500/10 bg-green-50 border dark:border-green-500/20 border-green-100 flex items-center justify-center"><FileCheck size={28} className="dark:text-green-400 text-green-500" /></div>
            <h2 className="text-xl font-bold t-text mb-1">Drug Authenticity Verification</h2>
            <p className="text-sm t-text-muted">Enter a batch ID to verify against the blockchain ledger</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2.5 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 t-text-muted" size={16} />
              <input value={batchId} onChange={e => setBatchId(e.target.value)} placeholder="e.g., PC-2847"
                className="w-full t-card border t-border rounded-lg pl-10 pr-4 py-3 t-text placeholder:t-text-muted outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-300 text-sm font-mono" />
            </div>
            <button type="submit" className="btn-primary px-6 font-bold">Verify</button>
          </form>
          {!searchId && (
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              <p className="text-[11px] t-text-muted w-full text-center mb-1">Try these:</p>
              {['PC-2847', 'PC-2601', 'PC-2901', 'PC-3101', 'PC-3201'].map(id => (
                <button key={id} onClick={() => { setBatchId(id); setSearchId(id); }} className="px-3 py-1.5 card text-xs font-mono t-text-secondary hover:dark:text-green-400 text-green-600 hover:border-green-300 transition-all">{id}</button>
              ))}
            </div>
          )}
          <AnimatePresence mode="wait">
            {isLoading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10"><div className="w-10 h-10 border-3 dark:border-green-500/30 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-3" /><p className="text-sm t-text-muted">Querying blockchain...</p></motion.div>}
            {isError && searchId && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card p-8 text-center dark:border-red-500/30 border-red-200">
                <ShieldAlert size={36} className="dark:text-red-400 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold dark:text-red-400 text-red-500 mb-1">Verification Failed</h3>
                <p className="text-sm t-text-muted">Batch <span className="font-mono font-bold t-text">{searchId}</span> not found. This drug may be counterfeit.</p>
              </motion.div>
            )}
            {result && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className={`card p-5 flex items-center gap-3 ${result.status === 'ACTIVE' ? 'dark:border-green-500/30 border-green-200' : 'dark:border-red-500/30 border-red-200'}`}>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${result.status === 'ACTIVE' ? 'dark:bg-green-500/10 bg-green-50' : 'dark:bg-red-500/10 bg-red-50'}`}>
                    {result.status === 'ACTIVE' ? <ShieldCheck size={24} className="dark:text-green-400 text-green-500" /> : <AlertOctagon size={24} className="dark:text-red-400 text-red-500" />}
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${result.status === 'ACTIVE' ? 'dark:text-green-400 text-green-600' : 'dark:text-red-400 text-red-500'}`}>
                      {result.status === 'ACTIVE' ? 'VERIFIED AUTHENTIC' : `STATUS: ${result.status}`}
                    </h3>
                    <p className="text-[11px] t-text-muted">Checked against immutable blockchain record</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Box, label: 'Drug', value: result.drug_name },
                    { icon: Hash, label: 'Batch', value: result.batch_id },
                    { icon: MapPin, label: 'Location', value: result.current_location || 'In Transit' },
                    { icon: Calendar, label: 'Manufactured', value: result.manufacture_date ? new Date(result.manufacture_date).toLocaleDateString() : '—' },
                    { icon: Clock, label: 'Expires', value: result.expiry_date ? new Date(result.expiry_date).toLocaleDateString() : '—' },
                    { icon: ShieldCheck, label: 'Chain Hash', value: result.blockchain_tx_hash?.slice(0, 14) + '...' || 'Pending' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="card p-3.5 flex items-center gap-2.5">
                      <div className="w-8 h-8 t-bg rounded-lg flex items-center justify-center"><Icon size={15} className="dark:text-green-400 text-green-500" /></div>
                      <div><p className="text-[10px] t-text-muted font-medium uppercase">{label}</p><p className="text-sm font-semibold t-text">{value}</p></div>
                    </div>
                  ))}
                </div>

                {timeline.length > 0 && (
                  <div className="card p-5 mt-4">
                    <h3 className="text-xs font-semibold t-text-muted uppercase tracking-wider mb-4 flex items-center gap-2"><History size={14} className="dark:text-green-400 text-green-500" /> Public Provenance Timeline</h3>
                    <div className="space-y-0 pl-2">
                      {timeline.map((event, idx) => (
                        <div key={idx} className="flex gap-3 relative">
                          {idx !== timeline.length - 1 && <div className="absolute left-[9px] top-6 bottom-0 w-[2px] t-bg" />}
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 mt-0.5 ${
                            idx === timeline.length - 1 ? 'bg-green-500 text-white' : 't-card border-2 dark:border-green-500/30 border-green-200 dark:text-green-400 text-green-500'
                          }`}><LinkIcon size={8} /></div>
                          <div className="pb-5">
                            <p className="text-sm font-semibold t-text">{event.location}</p>
                            <p className="text-[10px] t-text-muted mt-0.5">{new Date(event.timestamp * 1000).toLocaleDateString()} · {new Date(event.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="text-xs t-text-secondary mt-1.5 t-bg px-3 py-1.5 rounded-lg border t-border">{event.notes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 border-t t-border pt-6">
                  {!isReporting ? (
                    <button onClick={() => setIsReporting(true)} className="w-full card p-4 border-dashed dark:border-red-500/30 border-red-200 dark:bg-red-500/5 bg-red-50 hover:bg-red-100 dark:hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 text-sm font-semibold dark:text-red-400 text-red-600">
                      <AlertTriangle size={16} /> Report Suspected Counterfeit or Adverse Reaction
                    </button>
                  ) : (
                    <form onSubmit={submitReport} className="card p-5 dark:border-red-500/30 border-red-200">
                      <h4 className="text-sm font-bold dark:text-red-400 text-red-500 flex items-center gap-2 mb-3"><AlertTriangle size={16} /> Report Issue</h4>
                      <textarea 
                        required
                        value={reportDetails}
                        onChange={e => setReportDetails(e.target.value)}
                        placeholder="Please describe the issue (e.g., unusual packaging, adverse reaction, broken seal)..."
                        className="w-full h-24 t-bg t-text placeholder:t-text-muted border t-border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-300 resize-none mb-3"
                      />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setIsReporting(false)} className="px-4 py-2 text-xs font-semibold t-text-secondary hover:t-text transition-colors">Cancel</button>
                        <button type="submit" disabled={reportMutation.isPending} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                          {reportMutation.isPending ? 'Submitting...' : 'Submit Official Report'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default VerifyDrug;
