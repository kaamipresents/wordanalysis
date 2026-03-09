import React from 'react';
import type { KeywordDensityItem } from '../types';
import { motion } from 'framer-motion';

interface KeywordDensityProps {
  items: KeywordDensityItem[];
}

export const KeywordDensity: React.FC<KeywordDensityProps> = ({ items }) => {
  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-bold mb-4 text-slate-100 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
        Keyword Density
      </h3>
      
      {items.length === 0 ? (
        <div className="text-sm text-slate-500 text-center py-6">
          Add some text to see keyword analysis. Stop words are automatically skipped.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <motion.div 
              key={item.word}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              transition={{ delay: idx * 0.05, duration: 0.5 }}
              className="relative"
            >
              <div className="flex justify-between items-center text-sm mb-1 z-10 relative px-1">
                <span className="font-medium text-slate-200">{item.word}</span>
                <span className="text-slate-400">
                  {item.count} <span className="text-xs opacity-60">({item.density}%)</span>
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(item.density * 5, 100)}%` }}
                  transition={{ delay: 0.2 + (idx * 0.05), duration: 0.8, type: 'spring' }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-accent"
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
