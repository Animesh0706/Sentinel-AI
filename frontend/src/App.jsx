import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PlaceholderView from './components/PlaceholderView';
import Auth from './components/Auth';
import { Network, Database, Shield } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'threat-intel':
        return <PlaceholderView title="Threat Intelligence Explorer" icon={Network} />;
      case 'logs':
        return <PlaceholderView title="System Logs & Audit Reports" icon={Database} />;
      case 'live':
        return <PlaceholderView title="Real-Time Network Map" icon={Shield} />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
