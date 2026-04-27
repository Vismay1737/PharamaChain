import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../contexts/AuthContext';
import Header from '../components/Layout/Header';
import StatCard from '../components/Dashboard/StatCard';
import { Package, AlertTriangle, Fingerprint, Activity, ArrowRight, AlertOctagon, CheckCircle2, Box, ShieldCheck, BrainCircuit, TrendingUp, Truck, Factory, FlaskConical } from 'lucide-react';
import { CardSkeleton } from '../components/shared/LoadingSpinner';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';

/* ── Fake 7-day activity data ────────────────────────────────── */
const activityData = [
  { day: 'Mon', shipments: 12, verified: 10, flagged: 2 },
  { day: 'Tue', shipments: 18, verified: 16, flagged: 1 },
  { day: 'Wed', shipments: 15, verified: 14, flagged: 3 },
  { day: 'Thu', shipments: 22, verified: 20, flagged: 2 },
  { day: 'Fri', shipments: 28, verified: 25, flagged: 1 },
  { day: 'Sat', shipments: 20, verified: 18, flagged: 0 },
  { day: 'Today', shipments: 25, verified: 23, flagged: 2 },
];

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
  const trustScore = stats?.total_batches > 0 ? Math.round(100 - ((stats?.flagged||0) / stats.total_batches * 100)) : 100;

  const radialData = [
    { name: 'Trust', value: trustScore, fill: trustScore > 80 ? '#22c55e' : trustScore > 50 ? '#f59e0b' : '#ef4444' }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--background)]">
      <Header title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (<><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></>) : (<>
            <StatCard title="Active Shipments" value={stats?.active || 0} icon={Package} color="green" trend={5.2} />
            <StatCard title="AI Flagged" value={stats?.flagged || 0} icon={AlertTriangle} color="red" trend={stats?.flagged > 0 ? 2.1 : -1.4} />
            <StatCard title="Verified" value={stats?.verified || 0} icon={ShieldCheck} color="blue" />
            <StatCard title="Total Batches" value={stats?.total_batches || 0} icon={Activity} color="indigo" />
          </>)}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          {/* Area Chart - Supply Chain Activity (takes 3 cols) */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card p-5 xl:col-span-3">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={14} className="text-green-500" /> Supply Chain Activity — Last 7 Days
              </h3>
              <div className="flex gap-4 text-[11px]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Shipments</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Verified</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Flagged</span>
              </div>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="gradShip" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradVerif" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="shipments" stroke="#22c55e" strokeWidth={2.5} fillOpacity={1} fill="url(#gradShip)" dot={{ fill: '#22c55e', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="verified" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#gradVerif)" dot={false} />
                  <Area type="monotone" dataKey="flagged" stroke="#ef4444" strokeWidth={2} fillOpacity={0} dot={{ fill: '#ef4444', r: 3, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Trust Score Gauge (takes 1 col) */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-5 flex flex-col items-center justify-center">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Trust Score</h3>
            <div className="h-[170px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" startAngle={210} endAngle={-30} data={radialData} barSize={12}>
                  <RadialBar background={{ fill: '#f1f5f9' }} clockWise dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-black ${trustScore > 80 ? 'text-green-600' : trustScore > 50 ? 'text-amber-500' : 'text-red-500'}`}>{trustScore}%</span>
                <span className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">{trustScore > 80 ? 'Excellent' : trustScore > 50 ? 'Moderate' : 'Critical'}</span>
              </div>
            </div>
            {/* Supply chain mini-stats */}
            <div className="w-full space-y-2 mt-2">
              {[
                { icon: Factory, label: 'Manufactured', val: stats?.total_batches || 0, color: 'text-gray-600' },
                { icon: FlaskConical, label: 'QC Passed', val: stats?.verified || 0, color: 'text-blue-500' },
                { icon: Truck, label: 'In Transit', val: stats?.active || 0, color: 'text-green-500' },
              ].map(({ icon: Icon, label, val, color }) => (
                <div key={label} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-gray-400"><Icon size={12} className={color} /> {label}</span>
                  <span className="font-bold text-gray-700">{val}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* AI Threats */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2"><BrainCircuit size={14} className="text-red-400" /> AI Threat Detection</h3>
              <Link to="/alerts" className="text-[11px] font-semibold text-green-600 hover:text-green-700 flex items-center gap-1">View All <ArrowRight size={12} /></Link>
            </div>
            <div className="p-4 space-y-2.5 max-h-[280px] overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="p-6 text-center"><ShieldCheck size={28} className="text-green-500 mx-auto mb-2" /><p className="text-sm text-gray-400">All systems nominal</p></div>
              ) : alerts.slice(0, 4).map(alert => (
                <div key={alert.id} className={`p-3.5 rounded-lg border ${alert.is_acknowledged ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-red-50/50 border-red-100'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${alert.is_acknowledged ? 'bg-gray-100 text-gray-400' : 'bg-red-100 text-red-500'}`}><AlertOctagon size={16} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{alert.anomaly_type}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${alert.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-orange-100 text-orange-600'}`}>{alert.severity}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">{alert.batch_id}</p>
                    </div>
                    {alert.is_acknowledged && <CheckCircle2 size={14} className="text-green-500 shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Batches */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2"><Box size={14} className="text-indigo-500" /> Recent Batches</h3>
              <Link to="/batches" className="text-[11px] font-semibold text-green-600 hover:text-green-700 flex items-center gap-1">View All <ArrowRight size={12} /></Link>
            </div>
            <div className="divide-y divide-gray-50">
              {batches.slice(0, 5).map(batch => (
                <Link key={batch.id} to={`/batches/${batch.batch_id}`} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center"><Package size={16} /></div>
                    <div><p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">{batch.drug_name}</p><p className="text-[10px] text-gray-400 font-mono">{batch.batch_id} · {batch.current_location || 'In Transit'}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${batch.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : batch.status === 'FLAGGED' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}>{batch.status}</span>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-green-500 transition-colors" />
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
