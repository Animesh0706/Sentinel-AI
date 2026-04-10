import React from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

const Alerts = ({ alert }) => {
  if (!alert) return null;

  const isMalicious = alert.verdict === 'Malicious';
  const isSuspicious = alert.verdict === 'Suspicious';
  const themeColor = isMalicious ? 'text-neon-red' : isSuspicious ? 'text-neon-yellow' : 'text-neon-green';
  const bgGlow = isMalicious ? 'shadow-[0_0_20px_rgba(255,51,85,0.15)]' : '';

  return (
    <div className={`bg-[#12141c] border border-cyber-border rounded-2xl p-6 h-full flex flex-col ${bgGlow}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-4 border-b border-cyber-border/50">
        <div className="flex gap-3">
          <div className="pt-1">
            <Shield className="text-neon-cyan" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">Deep Analysis</h3>
            <p className="text-xs font-mono text-gray-500 mt-1 flex items-center gap-1.5">
              <span className="text-neon-red scale-150 leading-none pb-1">⚡</span> AI CONFIDENCE: HIGH
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${themeColor}`}>
            {(alert.threat_score * 100).toFixed(0)}<span className="text-xl text-gray-500 font-light">%</span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-[#cf5369] font-mono mt-1">RISK SCORE</div>
        </div>
      </div>
      
      {/* Source Intelligence (Phase 5) */}
      {(alert.sender || alert.subject) && (
        <div className="mb-6 bg-[#181a24] rounded-xl p-4 border border-[#232733]">
          <p className="text-[11px] font-mono tracking-widest text-gray-500 mb-3">SOURCE INTELLIGENCE</p>
          {alert.sender && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase w-16 shrink-0">Sender</span>
              <span className="text-sm text-neon-cyan font-mono truncate">{alert.sender}</span>
            </div>
          )}
          {alert.subject && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase w-16 shrink-0">Subject</span>
              <span className="text-sm text-gray-300 font-mono truncate">{alert.subject}</span>
            </div>
          )}
        </div>
      )}

      {/* Detected Vectors */}
      <div className="flex-1 overflow-y-auto pr-2">
        <p className="text-[11px] font-mono tracking-widest text-gray-500 mb-4 px-1">DETECTED VECTORS</p>
        
        <div className="space-y-4">
          {alert.explanations.map((exp, idx) => (
            <div key={idx} className="bg-[#181a24] rounded-xl p-4 border border-[#232733]">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-neon-purple flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-purple"></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-200">{exp.indicator}</span>
                </div>
                <div className="bg-[#242733] px-2 py-0.5 rounded text-xs font-mono text-gray-400">
                  {(exp.weight * 100).toFixed(0)}%
                </div>
              </div>
              
              <div className="w-full bg-[#0d0f14] rounded-full h-1.5 mb-4 overflow-hidden border border-[#2a2d3b]">
                <div 
                  className="bg-gradient-to-r from-neon-cyan to-neon-purple h-full rounded-full" 
                  style={{ width: `${Math.min(exp.weight * 100, 100)}%` }}
                ></div>
              </div>
              
              <div className="bg-[#10121a] rounded p-3 text-xs text-gray-400 font-mono leading-relaxed border border-[#1a1c24]">
                {exp.detail}
              </div>
            </div>
          ))}

          {alert.explanations.length === 0 && (
            <div className="text-center py-8 text-gray-500 font-mono text-sm border border-dashed border-cyber-border rounded-xl">
              No specific threat vectors analyzed.
            </div>
          )}
        </div>
      </div>
      
      {/* Final Authorization Block */}
      <div className="mt-6 pt-4">
        <div className="border border-cyber-border rounded-xl p-4 bg-[#141620] flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase mb-1">Final Authorization</p>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isMalicious ? 'bg-neon-red shadow-[0_0_10px_#ff3355]' : isSuspicious ? 'bg-neon-yellow shadow-[0_0_10px_#ffb800]' : 'bg-neon-green shadow-[0_0_10px_#00ff88]'}`}></div>
              <span className={`font-bold tracking-widest text-lg uppercase ${themeColor}`}>{alert.verdict}</span>
            </div>
          </div>
          <div className={`w-10 h-10 rounded border ${isMalicious ? 'border-neon-red/30 text-neon-red' : isSuspicious ? 'border-neon-yellow/30 text-neon-yellow' : 'border-neon-green/30 text-neon-green'} flex items-center justify-center bg-black/20 relative z-10`}>
             {isMalicious ? <ShieldAlert size={20} /> : isSuspicious ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
          </div>
          
          {/* Subtle background glow mimicking the reference image */}
          {isMalicious && (
            <div className="absolute top-0 left-0 w-32 h-32 bg-neon-red opacity-[0.03] blur-2xl rounded-full"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
