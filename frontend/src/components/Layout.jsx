import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex bg-cyber-bg min-h-screen text-gray-200 font-sans selection:bg-neon-cyan/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main content wrapper with margin-left to offset fixed sidebar */}
      <div className="pl-64 flex-1 flex flex-col h-screen overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default Layout;
