import React, { useState, useEffect } from 'react';
import { Network, Database, Shield, LayoutDashboard, Sun, Settings, Hexagon, Activity } from 'lucide-react';
import { checkHealth } from '../services/api';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [health, setHealth] = useState({ status: "Connecting...", mongodb: "disconnected", redis: "disconnected", ai_engine: "offline" });

  useEffect(() => {
    const fetchHealth = async () => {
      const data = await checkHealth();
      setHealth(data);
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const StatusDot = ({ status }) => {
    const isOnline = status === 'connected' || status === 'online';
    return (
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-neon-green shadow-[0_0_8px_rgba(0,255,136,0.6)] animate-pulse' : 'bg-neon-red shadow-[0_0_8px_rgba(255,51,85,0.6)]'}`}></div>
    );
  };
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'threat-intel', label: 'Threat Intel', icon: Network },
    { id: 'logs', label: 'Logs & Reports', icon: Database },
    { id: 'live', label: 'Live Monitoring', icon: Shield },
  ];

  return (
    <div className="w-64 h-screen bg-cyber-sidebar border-r border-cyber-border flex flex-col justify-between shrink-0 fixed left-0 top-0 overflow-y-auto">
      <div>
        {/* Logo Section */}
        <div className="p-6 flex items-center gap-3 border-b border-cyber-border/30">
          <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex flex-col items-center justify-center border border-neon-cyan/20 shadow-[0_0_15px_rgba(0,229,255,0.15)] text-neon-cyan">
            <Hexagon size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-wide text-white">
            Sentinel<span className="text-neon-cyan font-light">AI</span>
          </h1>
        </div>

        {/* Main Menu */}
        <div className="px-4 py-8">
          <p className="text-xs font-mono tracking-widest text-gray-500 mb-4 px-3">MAIN MENU</p>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-cyber-card-active border border-cyber-border text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]' 
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <Icon size={18} className={isActive ? 'text-neon-cyan' : ''} />
                      {item.label}
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(0,229,255,0.8)]"></div>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      {/* System Status (Phase 8 Pulse Dashboard) */}
      <div className="px-4 py-5 border-t border-cyber-border/30">
        <div className="flex items-center gap-2 mb-4 px-3">
          <Activity size={14} className="text-neon-cyan" />
          <p className="text-[10px] font-mono tracking-widest text-gray-500">SYSTEM PULSE</p>
        </div>
        <div className="space-y-3 px-3">
          <div className="flex items-center justify-between bg-[#12141c] border border-cyber-border rounded px-3 py-1.5">
            <span className="text-[10px] text-gray-400 font-mono tracking-wide">MONGODB</span>
            <StatusDot status={health.mongodb} />
          </div>
          <div className="flex items-center justify-between bg-[#12141c] border border-cyber-border rounded px-3 py-1.5">
            <span className="text-[10px] text-gray-400 font-mono tracking-wide">REDIS CACHE</span>
            <StatusDot status={health.redis} />
          </div>
          <div className="flex items-center justify-between bg-[#12141c] border border-cyber-border rounded px-3 py-1.5">
            <span className="text-[10px] text-gray-400 font-mono tracking-wide">AI ENGINE</span>
            <StatusDot status={health.ai_engine} />
          </div>
        </div>
      </div>

      {/* System Settings bottom chunk */}
      <div className="px-4 py-4 border-t border-cyber-border/30">
        <p className="text-[10px] font-mono tracking-widest text-gray-500 mb-3 px-3">PREFERENCES</p>
        <ul className="space-y-1">
          <li>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              <Sun size={18} />
              Light Mode
            </button>
          </li>
          <li>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              <Settings size={18} />
              Settings
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
