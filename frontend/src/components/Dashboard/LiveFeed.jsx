import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { Thermometer, Droplets, Shield, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LiveFeed = () => {
    const { lastSensorUpdate } = useSocket();
    const [feed, setFeed] = useState([]);

    useEffect(() => {
        if (lastSensorUpdate) {
            setFeed(prev => [lastSensorUpdate, ...prev].slice(0, 50));
        }
    }, [lastSensorUpdate]);

    return (
        <div className="glass-card flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-navy-700 flex justify-between items-center bg-navy-800/20">
                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    Live Sensor Feed
                </h3>
                <span className="text-[10px] font-bold text-slate-500">{feed.length} Active Records</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {feed.map((update, idx) => (
                        <motion.div
                            key={`${update.batch_id}-${update.timestamp}-${idx}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-3 bg-navy-800/40 rounded-xl border border-navy-700 flex items-center justify-between group hover:border-teal-500/30 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${update.seal_intact ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                                    <Shield size={16} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white group-hover:text-teal-400 transition-colors">{update.batch_id}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-0.5">
                                        <Clock size={10} />
                                        {new Date(update.timestamp * 1000).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-navy-700 rounded-md">
                                    <Thermometer size={12} className="text-teal-400" />
                                    <span className="font-bold">{update.temperature}°C</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-navy-700 rounded-md">
                                    <Droplets size={12} className="text-teal-400" />
                                    <span className="font-bold">{update.humidity}%</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {feed.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 opacity-50 pt-20">
                            <Clock size={32} />
                            <p className="text-xs font-medium">Awaiting telemetry synchronization...</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LiveFeed;
