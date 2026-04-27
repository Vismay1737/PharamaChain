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
    queryFn: async () => { const res = await api.get(`/batches/${searchId}/verify`); return res.data.data; },
    enabled: !!searchId,
    retry: false
  });

  const handleSearch = (e) => { e.preventDefault(); if (batchId.trim()) setSearchId(batchId.trim().toUpperCase()); };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]">
      <Header title="Verify Drug" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center"><FileCheck size={28} className="text-green-500" /></div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Drug Authenticity Verification</h2>
            <p className="text-sm text-gray-400">Enter a batch ID to verify against the blockchain ledger</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2.5 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input value={batchId} onChange={e => setBatchId(e.target.value)} placeholder="e.g., PC-2847"
                className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-300 text-sm font-mono" />
            </div>
            <button type="submit" className="btn-primary px-6 font-bold">Verify</button>
          </form>
          {!searchId && (
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              <p className="text-[11px] text-gray-400 w-full text-center mb-1">Try these:</p>
              {['PC-2847', 'PC-2601', 'PC-2901', 'PC-3101', 'PC-3201'].map(id => (
                <button key={id} onClick={() => { setBatchId(id); setSearchId(id); }} className="px-3 py-1.5 card text-xs font-mono text-gray-500 hover:text-green-600 hover:border-green-300 transition-all">{id}</button>
              ))}
            </div>
          )}
          <AnimatePresence mode="wait">
            {isLoading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10"><div className="w-10 h-10 border-3 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-3" /><p className="text-sm text-gray-400">Querying blockchain...</p></motion.div>}
            {isError && searchId && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card p-8 text-center border-red-200">
                <ShieldAlert size={36} className="text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-red-500 mb-1">Verification Failed</h3>
                <p className="text-sm text-gray-400">Batch <span className="font-mono font-bold text-gray-700">{searchId}</span> not found. This drug may be counterfeit.</p>
              </motion.div>
            )}
            {result && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className={`card p-5 flex items-center gap-3 ${result.status === 'ACTIVE' ? 'border-green-200' : 'border-red-200'}`}>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${result.status === 'ACTIVE' ? 'bg-green-50' : 'bg-red-50'}`}>
                    {result.status === 'ACTIVE' ? <ShieldCheck size={24} className="text-green-500" /> : <AlertOctagon size={24} className="text-red-500" />}
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${result.status === 'ACTIVE' ? 'text-green-600' : 'text-red-500'}`}>
                      {result.status === 'ACTIVE' ? 'VERIFIED AUTHENTIC' : `STATUS: ${result.status}`}
                    </h3>
                    <p className="text-[11px] text-gray-400">Checked against immutable blockchain record</p>
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
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center"><Icon size={15} className="text-green-500" /></div>
                      <div><p className="text-[10px] text-gray-400 font-medium uppercase">{label}</p><p className="text-sm font-semibold text-gray-900">{value}</p></div>
                    </div>
                  ))}
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
