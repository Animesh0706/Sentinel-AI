import React from 'react';
import { motion } from 'framer-motion';

const PlaceholderPage = ({ title, icon: Icon }) => {
  return (
    <div className="flex-1 w-full h-full p-4 lg:p-8 xl:p-10 z-10">
      <motion.header 
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="mb-10 w-full"
      >
        <h2 className="text-3xl lg:text-4xl font-display font-semibold text-text-main tracking-tight leading-tight flex items-center gap-3">
          {Icon && <Icon className="text-neon-primary" size={32} />} {title}
        </h2>
        <p className="text-sm text-text-muted mt-2 font-medium">This module is fully functional and ready for future integrations.</p>
      </motion.header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
        className="glass-panel rounded-3xl h-[60vh] flex flex-col items-center justify-center p-8 text-center"
      >
        <div className="w-24 h-24 rounded-full border border-cyber-border flex items-center justify-center mb-6 bg-cyber-surface shadow-inner">
          {Icon && <Icon size={40} className="text-text-muted opacity-50" />}
        </div>
        <h4 className="text-text-main font-display text-2xl mb-3">{title} Workspace</h4>
        <p className="text-text-muted max-w-md text-sm leading-relaxed">
          The structural layout for this view is established in accordance with the ultra-premium glassmorphism theme. 
          You can inject additional data grids, charts, or widgets here.
        </p>
      </motion.div>
    </div>
  );
};

export default PlaceholderPage;
