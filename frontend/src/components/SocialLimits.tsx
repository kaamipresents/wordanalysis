import React from 'react';
import { motion } from 'framer-motion';

interface SocialLimitsProps {
  charCount: number;
}

export const SocialLimits: React.FC<SocialLimitsProps> = ({ charCount }) => {
  const networks = [
    { name: 'X (Twitter)', limit: 280, icon: '𝕏' },
    { name: 'LinkedIn', limit: 3000, icon: 'in' },
    { name: 'Meta Desc.', limit: 160, icon: 'M' }
  ];

  const getStatusColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio >= 1) return 'bg-red-500 from-red-500 to-red-400';
    if (ratio >= 0.8) return 'bg-amber-500 from-amber-500 to-amber-400';
    return 'bg-accent from-teal-500 to-accent';
  };

  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-bold mb-4 text-slate-100 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M12 20v-6M6 20V10M18 20V4"></path></svg>
        Social Limits
      </h3>
      
      <div className="space-y-4">
        {networks.map((net, idx) => {
          const ratio = Math.min(charCount / net.limit, 1);
          const remaining = net.limit - charCount;
          const isOver = charCount > net.limit;

          return (
            <motion.div 
              key={net.name}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-800 text-xs font-bold text-slate-400">
                    {net.icon}
                  </span>
                  {net.name}
                </span>
                <span className={`font-mono ${isOver ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                  {isOver ? `-${Math.abs(remaining)}` : remaining}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden shadow-inner flex">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${ratio * 100}%` }}
                  transition={{ duration: 0.4, type: 'tween' }}
                  className={`h-full bg-gradient-to-r ${getStatusColor(charCount, net.limit)}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
