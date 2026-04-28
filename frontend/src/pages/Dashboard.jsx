import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Layout/Header';
import StatCard from '../components/Dashboard/StatCard';
import { Package, AlertTriangle, Activity, ArrowRight, AlertOctagon, CheckCircle2, Box, ShieldCheck, BrainCircuit, TrendingUp, Truck, Factory, FlaskConical, Thermometer, Unlock, Globe2 } from 'lucide-react';
import { CardSkeleton } from '../components/shared/LoadingSpinner';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import toast from 'react-hot-toast';

const activityData = [
  { day: 'Mon', shipments: 12, verified: 10, flagged: 2 },
  { day: 'Tue', shipments: 18, verified: 16, flagged: 1 },
  { day: 'Wed', shipments: 15, verified: 14, flagged: 3 },
  { day: 'Thu', shipments: 22, verified: 20, flagged: 2 },
  { day: 'Fri', shipments: 28, verified: 25, flagged: 1 },
  { day: 'Sat', shipments: 20, verified: 18, flagged: 0 },
  { day: 'Today', shipments: 25, verified: 23, flagged: 2 },
];



const SystemTestingPanel = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (threatType) => await api.post('/alerts/simulate', { threat_type: threatType }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ['dashboard-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-batches'] });
    }
  });

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card p-5 xl:col-span-2 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -z-10"></div>
      <h3 className="text-xs font-semibold t-text-muted uppercase tracking-wider flex items-center gap-2 mb-4">
        <Activity size={14} className="text-indigo-500" /> System Testing & QA Simulator
      </h3>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => mutation.mutate('TEMPERATURE_BREACH')} disabled={mutation.isPending} className="flex items-center justify-between p-2.5 rounded-lg border t-border t-bg-hover transition-all text-xs font-medium t-text group/btn">
            <span className="flex items-center gap-2"><Thermometer size={14} className="text-red-500" /> Thermal Breach</span>
            <span className="text-[10px] opacity-0 group-hover/btn:opacity-100 transition-opacity font-bold text-red-500">TRIGGER</span>
          </button>
          <button onClick={() => mutation.mutate('TAMPER_DETECTED')} disabled={mutation.isPending} className="flex items-center justify-between p-2.5 rounded-lg border t-border t-bg-hover transition-all text-xs font-medium t-text group/btn">
            <span className="flex items-center gap-2"><Unlock size={14} className="text-orange-500" /> Tamper Event</span>
            <span className="text-[10px] opacity-0 group-hover/btn:opacity-100 transition-opacity font-bold text-orange-500">TRIGGER</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const SdgImpactPanel = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card p-5 xl:col-span-2 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full -z-10"></div>
      <h3 className="text-xs font-semibold t-text-muted uppercase tracking-wider flex items-center gap-2 mb-4">
        <Globe2 size={14} className="dark:text-green-400 text-green-500" /> Real-World SDG Impact
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 t-bg rounded-lg text-center border t-border">
          <p className="text-lg font-black dark:text-green-400 text-green-600 mb-0.5">14.2<span className="text-[10px] font-bold">t</span></p>
          <p className="text-[9px] font-semibold t-text-muted uppercase">CO₂ Saved (SDG 12)</p>
        </div>
        <div className="p-3 t-bg rounded-lg text-center border t-border">
          <p className="text-lg font-black dark:text-blue-400 text-blue-600 mb-0.5">3.4<span className="text-[10px] font-bold">k</span></p>
          <p className="text-[9px] font-semibold t-text-muted uppercase">Safe Doses (SDG 3)</p>
        </div>
        <div className="p-3 t-bg rounded-lg text-center border t-border">
          <p className="text-lg font-black dark:text-indigo-400 text-indigo-600 mb-0.5">100<span className="text-[10px] font-bold">%</span></p>
          <p className="text-[9px] font-semibold t-text-muted uppercase">Tamper Proof (SDG 9)</p>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { dark } = useTheme();
  const accent = dark ? '#14b8a6' : '#22c55e';

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
  const radialData = [{ name: 'Trust', value: trustScore, fill: accent }];
  const tooltipStyle = { background: 'var(--tooltip-bg)', border: `1px solid var(--tooltip-border)`, borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Header title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (<><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></>) : (<>
            <StatCard title="Active Shipments" value={stats?.active || 0} icon={Package} color="green" trend={5.2} />
            <StatCard title="AI Flagged" value={stats?.flagged || 0} icon={AlertTriangle} color="red" trend={stats?.flagged > 0 ? 2.1 : -1.4} />
            <StatCard title="Verified" value={stats?.verified || 0} icon={ShieldCheck} color="blue" />
            <StatCard title="Total Batches" value={stats?.total_batches || 0} icon={Activity} color="indigo" />
          </>)}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          <SystemTestingPanel />
          <SdgImpactPanel />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card p-5 xl:col-span-3">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <TrendingUp size={14} style={{ color: accent }} /> Supply Chain Activity
              </h3>
              <div className="flex gap-4 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: accent }} /> Shipments</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Verified</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Flagged</span>
              </div>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={accent} stopOpacity={0.15} /><stop offset="95%" stopColor={accent} stopOpacity={0} /></linearGradient>
                    <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: 'var(--text-primary)' }} />
                  <Area type="monotone" dataKey="shipments" stroke={accent} strokeWidth={2.5} fillOpacity={1} fill="url(#gs)" dot={{ fill: accent, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, stroke: 'var(--bg-card)', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="verified" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#gv)" dot={false} />
                  <Area type="monotone" dataKey="flagged" stroke="#ef4444" strokeWidth={2} fillOpacity={0} dot={{ fill: '#ef4444', r: 3, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-5 flex flex-col items-center justify-center">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Trust Score</h3>
            <div className="h-[170px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" startAngle={210} endAngle={-30} data={radialData} barSize={12}>
                  <RadialBar background={{ fill: 'var(--bg-badge)' }} clockWise dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black" style={{ color: accent }}>{trustScore}%</span>
                <span className="text-[10px] font-medium uppercase mt-0.5" style={{ color: 'var(--text-muted)' }}>{trustScore > 80 ? 'Excellent' : 'Moderate'}</span>
              </div>
            </div>
            <div className="w-full space-y-2 mt-2">
              {[
                { icon: Factory, label: 'Manufactured', val: stats?.total_batches || 0 },
                { icon: FlaskConical, label: 'QC Passed', val: stats?.verified || 0 },
                { icon: Truck, label: 'In Transit', val: stats?.active || 0 },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}><Icon size={12} style={{ color: accent }} /> {label}</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{val}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card overflow-hidden">
            <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><BrainCircuit size={14} className="text-red-400" /> AI Threat Detection</h3>
              <Link to="/alerts" className="text-[11px] font-semibold flex items-center gap-1" style={{ color: 'var(--accent)' }}>View All <ArrowRight size={12} /></Link>
            </div>
            <div className="p-4 space-y-2.5 max-h-[280px] overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="p-6 text-center"><ShieldCheck size={28} className="mx-auto mb-2" style={{ color: accent }} /><p className="text-sm" style={{ color: 'var(--text-muted)' }}>All systems nominal</p></div>
              ) : alerts.slice(0, 4).map(alert => (
                <div key={alert.id} className="p-3.5 rounded-lg" style={{ background: alert.is_acknowledged ? 'var(--bg-badge)' : (dark ? 'rgba(239,68,68,0.05)' : '#fef2f2'), border: `1px solid ${alert.is_acknowledged ? 'var(--border)' : (dark ? 'rgba(239,68,68,0.15)' : '#fecaca')}`, opacity: alert.is_acknowledged ? 0.6 : 1 }}>
                  <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: alert.is_acknowledged ? 'var(--bg-badge)' : (dark ? 'rgba(239,68,68,0.1)' : '#fee2e2'), color: alert.is_acknowledged ? 'var(--text-muted)' : '#ef4444' }}><AlertOctagon size={16} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{alert.anomaly_type}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${alert.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-orange-100 text-orange-600'}`}>{alert.severity}</span>
                      </div>
                      <p className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>{alert.batch_id}</p>
                    </div>
                    {alert.is_acknowledged && <CheckCircle2 size={14} className="dark:text-green-400 text-green-500 shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card overflow-hidden">
            <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Box size={14} className="dark:text-indigo-400 text-indigo-500" /> Recent Batches</h3>
              <Link to="/batches" className="text-[11px] font-semibold flex items-center gap-1" style={{ color: 'var(--accent)' }}>View All <ArrowRight size={12} /></Link>
            </div>
            <div>
              {batches.slice(0, 5).map(batch => (
                <Link key={batch.id} to={`/batches/${batch.batch_id}`} className="px-5 py-3.5 flex items-center justify-between transition-all group" style={{ borderBottom: '1px solid var(--border-light)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: dark ? 'rgba(99,102,241,0.1)' : '#e0e7ff', color: '#6366f1' }}><Package size={16} /></div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{batch.drug_name}</p>
                      <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{batch.batch_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${batch.status === 'ACTIVE' ? 'dark:bg-green-500/10 bg-green-50 dark:text-green-400 text-green-600 dark:bg-green-500/10 dark:text-green-400' : batch.status === 'FLAGGED' ? 'dark:bg-red-500/10 bg-red-50 dark:text-red-400 text-red-500 dark:bg-red-500/10 dark:text-red-400' : 'dark:bg-amber-500/10 bg-amber-50 dark:text-amber-400 text-amber-600'}`}>{batch.status}</span>
                    <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
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
