import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const StatCard = ({ title, value, unit = "", icon: Icon, color = "green", trend = null }) => {
  const { dark } = useTheme();

  const colors = {
    green: { bg: dark ? 'rgba(34,197,94,0.1)' : '#dcfce7', text: dark ? '#4ade80' : '#16a34a' },
    red: { bg: dark ? 'rgba(239,68,68,0.1)' : '#fee2e2', text: dark ? '#f87171' : '#ef4444' },
    indigo: { bg: dark ? 'rgba(99,102,241,0.1)' : '#e0e7ff', text: dark ? '#a5b4fc' : '#6366f1' },
    blue: { bg: dark ? 'rgba(59,130,246,0.1)' : '#dbeafe', text: dark ? '#60a5fa' : '#3b82f6' },
  };
  const c = colors[color] || colors.green;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: c.bg, color: c.text }}>
        {Icon && <Icon size={22} strokeWidth={1.8} />}
      </div>
      <div className="flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>{title}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{value}</h3>
          {unit && <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{unit}</span>}
        </div>
        {trend && (
          <p className={`text-[11px] font-medium mt-0.5 ${trend > 0 ? 'dark:text-green-400 text-green-500' : 'dark:text-red-400 text-red-500'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last 24h
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
