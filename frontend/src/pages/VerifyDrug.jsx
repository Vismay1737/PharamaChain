import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import { Search, ShieldCheck, ShieldAlert, Box, MapPin, Calendar, Clock, Hash, FileCheck, AlertOctagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VerifyDrug = () => {
  const [batchId, setBatchId] = useState('');
  const [searchId, setSearchId] = useState('');

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['verify', searchId],
    queryFn: async () => {
      const res = await api.get(`/batches/${searchId}/verify`);
      return res.data.data;
    },
    enabled: !!searchId,
    retry: false
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (batchId.trim()) setSearchId(batchId.trim().toUpperCase());
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]">
      <Header title="Verify Drug" />
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-2xl mx-auto">
          {/* Search Section */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/20 flex items-center justify-center">
              <FileCheck size={40} className="text-teal-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Drug Authenticity Verification</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Enter a batch ID to verify its authenticity against the blockchain ledger and AI safety records.</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input value={batchId} onChange={e => setBatchId(e.target.value)} placeholder="Enter Batch ID (e.g., PC-2847)" className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 text-sm font-mono" />
            </div>
            <button type="submit" className="btn-teal px-8 font-black">VERIFY</button>
          </form>

          {/* Quick access buttons */}
          {!searchId && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              <p className="text-xs text-slate-600 w-full text-center mb-2">Try these:</p>
              {['PC-2847', 'PC-2601', 'PC-2901', 'PC-3101', 'PC-3201'].map(id => (
                <button key={id} onClick={() => { setBatchId(id); setSearchId(id); }} className="px-3 py-1.5 glass-card text-xs font-mono text-slate-400 hover:text-teal-400 hover:border-teal-500/20 transition-all">{id}</button>
              ))}
            </div>
          )}

          {/* Results */}
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-500">Querying blockchain ledger...</p>
              </motion.div>
            )}

            {isError && searchId && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center border-rose-500/20">
                <ShieldAlert size={48} className="text-rose-400 mx-auto mb-4" />
                <h3 className="text-xl font-black text-rose-400 mb-2">VERIFICATION FAILED</h3>
                <p className="text-sm text-slate-400">Batch <span className="font-mono text-white">{searchId}</span> was not found in the blockchain registry. This drug may be counterfeit.</p>
              </motion.div>
            )}

            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Status Banner */}
                <div className={`glass-card p-6 flex items-center gap-4 ${result.status === 'ACTIVE' ? 'border-teal-500/30' : 'border-rose-500/30'}`}>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${result.status === 'ACTIVE' ? 'bg-teal-500/10' : 'bg-rose-500/10'}`}>
                    {result.status === 'ACTIVE' ? <ShieldCheck size={32} className="text-teal-400" /> : <AlertOctagon size={32} className="text-rose-400" />}
                  </div>
                  <div>
                    <h3 className={`text-xl font-black uppercase ${result.status === 'ACTIVE' ? 'text-teal-400' : 'text-rose-400'}`}>
                      {result.status === 'ACTIVE' ? 'VERIFIED AUTHENTIC' : `STATUS: ${result.status}`}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Verification performed against immutable blockchain record</p>
                  </div>
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: Box, label: 'Drug Name', value: result.drug_name },
                    { icon: Hash, label: 'Batch ID', value: result.batch_id },
                    { icon: MapPin, label: 'Location', value: result.current_location || 'In Transit' },
                    { icon: Calendar, label: 'Manufactured', value: result.manufacture_date ? new Date(result.manufacture_date).toLocaleDateString() : '—' },
                    { icon: Clock, label: 'Expires', value: result.expiry_date ? new Date(result.expiry_date).toLocaleDateString() : '—' },
                    { icon: ShieldCheck, label: 'Chain Hash', value: result.blockchain_tx_hash?.slice(0, 16) + '...' || 'PENDING' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="glass-card p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center"><Icon size={18} className="text-teal-400" /></div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                        <p className="text-sm font-bold text-white">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* QR Code */}
                {result.qr_code && (
                  <div className="glass-card p-6 text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Blockchain-Linked QR Code</p>
                    <img src={`data:image/png;base64,${result.qr_code}`} alt="QR Code" className="mx-auto w-48 h-48 rounded-xl bg-white p-2" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default VerifyDrug;
