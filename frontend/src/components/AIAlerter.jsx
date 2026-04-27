import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ChevronRight, 
  ExternalLink,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIAlerter = ({ alerts }) => {
  const [selectedAlert, setSelectedAlert] = useState(null);

  if (alerts.length === 0) {
    return (
      <div className="glass-card p-10 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-600">
          <ShieldAlert size={32} />
        </div>
        <div>
          <p className="font-medium text-slate-400">System Monitoring Stable</p>
          <p className="text-xs text-slate-500">No anomalies detected by Gemini AI.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {alerts.map((alert, idx) => (
          <motion.div 
            key={`${alert.batch_id}-${alert.timestamp}-${idx}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`glass-card p-4 border-l-4 ${alert.severity === 'CRITICAL' ? 'border-l-red-500' : 'border-l-amber-500'} cursor-pointer hover:bg-white/5 transition-all`}
            onClick={() => setSelectedAlert(alert)}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="badge-anomaly">
                {alert.anomaly_type}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                SCORE: {(alert.anomaly_score * 100).toFixed(0)}%
              </span>
            </div>
            
            <h3 className="font-bold text-sm mb-1">{alert.batch_id} - Potential Risk</h3>
            <p className="text-xs text-slate-400 line-clamp-2 italic">
              "{alert.root_cause}"
            </p>

            <div className="mt-3 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 text-sky-400 uppercase font-bold tracking-tighter">
                <Info size={12} />
                REGULATORY AUDIT REQUIRED
              </div>
              <ChevronRight size={14} className="text-slate-600" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Detail Modal Placeholder */}
      <AnimatePresence>
        {selectedAlert && (
          <div className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold italic">Gemini <span className="text-sky-400">Analysis Report</span></h2>
                <button 
                  onClick={() => setSelectedAlert(null)}
                  className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto space-y-6 text-sm leading-relaxed">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Severity</p>
                    <p className={`font-bold ${selectedAlert.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>{selectedAlert.severity}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Confidence</p>
                    <p className="font-bold text-sky-400">{(selectedAlert.confidence * 100).toFixed(0)}%</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sky-400 mb-2 uppercase text-xs tracking-widest">Root Cause Analysis</h4>
                  <p className="text-slate-300 italic">"{selectedAlert.root_cause}"</p>
                </div>

                <div>
                  <h4 className="font-bold text-emerald-400 mb-2 uppercase text-xs tracking-widest">Recommended Action</h4>
                  <p className="text-slate-300">{selectedAlert.recommendation}</p>
                </div>

                <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                  <h4 className="font-bold text-red-400 mb-2 uppercase text-xs tracking-widest">Patient Safety Impact</h4>
                  <p className="text-slate-300 italic">"{selectedAlert.risk_to_patients}"</p>
                </div>

                {selectedAlert.full_report && (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h4 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Detailed Executive Summary</h4>
                    <div className="whitespace-pre-wrap text-slate-400 bg-black/20 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                      {selectedAlert.full_report}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-sky-500/5 flex justify-between items-center">
                <div className="text-[10px] text-sky-500 font-bold flex items-center gap-2">
                  <ShieldAlert size={14} />
                  BLOCKCHAIN PROOF SUBMITTED
                </div>
                <button className="flex items-center gap-2 text-xs font-bold text-white hover:text-sky-400 transition-colors">
                  VIEW ON CHAIN <ExternalLink size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAlerter;
