import React, { useState } from 'react';
import { login, signup } from '../services/api';
import { ShieldAlert, Lock, User, Key, ArrowRight } from 'lucide-react';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(username, password);
        onAuthSuccess();
      } else {
        await signup(username, password);
        // After signup, log them in automatically
        await login(username, password);
        onAuthSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-cyber-bg relative overflow-hidden">
      {/* Decorative Grid & Orbs */}
      <div className="absolute inset-0 bg-cyber-grid bg-[length:40px_40px] opacity-20 z-0"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-cyan/20 blur-md rounded-full"></div>
              <ShieldAlert size={48} className="text-neon-cyan relative z-10" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-widest uppercase mb-2">Sentinel-AI</h1>
          <p className="text-sm font-mono text-gray-500 uppercase">Restricted Access // Auth Required</p>
        </div>

        <div className="bg-[#12141c] border border-[#232733] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Top border glow */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50"></div>

          <div className="flex mb-8 border-b border-[#232733]">
            <button 
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                isLogin ? 'text-neon-cyan border-b-2 border-neon-cyan' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              System Login
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                !isLogin ? 'text-neon-purple border-b-2 border-neon-purple' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Request Access
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-neon-red/10 border border-neon-red/20 text-neon-red text-sm font-mono p-3 rounded-xl">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-400 uppercase">Operative ID (Username)</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0a0c10] border border-[#232733] text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-neon-cyan/50 transition-colors"
                  placeholder="Enter your ID"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-400 uppercase">Security Key (Password)</label>
              <div className="relative">
                <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a0c10] border border-[#232733] text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-neon-cyan/50 transition-colors"
                  placeholder="Enter your key"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                isLogin 
                  ? 'bg-neon-cyan text-black hover:bg-neon-cyan/90 hover:shadow-[0_0_20px_rgba(0,255,136,0.4)]'
                  : 'bg-neon-purple text-white hover:bg-neon-purple/90 hover:shadow-[0_0_20px_rgba(157,0,255,0.4)]'
              }`}
            >
              {loading ? 'Authenticating...' : isLogin ? 'Initialize Session' : 'Register Operative'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center text-gray-600 text-xs font-mono">
          <p className="flex items-center justify-center gap-1">
            <Lock size={12} /> Confidentiality Module Phase 9.5
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
