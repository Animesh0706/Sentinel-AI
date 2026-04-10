import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Activity, Shield, Fingerprint, Network, Bell, Search, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Alerts from './Alerts';
import { mockHistory, checkHealth } from '../services/api';

const Dashboard = () => {
  const [scans, setScans] = useState(mockHistory);
  const [selectedScan, setSelectedScan] = useState(mockHistory[0]);
  const [health, setHealth] = useState({ status: "Connecting..." });

  useEffect(() => {
    const fetchHealth = async () => {
      const data = await checkHealth();
      setHealth(data);
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const getVerdictGlow = (verdict) => {
    switch(verdict) {
      case 'Malicious': return 'from-neon-red/30 to-transparent border-neon-red/50';
      case 'Suspicious': return 'from-neon-yellow/30 to-transparent border-neon-yellow/50';
      default: return 'from-neon-green/30 to-transparent border-neon-green/50';
    }
  };

  const getVerdictText = (verdict) => {
    switch(verdict) {
      case 'Malicious': return 'text-neon-red drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]';
      case 'Suspicious': return 'text-neon-yellow drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]';
      default: return 'text-neon-green drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]';
    }
  };

  const isOnline = health.status === 'online';

  return (
    <div className="w-full h-full flex flex-col p-4 lg:p-8 xl:p-10">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 w-full">
        <div>
          <motion.h2 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl lg:text-4xl font-display font-semibold text-text-main tracking-tight leading-tight"
          >
            Security Intelligence
          </motion.h2>
          <p className="text-sm text-text-muted mt-1 font-medium">Real-time threat detection network overview</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Search threats, IDs..." className="bg-black/20 dark:bg-black/40 border border-cyber-border rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-neon-primary/50 focus:ring-1 focus:ring-neon-primary/50 transition-all text-text-main w-64 placeholder:text-text-muted" />
          </div>
          
          <button className="relative w-10 h-10 flex items-center justify-center rounded-full glass-panel glass-panel-hover text-text-muted hover:text-text-main">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-neon-red rounded-full shadow-[0_0_8px_var(--neon-red)]"></span>
          </button>

          <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-full">
            <div className="relative flex h-2.5 w-2.5">
              {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOnline ? 'bg-neon-green' : 'bg-neon-red'}`}></span>
            </div>
            <span className={`font-mono text-xs font-bold uppercase tracking-widest ${isOnline ? 'text-neon-green' : 'text-neon-red'}`}>
              {isOnline ? 'SYS ONLINE' : 'SYS OFFLINE'}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Feed Column */}
        <div className="xl:col-span-7 2xl:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-display font-medium text-text-main flex items-center gap-2">
              <Activity size={18} className="text-neon-primary" />
              Live Event Stream
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-black/10 dark:bg-white/5 border border-cyber-border rounded text-xs font-mono text-text-muted">{scans.length} events processing</span>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {scans.map((scan, idx) => {
                const isSelected = selectedScan?.scan_id === scan.scan_id;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                    key={scan.scan_id}
                    onClick={() => setSelectedScan(scan)}
                    className={`group cursor-pointer rounded-2xl relative overflow-hidden transition-all duration-300
                      ${isSelected ? 'scale-[1.01] z-10' : 'hover:scale-[1.01] z-0 opacity-80 hover:opacity-100'}
                      glass-panel glass-panel-hover
                    `}
                  >
                    {isSelected && (
                      <motion.div layoutId="active-scan-border" className={`absolute inset-0 border-2 rounded-2xl pointer-events-none ${getVerdictGlow(scan.verdict).replace('from-', 'border-').split(' ')[0]}`} />
                    )}
                    <div className={`absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r opacity-20 pointer-events-none ${getVerdictGlow(scan.verdict)}`} />
                    
                    <div className="p-5 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-black/10 dark:bg-black/40 border border-cyber-border
                          ${scan.verdict === 'Malicious' ? 'shadow-[inset_0_0_15px_rgba(239,68,68,0.2)]' : 
                            scan.verdict === 'Suspicious' ? 'shadow-[inset_0_0_15px_rgba(245,158,11,0.2)]' : 'shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]'}
                        `}>
                          {scan.verdict === 'Safe' ? <ShieldCheck size={24} className="text-neon-green" /> : <ShieldAlert size={24} className={scan.verdict === 'Malicious' ? 'text-neon-red animate-pulse' : 'text-neon-yellow'} />}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`font-display font-bold text-lg uppercase tracking-wide ${getVerdictText(scan.verdict)}`}>
                              {scan.verdict}
                            </span>
                            <span className="bg-black/20 dark:bg-white/10 px-2 py-0.5 rounded text-xs font-mono text-text-muted">
                              {(scan.threat_score * 100).toFixed(0)} / 100
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-mono text-text-muted opacity-80">
                            <span className="flex items-center gap-1.5 text-text-main/70"><Fingerprint size={12}/> ID: {scan.scan_id.substring(0,8)}</span>
                            <span className="flex items-center gap-1.5 text-text-main/70"><Network size={12}/> {scan.content_type.toUpperCase()}</span>
                            <span>{new Date(scan.scanned_at).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="hidden md:flex flex-col items-end">
                        <svg width="60" height="40" viewBox="0 0 60 40" className="opacity-50">
                          <path d={scan.verdict === 'Malicious' ? "M0 20 Q 10 10, 20 20 T 40 10 T 60 5" : scan.verdict === 'Suspicious' ? "M0 20 Q 15 25, 30 15 T 60 20" : "M0 30 Q 20 30, 40 20 T 60 30"} fill="none" stroke="currentColor" strokeWidth="2" className={scan.verdict === 'Malicious' ? 'text-neon-red' : scan.verdict === 'Suspicious' ? 'text-neon-yellow' : 'text-neon-green'} strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* XAI Details Column */}
        <div className="xl:col-span-5 2xl:col-span-4 h-full xl:sticky xl:top-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-display font-medium text-text-main flex items-center gap-2">
              <Zap size={18} className="text-neon-secondary" />
              XAI Diagnostics
            </h3>
          </div>
          <div className="h-[calc(100vh-12rem)] min-h-[600px]">
            {selectedScan ? (
              <Alerts alert={selectedScan} />
            ) : (
              <div className="glass-panel rounded-3xl h-full flex flex-col items-center justify-center p-8 text-center border-dashed border-cyber-border">
                <div className="w-20 h-20 rounded-full border border-cyber-border flex items-center justify-center mb-6 bg-black/10 dark:bg-black/50">
                  <Shield size={32} className="text-text-muted opacity-50" />
                </div>
                <h4 className="text-text-main font-display text-xl mb-2">Awaiting Selection</h4>
                <p className="text-text-muted max-w-xs text-sm">Select a continuous monitoring event from the stream to generate the Explainable AI deep-dive.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
