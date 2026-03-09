import React, { useState } from 'react';
import type { AnalyticsResult } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface RightSidebarProps {
  metrics: AnalyticsResult;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ metrics }) => {
  const [filter, setFilter] = useState<'TOP' | '1X' | '2X' | '3X'>('TOP');
  
  // Example filter logic based on count (this assumes your backend sends count)
  // For now, if the item doesn't have count we just show TOP.
  const getFilteredKeywords = () => {
    if (!metrics.keyword_density || metrics.keyword_density.length === 0) return [];
    
    // Sort by frequency (count) descending, then density if counts are equal
    const sorted = [...metrics.keyword_density].sort((a, b) => {
      const countDiff = (b.count || 0) - (a.count || 0);
      if (countDiff !== 0) return countDiff;
      return b.density - a.density;
    });
    
    if (filter === 'TOP') return sorted.slice(0, 10);
    if (filter === '3X') return sorted.filter(k => (k.count || Math.round(k.density)) >= 3);
    if (filter === '2X') return sorted.filter(k => (k.count || Math.round(k.density)) === 2);
    if (filter === '1X') return sorted.filter(k => (k.count || Math.round(k.density)) === 1);
    
    return sorted;
  };

  const displayKeywords = getFilteredKeywords();

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Keyword Filtering Card */}
      <div className="glass-panel p-6 flex flex-col flex-1 min-h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Keywords
          </h3>
          <div className="bg-slate-100 p-1 rounded-lg flex space-x-1 border border-slate-200">
            {['TOP', '1X', '2X', '3X'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  filter === f
                    ? 'bg-white text-accent shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {displayKeywords.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-slate-400 text-sm italic">Enter text to display keywords.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-3 px-3 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <div className="text-left">Keyword</div>
                <div className="text-center">Frequency</div>
                <div className="text-right">Density</div>
              </div>
              <AnimatePresence>
                {displayKeywords.map((item, idx) => (
                  <motion.div
                    key={item.word}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="grid grid-cols-3 items-center group p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 gap-2"
                  >
                    <span className="font-medium text-slate-700 group-hover:text-primary transition-colors text-left truncate pr-1">
                      {item.word}
                    </span>
                    <span className="text-sm font-semibold text-slate-600 text-center">
                      {item.count || 1}
                    </span>
                    <div className="text-right">
                      <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full inline-block">
                        {item.density.toFixed(1)}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
