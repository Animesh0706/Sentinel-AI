import React from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle, ShieldX, Info, ScanSearch, Crosshair, Sparkles } from 'lucide-react';

const Alerts = ({ alert }) => {
  if (!alert) return null;

  const getThemeColor = () => {
    if (alert.verdict === 'Malicious') return 'neon-red';
    if (alert.verdict === 'Suspicious') return 'neon-yellow';
    return 'neon-green';
  };

  const themeColor = getThemeColor();

  return (
    <motion.div 
      key={alert.scan_id}
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel rounded-3xl p-6 h-full flex flex-col relative overflow-hidden group"
    >
      {/* Background Lighting */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-${themeColor} rounded-full mix-blend-screen filter blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity duration-1000 -translate-y-1/2 translate-x-1/3 pointer-events-none`}></div>
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <h3 className="text-xl font-display font-bold text-text-main flex items-center gap-3">
            <ScanSearch className="text-neon-primary" size={24} /> 
            Deep Analysis
          </h3>
          <p className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-2 uppercase tracking-widest">
            <Sparkles size={12} className={`text-${themeColor}`} /> AI Confidence: High
          </p>
        </div>
        <div className={`flex flex-col items-end text-${themeColor}`}>
          <span className="font-display text-4xl font-black leading-none tracking-tighter">
            {(alert.threat_score * 100).toFixed(0)}<span className="text-xl opacity-60 ml-1">%</span>
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-widest opacity-80 mt-1">Risk Score</span>
        </div>
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
        <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Detected Vectors</h4>
        {alert.explanations.map((exp, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + (idx * 0.1), ease: "easeOut" }}
            key={idx} 
            className="bg-black/40 border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-colors relative overflow-hidden"
          >
            {/* Soft indicator glow behind the item */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-secondary opacity-50 shadow-[0_0_10px_#8b5cf6]"></div>

            <div className="flex justify-between text-sm mb-3 items-center">
              <span className="text-text-main font-display font-medium flex items-center gap-2 tracking-wide pl-2">
                <Crosshair size={14} className="text-neon-secondary" /> {exp.indicator}
              </span>
              <span className="text-text-main font-mono bg-black/10 dark:bg-white/10 px-2 py-1 rounded-lg text-xs border border-cyber-border shadow-inner">
                {(exp.weight * 100).toFixed(0)}%
              </span>
            </div>
            
            <div className="pl-2">
              <div className="w-full bg-black/60 rounded-full h-1.5 mb-3 overflow-hidden border border-white/5 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(exp.weight * 100, 100)}%` }}
                  transition={{ duration: 1.5, delay: 0.3 + (idx * 0.1), ease: [0.22, 1, 0.36, 1] }}
                  className="bg-gradient-to-r from-neon-primary to-neon-secondary h-full rounded-full relative"
                >
                  <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-[2px] rounded-full animate-pulse"></div>
                </motion.div>
              </div>
              
              <p className="text-xs text-text-muted font-mono leading-relaxed bg-black/5 dark:bg-white/[0.03] p-3 rounded-xl border border-cyber-border shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">
                {exp.detail}
              </p>
            </div>
          </motion.div>
        ))}
        {alert.explanations.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="h-40 border border-dashed border-neon-green/30 rounded-2xl flex flex-col items-center justify-center text-neon-green/60 bg-neon-green/5"
          >
            <ShieldCheck size={32} className="mb-2" />
            <span className="font-mono text-sm uppercase tracking-widest font-bold">Zero Threats Detected</span>
          </motion.div>
        )}
      </div>
      
      {/* Footer Verdict */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="mt-6 pt-6 border-t border-cyber-border relative z-10"
      >
        <div className={`p-4 rounded-2xl flex justify-between items-center bg-${themeColor}/10 border border-${themeColor}/30 shadow-[0_4px_20px_rgba(0,0,0,0.1)]`}>
          <div className="flex flex-col">
            <span className="text-xs text-text-muted font-mono mb-1 uppercase tracking-wider">Final Authorization</span>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${themeColor} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 bg-${themeColor} shadow-[0_0_8px_currentColor]`}></span>
              </span>
              <span className={`font-display font-bold text-xl tracking-wide text-${themeColor}`}>
                {alert.verdict.toUpperCase()}
              </span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center border border-${themeColor}/20`}>
            {alert.verdict === 'Malicious' ? <ShieldX size={24} className="text-neon-red drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" /> : 
             alert.verdict === 'Suspicious' ? <AlertTriangle size={24} className="text-neon-yellow drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" /> : 
             <ShieldCheck size={24} className="text-neon-green drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Alerts;

