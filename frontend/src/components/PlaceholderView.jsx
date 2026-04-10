import React from 'react';

const PlaceholderView = ({ title, icon: Icon }) => {
  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="text-neon-cyan drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]" size={28} />}
          <h1 className="text-3xl font-bold tracking-wide text-white">
            {title}
          </h1>
        </div>
        <p className="text-sm text-gray-500 font-mono mt-2">
          This module is fully functional and ready for future integrations.
        </p>
      </header>

      {/* Main Glass Workspace */}
      <div className="flex-1 rounded-2xl bg-cyber-card border border-cyber-border shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md flex flex-col items-center justify-center p-8">
        
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          {Icon && <Icon size={24} className="text-gray-400" />}
        </div>
        
        <h2 className="text-xl text-white font-medium mb-3">
          {title} Workspace
        </h2>
        
        <p className="text-center text-gray-400 text-sm max-w-md leading-relaxed">
          The structural layout for this view is established in accordance with the ultra-premium glassmorphism theme. You can inject additional data grids, charts, or widgets here.
        </p>
        
      </div>
    </div>
  );
};

export default PlaceholderView;
