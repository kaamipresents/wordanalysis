import { useState, useEffect, useCallback } from 'react';
import { Editor } from './components/Editor';
import { RightSidebar } from './components/RightSidebar';
import { KeywordAnalysis } from './components/KeywordAnalysis';
import type { AnalyticsResult } from './types';
import { defaultAnalytics } from './types';
import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://127.0.0.1:5000';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function App() {
  const [text, setText] = useState('');
  const [metrics, setMetrics] = useState<AnalyticsResult>(defaultAnalytics);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const debouncedText = useDebounce(text, 800);

  const calculateBasicMetrics = (content: string): Partial<AnalyticsResult> => {
    const words = content.match(/\b\w+\b/g) || [];
    const word_count = words.length;

    const char_count_spaces = content.length;
    const char_count_no_spaces = content.replace(/\s+/g, '').length;

    const sentences = content.split(/[.!?]+(?=\s|$)/);
    const sentence_count = sentences.filter(s => s.trim().length > 0).length;

    const paragraphs = content.trim().split(/\n\s*\n/);
    const paragraph_count = paragraphs.filter(p => p.trim().length > 0).length;
    
    // Additional helpful metrics for later
    const reading_time_mins = Math.round((word_count / 225) * 100) / 100;
    const speaking_time_mins = Math.round((word_count / 150) * 100) / 100;

    return {
      word_count,
      char_count_spaces,
      char_count_no_spaces,
      sentence_count,
      paragraph_count,
      reading_time_mins,
      speaking_time_mins,
    };
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    // Also parse local metrics right away so UI feels snappy
    const basicMetrics = calculateBasicMetrics(newText);
    setMetrics(prev => ({
      ...prev,
      ...basicMetrics
    }));
  };

  const performAnalysis = useCallback(async (content: string) => {
    if (!content.trim()) {
      setMetrics(prev => ({ ...prev, keyword_density: [] }));
      setIsAnalyzing(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/analytics/analyze`, { text: content }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'test-token'}`
        }
      });
      setMetrics(prev => ({
        ...prev,
        keyword_density: response.data.results.keyword_density,
      }));
    } catch (error) {
      console.error('Analysis error:', error);
      setMetrics(prev => ({ ...prev, keyword_density: [] }));
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    // When debounced text changes, trigger analysis
    if (debouncedText !== undefined) {
      setIsAnalyzing(true);
      performAnalysis(debouncedText);
    }
  }, [debouncedText, performAnalysis]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative font-sans">
      
      {/* Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              W
            </div>
            <h1 className="text-xl font-bold text-primary tracking-tight m-0">WordCounter</h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-slate-500 hover:text-primary font-medium transition-colors" aria-label="Blog">Blog</a>
            <a href="#" className="text-slate-500 hover:text-primary font-medium transition-colors" aria-label="Grammar">Grammar</a>
            <a href="#" className="text-slate-500 hover:text-primary font-medium transition-colors" aria-label="FAQ">FAQ</a>
            <a href="#" className="text-slate-500 hover:text-primary font-medium transition-colors" aria-label="Contact">Contact</a>
          </nav>

          <div className="flex items-center">
            <button 
              onClick={() => {
                if (!isSubscribed) {
                  const section = document.getElementById('keyword-analytics');
                  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className={`glass-button px-5 py-2 text-sm font-semibold flex items-center gap-2 transition-colors ${
                isSubscribed
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' 
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
              aria-label={isSubscribed ? "Subscribed to Keyword Analytics" : "Subscribe to Keyword Analytics"}
            >
              {isSubscribed ? (
                <>
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  Subscribed
                </>
              ) : (
                <>
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Subscribe
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-4rem)] flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Editor Card Component (70%) */}
          <div className="lg:col-span-8 min-h-[500px] flex flex-col">
            <Editor 
              value={text} 
              onChange={handleTextChange} 
              isLoading={isAnalyzing && text !== debouncedText}
              metrics={metrics}
            />
          </div>

          {/* Right Column: Analytics Dashboard (30%) */}
          <div className="lg:col-span-4 min-h-[500px]">
            <RightSidebar metrics={metrics} />
          </div>
          
        </div>

        {/* Bottom Section: Keyword Analytics */}
        <section className="mt-4 border-t border-slate-200 pt-8" id="keyword-analytics">
          <KeywordAnalysis isSubscribed={isSubscribed} onSubscribeSuccess={() => setIsSubscribed(true)} />
        </section>
      </main>
    </div>
  );
}

export default App;
