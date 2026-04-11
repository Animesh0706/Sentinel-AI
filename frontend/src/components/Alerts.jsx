import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Brain, Fingerprint, CheckCircle2, AlertTriangle, Bot } from 'lucide-react';

const Alerts = ({ alert, integrityStatus, onOpenChat }) => {
  if (!alert) return null;

  const isMalicious = alert.verdict === 'Malicious';
  const isSuspicious = alert.verdict === 'Suspicious';
  const themeColor = isMalicious ? 'text-neon-red' : isSuspicious ? 'text-neon-yellow' : 'text-neon-green';
  const bgGlow = isMalicious ? 'shadow-[0_0_20px_rgba(255,51,85,0.15)]' : '';

  const mlConfidence = alert.ml_confidence != null ? alert.ml_confidence : null;

  return (
    <div className={`bg-[#12141c] border border-cyber-border rounded-2xl p-5 h-full flex flex-col overflow-hidden ${bgGlow}`}>
      {/* Header — compact */}
      <div className="flex justify-between items-start mb-4 pb-3 border-b border-cyber-border/50 shrink-0">
        <div className="flex gap-3">
          <div className="pt-1">
            <Shield className="text-neon-cyan" size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">Deep Analysis</h3>
            <p className="text-[10px] font-mono text-gray-500 mt-0.5 flex items-center gap-1.5">
              <span className="text-neon-red scale-125 leading-none">⚡</span> AI CONFIDENCE: {mlConfidence != null ? 'HYBRID' : 'HEURISTIC'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${themeColor}`}>
            {(alert.threat_score * 100).toFixed(0)}<span className="text-lg text-gray-500 font-light">%</span>
          </div>
          <div className="text-[9px] uppercase tracking-widest text-[#cf5369] font-mono mt-0.5">RISK SCORE</div>
        </div>
      </div>

      {/* Compact info row: ML Confidence + Integrity side by side */}
      <div className={`shrink-0 grid gap-2 mb-3 ${mlConfidence != null && integrityStatus ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* ML Confidence Bar */}
        {mlConfidence != null && (
          <div className="bg-[#181a24] rounded-lg p-3 border border-[#232733]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Brain size={12} className="text-neon-purple" />
                <p className="text-[9px] font-mono tracking-wider text-gray-500">SEMANTIC ML</p>
              </div>
              <span className="text-xs font-mono text-neon-purple font-bold">{(mlConfidence * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-[#0d0f14] rounded-full h-1.5 overflow-hidden border border-[#2a2d3b]">
              <div
                className="bg-gradient-to-r from-neon-purple to-neon-cyan h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(mlConfidence * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Integrity Badge */}
        {integrityStatus && (
          <div className={`rounded-lg p-3 border flex items-center gap-2 ${
            integrityStatus.is_tampered === false
              ? 'bg-[#0f1f16] border-neon-green/20'
              : integrityStatus.is_tampered === true
              ? 'bg-[#1f0f12] border-neon-red/20'
              : 'bg-[#181a24] border-[#232733]'
          }`}>
            {integrityStatus.is_tampered === false ? (
              <>
                <CheckCircle2 size={16} className="text-neon-green shrink-0" />
                <p className="text-[10px] font-mono text-neon-green font-bold tracking-wider">DATA VERIFIED</p>
              </>
            ) : integrityStatus.is_tampered === true ? (
              <>
                <AlertTriangle size={16} className="text-neon-red shrink-0" />
                <p className="text-[10px] font-mono text-neon-red font-bold tracking-wider">INTEGRITY BREACH</p>
              </>
            ) : (
              <>
                <Fingerprint size={16} className="text-gray-500 shrink-0" />
                <p className="text-[10px] font-mono text-gray-400 tracking-wider">PENDING</p>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Source Intelligence (Phase 5) — compact */}
      {(alert.sender || alert.subject) && (
        <div className="shrink-0 mb-3 bg-[#181a24] rounded-lg p-3 border border-[#232733]">
          <p className="text-[9px] font-mono tracking-widest text-gray-500 mb-2">SOURCE INTELLIGENCE</p>
          {alert.sender && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-mono text-gray-500 uppercase w-14 shrink-0">Sender</span>
              <span className="text-xs text-neon-cyan font-mono truncate">{alert.sender}</span>
            </div>
          )}
          {alert.subject && (
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-gray-500 uppercase w-14 shrink-0">Subject</span>
              <span className="text-xs text-gray-300 font-mono truncate">{alert.subject}</span>
            </div>
          )}
        </div>
      )}

      {/* Detected Vectors — scrollable, takes remaining space */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
        <p className="text-[10px] font-mono tracking-widest text-gray-500 mb-3 px-1 sticky top-0 bg-[#12141c] pb-1">DETECTED VECTORS</p>
        
        <div className="space-y-3">
          {alert.explanations.map((exp, idx) => (
            <div key={idx} className="bg-[#181a24] rounded-lg p-3 border border-[#232733]">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border border-neon-purple flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-purple"></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-200">{exp.indicator}</span>
                </div>
                <div className="bg-[#242733] px-2 py-0.5 rounded text-xs font-mono text-gray-400">
                  {(exp.weight * 100).toFixed(0)}%
                </div>
              </div>
              
              <div className="w-full bg-[#0d0f14] rounded-full h-1 mb-3 overflow-hidden border border-[#2a2d3b]">
                <div 
                  className="bg-gradient-to-r from-neon-cyan to-neon-purple h-full rounded-full" 
                  style={{ width: `${Math.min(exp.weight * 100, 100)}%` }}
                ></div>
              </div>
              
              <div className="bg-[#10121a] rounded p-2 text-[11px] text-gray-400 font-mono leading-relaxed border border-[#1a1c24]">
                {exp.detail}
              </div>
            </div>
          ))}

          {alert.explanations.length === 0 && (
            <div className="text-center py-6 text-gray-500 font-mono text-sm border border-dashed border-cyber-border rounded-xl">
              No specific threat vectors analyzed.
            </div>
          )}
        </div>
      </div>
      
      {/* Final Authorization Block — pinned at bottom */}
      <div className="mt-3 pt-3 shrink-0">
        <div className="border border-cyber-border rounded-xl p-3 bg-[#141620] flex justify-between items-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[9px] font-mono text-gray-500 tracking-widest uppercase mb-0.5">Final Authorization</p>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isMalicious ? 'bg-neon-red shadow-[0_0_10px_#ff3355]' : isSuspicious ? 'bg-neon-yellow shadow-[0_0_10px_#ffb800]' : 'bg-neon-green shadow-[0_0_10px_#00ff88]'}`}></div>
              <span className={`font-bold tracking-widest text-base uppercase ${themeColor}`}>{alert.verdict}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <button
              onClick={onOpenChat}
              className="mr-2 px-3 py-1.5 rounded-lg border border-neon-cyan/30 text-[10px] font-mono text-neon-cyan hover:bg-neon-cyan/10 transition-colors flex items-center gap-1.5"
            >
              <Bot size={12} />
              ASK SENTINEL
            </button>
            <div className={`w-9 h-9 rounded border ${isMalicious ? 'border-neon-red/30 text-neon-red' : isSuspicious ? 'border-neon-yellow/30 text-neon-yellow' : 'border-neon-green/30 text-neon-green'} flex items-center justify-center bg-black/20`}>
               {isMalicious ? <ShieldAlert size={18} /> : isSuspicious ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
            </div>
          </div>
          
          {isMalicious && (
            <div className="absolute top-0 left-0 w-32 h-32 bg-neon-red opacity-[0.03] blur-2xl rounded-full"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
