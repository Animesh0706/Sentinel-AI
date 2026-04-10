import React from 'react';
import { motion } from 'framer-motion';
import { Hexagon, LayoutDashboard, Network, Database, Crosshair, Settings, Moon, Sun } from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage, theme, toggleTheme }) => {
  const menuItems = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'Threat Intel', icon: Network, label: 'Threat Intel' },
    { id: 'Logs & Reports', icon: Database, label: 'Logs & Reports' },
    { id: 'Live Monitoring', icon: Crosshair, label: 'Live Monitoring' },
  ];

  return (
    <nav className="hidden lg:flex flex-col w-64 glass-panel border-r-[1px] border-y-0 border-l-0 border-cyber-border h-screen fixed left-0 top-0 pt-6 px-4 pb-8 z-50">
      <div className="flex items-center gap-3 px-2 mb-12 cursor-pointer" onClick={() => setCurrentPage('Dashboard')}>
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-neon-primary/20 border border-neon-primary/30">
          <Hexagon className="text-neon-primary animate-pulse" size={24} />
        </div>
        <h1 className="text-2xl font-display font-bold tracking-tight text-text-main">
          Sentinel<span className="text-neon-primary font-light">AI</span>
        </h1>
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="px-3 py-1 mb-2 text-xs font-mono text-text-muted uppercase tracking-widest opacity-80">Main Menu</div>
        {menuItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <button 
              key={item.id} 
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative
                ${active ? 'bg-black/10 dark:bg-white/10 text-text-main shadow-inner border border-cyber-border' : 'text-text-muted hover:text-text-main hover:bg-cyber-surface'}`}
            >
              <item.icon size={18} className={active ? "text-neon-primary" : ""} />
              <span className="font-medium text-sm">{item.label}</span>
              {active && <motion.div layoutId="sidebar-active" className="absolute right-3 w-1.5 h-1.5 rounded-full bg-neon-primary shadow-[0_0_8px_var(--neon-primary)]" />}
            </button>
          );
        })}
      </div>

      <div className="mt-auto space-y-2">
        <div className="px-3 py-1 mb-2 text-xs font-mono text-text-muted uppercase tracking-widest opacity-80">System</div>
        
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-text-muted hover:text-text-main hover:bg-cyber-surface transition-all"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="font-medium text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
        </button>

        <button 
          onClick={() => setCurrentPage('Settings')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all 
            ${currentPage === 'Settings' ? 'bg-black/10 dark:bg-white/10 text-text-main shadow-inner border border-cyber-border' : 'text-text-muted hover:text-text-main hover:bg-cyber-surface'}`}
        >
          <Settings size={18} className={currentPage === 'Settings' ? "text-neon-primary" : ""} />
          <span className="font-medium text-sm">Settings</span>
          {currentPage === 'Settings' && <motion.div layoutId="sidebar-active" className="absolute right-3 w-1.5 h-1.5 rounded-full bg-neon-primary shadow-[0_0_8px_var(--neon-primary)]" />}
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
