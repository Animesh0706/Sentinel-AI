import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PlaceholderPage from './components/PlaceholderPage';
import { Network, Database, Crosshair, Settings } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [theme, setTheme] = useState('dark');

  // Trigger re-render of Tailwind's light mode class on root
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const renderContent = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Threat Intel':
        return <PlaceholderPage title="Threat Intelligence Explorer" icon={Network} />;
      case 'Logs & Reports':
        return <PlaceholderPage title="System Logs & Audit Reports" icon={Database} />;
      case 'Live Monitoring':
        return <PlaceholderPage title="Real-Time Network Map" icon={Crosshair} />;
      case 'Settings':
        return <PlaceholderPage title="Security Configuration & Settings" icon={Settings} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      {/* Global Background Elements */}
      <div className="bg-mesh"></div>
      <div className="bg-noise"></div>
      
      <div className="min-h-screen font-sans selection:bg-neon-primary/30 flex text-text-main transition-colors duration-500">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} theme={theme} toggleTheme={toggleTheme} />
        
        <main className="flex-1 lg:ml-64 w-full h-full z-10 transition-all duration-300">
          {renderContent()}
        </main>
      </div>
    </>
  );
}

export default App;
