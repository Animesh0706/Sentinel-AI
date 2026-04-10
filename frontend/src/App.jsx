import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PlaceholderView from './components/PlaceholderView';
import { Network, Database, Shield } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
