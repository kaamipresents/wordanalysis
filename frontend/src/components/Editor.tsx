import React from 'react';
import type { AnalyticsResult } from '../types';
import { motion } from 'framer-motion';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  metrics: AnalyticsResult;
}

const StripedIcon = ({ id, className }: { id: string, className: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" className={className}>
    <defs>
      <pattern id={id} width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="2.5" />
      </pattern>
    </defs>
    <circle cx="12" cy="12" r="12" fill={`url(#${id})`} />
  </svg>
);

export const Editor: React.FC<EditorProps> = ({ value, onChange, isLoading, metrics }) => {
  const [fontIndex, setFontIndex] = React.useState(0);
  
  const fontFamilies = [
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    'Inter, Roboto, system-ui, sans-serif',
    'Georgia, serif',
    'Times New Roman, serif',
    'Arial, Helvetica, sans-serif',
    'Verdana, Geneva, sans-serif',
    'Trebuchet MS, Helvetica, sans-serif',
    'Impact, Charcoal, sans-serif',
    'Comic Sans MS, cursive, sans-serif'
  ];

  const handleFontCycle = () => {
    setFontIndex((prev) => (prev + 1) % fontFamilies.length);
  };

  const toggleCase = () => {
    if (!value) return;
    if (value === value.toUpperCase()) {
      onChange(value.toLowerCase());
    } else {
      onChange(value.toUpperCase());
    }
  };

  const socialLimits = [
    { name: 'Facebook', limit: 250, color: 'bg-social-fb' },
    { name: 'Twitter', limit: 280, color: 'bg-social-tw' },
    { name: 'Google', limit: 300, color: 'bg-social-li' },
  ];

  const charCount = metrics.char_count_spaces;

  return (
    <div className="flex flex-col md:flex-row h-full bg-transparent gap-4 relative">
      
      {/* Floating Toolbar */}
      <div className="w-full md:w-12 flex flex-row md:flex-col gap-2 py-2 md:py-4 px-4 md:px-0 items-center justify-center md:items-center bg-white rounded-2xl shadow-sm border border-slate-200">
        <button title="Save" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-accent hover:bg-slate-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        </button>
        <button title="Grammar Check" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-accent hover:bg-slate-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        </button>
        <button title="Reset" onClick={() => onChange('')} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-slate-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
        </button>
        <div className="w-px h-6 md:w-6 md:h-px bg-slate-200 mx-1 md:my-1 md:mx-0"></div>
        <button title="Toggle Case" onClick={toggleCase} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-accent hover:bg-slate-50 transition-colors font-bold font-serif">
          TT
        </button>
        <button title="Change Font" onClick={handleFontCycle} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-accent hover:bg-slate-50 transition-colors font-bold font-serif">
          Aa
        </button>
      </div>

      {/* Main Editor Card */}
      <div className="glass-panel flex-1 flex flex-col overflow-hidden relative min-h-[300px] md:min-h-0">
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden z-10">
            <motion.div 
              className="h-full bg-accent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        )}

        {/* Editor Header Stats & Socials */}
        <div className="p-4 md:p-6 pb-4 border-b border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-slate-50/50">
          
          <div className="flex gap-8 w-full justify-between md:justify-start md:w-auto">
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold text-primary tracking-tight">{metrics.word_count}</span>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Words</span>
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold text-primary tracking-tight">{charCount}</span>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Characters</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-64">
            {socialLimits.map((net) => {
              const ratio = Math.min(charCount / net.limit, 1);
              const isOver = charCount > net.limit;
              return (
                <div key={net.name} className="flex items-center gap-2">
                  <div className="w-16 text-xs font-semibold text-slate-500 whitespace-nowrap">{net.name}</div>
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${isOver ? 'bg-red-400' : net.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${ratio * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="w-8 text-right text-xs font-mono text-slate-400">
                    {net.limit - charCount}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Text Area */}
        <textarea
          className="flex-1 w-full p-4 md:p-6 resize-none text-lg text-slate-800 placeholder-slate-300 leading-relaxed bg-transparent border-0 focus:ring-0 outline-none"
          style={{ fontFamily: fontFamilies[fontIndex] }}
          placeholder="Type or paste your text here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck="false"
        />

        {/* Footer Secondary Stats */}
        <div className="p-4 md:p-6 border-t border-slate-100 bg-white/50 flex flex-wrap gap-8 md:gap-16 items-center">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] uppercase tracking-wider font-semibold text-slate-500">Sentences</span>
            <div className="flex items-center gap-3">
              <StripedIcon id="diagCyan" className="text-cyan-400" />
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{metrics.sentence_count}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[12px] uppercase tracking-wider font-semibold text-slate-500">Paragraphs</span>
            <div className="flex items-center gap-3">
              <StripedIcon id="diagEmerald" className="text-emerald-400" />
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{metrics.paragraph_count}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[12px] uppercase tracking-wider font-semibold text-slate-500">Pages</span>
            <div className="flex items-center gap-3">
              <StripedIcon id="diagLime" className="text-lime-400" />
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{parseFloat((metrics.word_count / 250).toFixed(1))}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

