import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Activity, Shield } from 'lucide-react';
import Alerts from './Alerts';
import { checkHealth, fetchScanHistory } from '../services/api';

const Dashboard = () => {
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [health, setHealth] = useState({ status: "Connecting..." });

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

  const getVerdictBadge = (verdict) => {
    switch (verdict) {
      case 'Safe':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-neon-green/10 text-neon-green border border-neon-green/30">Safe</span>;
      case 'Suspicious':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30">Suspicious</span>;
      case 'Malicious':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-neon-red/10 text-neon-red border border-neon-red/30 animate-pulse shadow-[0_0_8px_rgba(255,51,102,0.5)]">Malicious</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/30">Unknown</span>;
    }
  };

  const getHealthStatus = () => {
    if (health.status === 'online') {
      return (
        <div className="flex items-center gap-2 text-neon-green">
          <Activity size={16} className="animate-pulse" />
          <span className="font-mono text-sm tracking-widest text-[#00ff66] drop-shadow-[0_0_5px_rgba(0,255,102,0.8)]">SYSTEM: SECURE</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-neon-red">
        <Activity size={16} />
        <span className="font-mono text-sm tracking-widest text-[#ff3366] drop-shadow-[0_0_5px_rgba(255,51,102,0.8)]">SYSTEM: OFFLINE</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-200 p-6 font-sans selection:bg-neon-cyan/30">
      {/* Header */}
      <header className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6 px-2">
        <div className="flex items-center gap-3">
          <Shield className="text-neon-cyan drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]" size={36} />
          <h1 className="text-4xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple drop-shadow-lg">
            SENTINEL<span className="font-light">AI</span>
          </h1>
        </div>
        <div className="bg-cyber-card px-5 py-3 rounded-full border border-gray-800 shadow-[0_0_15px_rgba(0,255,102,0.05)]">
          {getHealthStatus()}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Table */}
        <div className="lg:col-span-2 bg-cyber-card rounded-xl border border-gray-800 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col h-[70vh]">
          <div className="p-5 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
            <h2 className="text-xl font-mono font-semibold text-gray-100 items-center flex gap-3">
              <Activity size={20} className="text-neon-cyan" /> Live Threat Feed
            </h2>
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-[#0d0f12]">
                <tr className="text-gray-400 text-sm font-mono border-b border-gray-800 uppercase tracking-wider">
                  <th className="p-5 font-medium">Scan ID</th>
                  <th className="p-5 font-medium">Time (UTC)</th>
                  <th className="p-5 font-medium">Type</th>
                  <th className="p-5 font-medium">Verdict</th>
                  <th className="p-5 font-medium text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan) => (
                  <tr 
                    key={scan.scan_id} 
                    onClick={() => setSelectedScan(scan)}
                    className={`cursor-pointer border-b border-gray-800/30 hover:bg-gray-800/40 transition-all duration-200 ${
                      selectedScan?.scan_id === scan.scan_id ? 'bg-gray-800/60 border-l-4 border-l-neon-cyan' : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <td className="p-5 font-mono text-xs text-gray-300">{scan.scan_id.substring(0,8)}</td>
                    <td className="p-5 text-sm text-gray-400 font-mono">{new Date(scan.scanned_at).toLocaleTimeString()}</td>
                    <td className="p-5 text-sm text-gray-300 capitalize">{scan.content_type}</td>
                    <td className="p-5">{getVerdictBadge(scan.verdict)}</td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-3 text-lg font-mono">
                        <span className={scan.verdict === 'Malicious' ? 'text-neon-red drop-shadow w-8 text-right' : 'w-8 text-right'}>
                          {(scan.threat_score * 100).toFixed(0)}
                        </span>
                        {scan.verdict === 'Safe' ? (
                          <ShieldCheck size={20} className="text-neon-green" />
                        ) : (
                           <ShieldAlert size={20} className={scan.verdict === 'Malicious' ? 'text-neon-red' : 'text-neon-yellow'} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel (XAI) */}
        <div className="lg:col-span-1 h-[70vh]">
          {selectedScan ? (
            <Alerts alert={selectedScan} />
          ) : (
            <div className="bg-cyber-card border border-gray-800 rounded-xl p-6 h-full flex flex-col items-center justify-center text-gray-500 font-mono text-sm opacity-50">
              <Shield size={48} className="mb-4" />
              <span>Select a scan to view XAI details.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
