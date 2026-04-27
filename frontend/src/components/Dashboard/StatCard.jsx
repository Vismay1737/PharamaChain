import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, unit = "", icon: Icon, color = "green", trend = null }) => {
  const colors = {
    green: { bg: 'bg-green-50', text: 'text-green-600', trend: 'text-green-600' },
    red: { bg: 'bg-red-50', text: 'text-red-500', trend: 'text-red-500' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-500', trend: 'text-indigo-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-500', trend: 'text-blue-500' },
  };
  const c = colors[color] || colors.green;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}>
        {Icon && <Icon size={22} strokeWidth={1.8} />}
      </div>
      <div className="flex-1">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{title}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{value}</h3>
          {unit && <span className="text-sm text-gray-400">{unit}</span>}
        </div>
        {trend && (
          <p className={`text-[11px] font-medium mt-0.5 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last 24h
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
