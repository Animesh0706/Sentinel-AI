import React, { useState, useEffect } from 'react';
import { Search, Bell, Activity, ShieldCheck, ShieldAlert, Shield, CheckCircle2, Mail, MessageSquare, Globe, Fingerprint } from 'lucide-react';
import Alerts from './Alerts';
import { checkHealth, fetchScanHistory, verifyIntegrity } from '../services/api';

const Sparkline = ({ color }) => (
  <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M2 15C5 15 8 8 15 8C22 8 25 18 35 18C45 18 48 5 58 5" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="drop-shadow-md"
    />
  </svg>
);

const Dashboard = () => {
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [health, setHealth] = useState({ status: "Connecting..." });
  const [integrityStatus, setIntegrityStatus] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await fetchScanHistory();
      setScans(history);
      if (history.length > 0) setSelectedScan(history[0]);
    };
    loadHistory();
  }, []);

  useEffect(() => {
    const fetchHealth = async () => {
      const data = await checkHealth();
      setHealth(data);
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const getSystemStatus = () => {
    if (health.status === 'online') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00ff88]/20 bg-[#00ff88]/5">
          <div className="w-2 h-2 rounded-full bg-neon-green shadow-sm animate-pulse"></div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#00ff88]">SYS ONLINE</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neon-red/30 bg-neon-red/5">
        <div className="w-2 h-2 rounded-full bg-neon-red shadow-sm"></div>
        <span className="text-[10px] uppercase font-mono tracking-widest text-neon-red">SYS OFFLINE</span>
      </div>
    );
  };

  return (
    <div className="p-8 flex flex-col h-full">
      {/* Top Navigation / Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-[28px] font-bold tracking-wide text-white mb-1">Security Intelligence</h1>
          <p className="text-sm text-gray-500 font-sans">Real-time threat detection network overview</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search threats, IDs..." 
              className="bg-[#0f1118] border border-[#232733] text-sm text-white rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-neon-cyan/50 transition-colors placeholder:text-gray-600"
            />
          </div>
          <div className="w-10 h-10 rounded-full border border-[#232733] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors relative">
            <Bell size={18} />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-neon-red border-2 border-cyber-bg"></div>
          </div>
          {getSystemStatus()}
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 lg:gap-8 gap-y-8">
        
        {/* Left Column: Live Event Stream */}
        <div className="flex flex-col h-full min-h-0">
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-[15px] font-semibold text-gray-200 flex items-center gap-2">
              <Activity size={18} className="text-neon-cyan" />
              Live Event Stream
            </h2>
            <div className="px-2 py-1 rounded bg-[#181a24] border border-[#232733] text-[10px] font-mono text-gray-400">
              {scans.length} events processing
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {scans.map((scan) => {
              const isSelected = selectedScan?.scan_id === scan.scan_id;
              const isMalicious = scan.verdict === 'Malicious';
              const isSuspicious = scan.verdict === 'Suspicious';
              
              const themeColor = isMalicious ? '#ff3355' : isSuspicious ? '#ffb800' : '#00ff88';
              const textClass = isMalicious ? 'text-neon-red' : isSuspicious ? 'text-neon-yellow' : 'text-neon-green';
              const glowClass = isSelected 
                ? isMalicious ? 'border-neon-red shadow-[0_0_15px_rgba(255,51,85,0.15)] bg-[#1a151b]' 
                : isSuspicious ? 'border-neon-yellow shadow-[0_0_15px_rgba(255,184,0,0.1)] bg-[#1a1816]' 
                : 'border-neon-green shadow-[0_0_15px_rgba(0,255,136,0.1)] bg-[#11191a]'
                : 'border-[#232733] bg-[#12141c] hover:border-gray-600/50 hover:bg-[#151821]';
              
              return (
                <div 
                  key={scan.scan_id}
                  onClick={() => {
                    setSelectedScan(scan);
                    setIntegrityStatus(null);
                    if (scan.integrity_hash) {
                      verifyIntegrity(scan.scan_id).then(setIntegrityStatus);
                    }
                  }}
                  className={`w-full rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 border ${glowClass}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${isSelected ? `border-[${themeColor}] bg-[${themeColor}]/10` : 'border-[#232733] bg-[#0d0f14]'}`}>
                      {scan.content_type === 'email' ? <Mail size={22} className={textClass} />
                       : scan.content_type === 'message' ? <MessageSquare size={22} className={textClass} />
                       : <Globe size={22} className={textClass} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-[15px] font-bold tracking-widest uppercase ${textClass}`}>
                          {scan.verdict}
                        </span>
                        <div className="px-1.5 py-0.5 rounded bg-[#2a2d3b] text-[10px] font-mono text-gray-300">
                          {(scan.threat_score * 100).toFixed(0)} <span className="text-gray-500">/ 100</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] font-mono text-gray-500 uppercase tracking-wide">
                        <span className="flex items-center gap-1.5"><Shield size={12}/> ID: {scan.scan_id.substring(0,8)}</span>
                        <span className="flex items-center gap-1.5"><Activity size={12}/> {scan.content_type}</span>
                        <span>{new Date(scan.scanned_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mr-2">
                     <Sparkline color={themeColor} />
                     {scan.integrity_hash && (
                       <Fingerprint size={14} className="text-neon-green/50" />
                     )}
                  </div>
                </div>
              );
            })}
            
            {scans.length === 0 && (
              <div className="w-full text-center py-12 border border-dashed border-[#232733] rounded-2xl text-gray-500 font-mono text-sm">
                No threat events processing.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: XAI Diagnostics */}
        <div className="flex flex-col h-full min-h-0">
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-[15px] font-semibold text-gray-200 flex items-center gap-2">
              <span className="text-neon-purple text-lg pt-0.5">ϟ</span>
              XAI Diagnostics
            </h2>
          </div>
          
          <div className="flex-1 min-h-0">
             <Alerts alert={selectedScan} integrityStatus={integrityStatus} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
