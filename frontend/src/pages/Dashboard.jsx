import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import StatCard from '../components/Dashboard/StatCard';
import { Package, AlertTriangle, Fingerprint, Activity, BrainCircuit, TrendingUp, ArrowRight, AlertOctagon, CheckCircle2, Box, ShieldCheck } from 'lucide-react';
import { CardSkeleton } from '../components/shared/LoadingSpinner';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => { const res = await api.get('/batches/stats/overview'); return res.data.data; },
    refetchInterval: 15000
  });
  const { data: alertsData } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: async () => { const res = await api.get('/alerts/'); return res.data.data; }
  });
  const { data: batchesData } = useQuery({
    queryKey: ['dashboard-batches'],
    queryFn: async () => { const res = await api.get('/batches/?page=1'); return res.data.data; }
  });

  const alerts = alertsData?.items || [];
  const batches = batchesData?.items || [];

  const pieData = [
    { name: 'Active', value: stats?.active || 0, color: '#14b8a6' },
    { name: 'Flagged', value: stats?.flagged || 0, color: '#f43f5e' },
    { name: 'Recalled', value: stats?.recalled || 0, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  const barData = batches.slice(0, 5).map(b => ({
    name: b.drug_name?.split(' ')[0] || b.batch_id,
    qty: b.quantity || 5000,
    status: b.status
  }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]">
      <Header title="Mission Control" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (<><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></>) : (<>
            <StatCard title="Active Shipments" value={stats?.active || 0} icon={Package} color="teal" trend={5.2} />
            <StatCard title="AI Flagged" value={stats?.flagged || 0} icon={AlertTriangle} color="red" trend={stats?.flagged > 0 ? 2.1 : -1.4} />
            <StatCard title="Trust Score" value={stats?.total_batches > 0 ? (100 - ((stats?.flagged||0) / stats.total_batches * 100)).toFixed(1) : "100.0"} unit="%" icon={Fingerprint} color="teal" />
            <StatCard title="Total Batches" value={stats?.total_batches || 0} icon={Activity} color="indigo" />
          </>)}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <TrendingUp size={16} className="text-teal-400" /> Batch Status
            </h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie><Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }} /></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {pieData.map(d => (<div key={d.name} className="flex items-center gap-2 text-xs"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-slate-400 font-medium">{d.name} ({d.value})</span></div>))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 xl:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <Package size={16} className="text-indigo-400" /> Inventory Volume
            </h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }} formatter={(v) => [`${v.toLocaleString()} units`, 'Qty']} />
                  <Bar dataKey="qty" radius={[8, 8, 0, 0]}>{barData.map((e, i) => <Cell key={i} fill={e.status === 'FLAGGED' ? '#f43f5e' : '#14b8a6'} fillOpacity={0.8} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2"><BrainCircuit size={16} className="text-rose-400" /> AI Threat Detection</h3>
              <Link to="/alerts" className="text-[10px] font-bold text-teal-400 hover:text-teal-300 uppercase tracking-wider flex items-center gap-1">View All <ArrowRight size={12} /></Link>
            </div>
            <div className="p-4 space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar">
              {alerts.length === 0 ? (
                <div className="p-8 text-center"><ShieldCheck size={32} className="text-teal-400 mx-auto mb-3" /><p className="text-sm text-slate-400">All systems nominal</p></div>
              ) : alerts.slice(0, 5).map(alert => (
                <div key={alert.id} className={`p-4 rounded-xl border ${alert.is_acknowledged ? 'bg-white/[0.02] border-white/5 opacity-60' : 'bg-rose-500/5 border-rose-500/20'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${alert.is_acknowledged ? 'bg-slate-500/10 text-slate-500' : 'bg-rose-500/10 text-rose-400'}`}><AlertOctagon size={18} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-white uppercase">{alert.anomaly_type}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${alert.severity === 'CRITICAL' ? 'bg-rose-500 text-white' : 'bg-orange-500/20 text-orange-400'}`}>{alert.severity}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{alert.batch_id}</p>
                    </div>
                    {alert.is_acknowledged && <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-1" />}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card overflow-hidden">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2"><Box size={16} className="text-indigo-400" /> Recent Batches</h3>
              <Link to="/batches" className="text-[10px] font-bold text-teal-400 hover:text-teal-300 uppercase tracking-wider flex items-center gap-1">View All <ArrowRight size={12} /></Link>
            </div>
            <div className="divide-y divide-white/5">
              {batches.slice(0, 5).map(batch => (
                <Link key={batch.id} to={`/batches/${batch.batch_id}`} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center"><Package size={18} /></div>
                    <div><p className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">{batch.drug_name}</p><p className="text-[10px] text-slate-500 font-mono">{batch.batch_id}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${batch.status === 'ACTIVE' ? 'bg-teal-500/10 text-teal-400' : batch.status === 'FLAGGED' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>{batch.status}</span>
                    <ArrowRight size={16} className="text-slate-600 group-hover:text-teal-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
