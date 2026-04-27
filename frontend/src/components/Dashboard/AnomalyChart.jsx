import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

const AnomalyChart = ({ data = [] }) => {
  // Format data for Recharts
  const formattedData = data.map(log => ({
    time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: log.temperature,
    humidity: log.humidity,
    isAnomaly: log.is_anomaly
  })).reverse();

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500">Environmental Analytics</h3>
        <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-teal-500 shadow-sm" />
                <span className="text-[10px] font-bold text-slate-400">TEMPERATURE</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm" />
                <span className="text-[10px] font-bold text-slate-400">HUMIDITY</span>
            </div>
        </div>
      </div>

      <div className="flex-1 min-h-[300px] w-full relative">
        <ResponsiveContainer width="100%" height="100%" minHeight={300} debounce={100}>


          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00897B" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00897B" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#475569', fontSize: 10}}
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#475569', fontSize: 10}}
            />
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: '#16213E', 
                    borderColor: '#0F3460', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
            />
            <Area 
                type="monotone" 
                dataKey="temp" 
                stroke="#00897B" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTemp)" 
            />
            <Area 
                type="monotone" 
                dataKey="humidity" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorHum)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnomalyChart;
