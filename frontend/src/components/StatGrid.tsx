import React from 'react';
import type { AnalyticsResult } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface StatGridProps {
  metrics: AnalyticsResult;
}

export const StatGrid: React.FC<StatGridProps> = ({ metrics }) => {
  const stats = [
    { label: 'Words', value: metrics.word_count },
    { label: 'Characters', value: metrics.char_count_spaces },
    { label: 'Sentences', value: metrics.sentence_count },
    { label: 'Paragraphs', value: metrics.paragraph_count },
    { label: 'Reading Time', value: `${metrics.reading_time_mins}m` },
    { label: 'Speaking Time', value: `${metrics.speaking_time_mins}m` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <AnimatePresence>
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="stat-card group"
          >
            <motion.div 
              key={stat.value}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="stat-value"
            >
              {stat.value}
            </motion.div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
