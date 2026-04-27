import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { Thermometer, Droplets, Shield, Clock, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LiveFeed = ({ historicalData = [] }) => {
    const { lastSensorUpdate } = useSocket();
    const [feed, setFeed] = useState([]);

    // Initialize with historical data
    useEffect(() => {
        if (historicalData.length > 0 && feed.length === 0) {
            setFeed(historicalData);
        }
    }, [historicalData]);

    // Add live updates on top
    useEffect(() => {
        if (lastSensorUpdate) {
            setFeed(prev => [lastSensorUpdate, ...prev].slice(0, 50));
        }
    }, [lastSensorUpdate]);

    return (
        <div className="glass-card flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-white">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                    Live Sensor Feed
                </h3>
                <span className="text-[10px] font-bold text-slate-500">{feed.length} Records</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {feed.map((update, idx) => (
                        <motion.div
                            key={`${update.batch_id || update.id}-${idx}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="p-3 bg-white/[0.03] rounded-xl border border-white/5 flex items-center justify-between group hover:border-teal-500/20 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    update.seal_intact !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                }`}>
                                    <Shield size={14} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white group-hover:text-teal-400 transition-colors">
                                        {update.batch_id || `Sensor-${update.id}`}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-0.5">
                                        <Clock size={9} />
                                        {update.timestamp ? (
                                            typeof update.timestamp === 'number' 
                                                ? new Date(update.timestamp * 1000).toLocaleTimeString()
                                                : new Date(update.timestamp).toLocaleTimeString()
                                        ) : '—'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-xs">
                                <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-md">
                                    <Thermometer size={11} className="text-teal-400" />
                                    <span className="font-bold text-white">{update.temperature}°</span>
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-md">
                                    <Droplets size={11} className="text-indigo-400" />
                                    <span className="font-bold text-white">{update.humidity}%</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {feed.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 pt-20">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                                <Radio size={28} className="animate-pulse" />
                            </div>
                            <p className="text-xs font-medium text-center">Awaiting telemetry<br/>synchronization...</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LiveFeed;
