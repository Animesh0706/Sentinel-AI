import React from 'react';

const Alerts = ({ alert }) => {
  if (!alert) return null;

  return (
    <div className="bg-cyber-card border border-neon-cyan/30 rounded-xl p-6 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
      <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
        <span className="text-neon-cyan">■</span> Explainable AI Analysis
      </h3>
      
      <div className="space-y-6">
        {alert.explanations.map((exp, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300 font-mono">{exp.indicator}</span>
              <span className="text-neon-purple font-mono">{(exp.weight * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
              <div 
                className="bg-neon-purple h-2 rounded-full shadow-[0_0_10px_#b5179e] transition-all duration-500 ease-out" 
                style={{ width: `${Math.min(exp.weight * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-1 border-l-2 border-gray-700 pl-2">
              {exp.detail}
            </p>
          </div>
        ))}
        {alert.explanations.length === 0 && (
          <div className="text-gray-500 font-mono text-sm">No specific threat indicators detected.</div>
        )}
      </div>
      
      <div className="mt-8 pt-4 border-t border-gray-800">
        <div className="flex justify-between text-xs text-gray-500 font-mono">
          <span>Verdict: <span className={alert.verdict === 'Malicious' ? 'text-neon-red' : alert.verdict === 'Suspicious' ? 'text-neon-yellow' : 'text-neon-green'}>{alert.verdict}</span></span>
          <span>Score: {(alert.threat_score * 100).toFixed(0)}/100</span>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
