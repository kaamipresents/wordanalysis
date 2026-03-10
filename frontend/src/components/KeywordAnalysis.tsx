import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, MessageSquare, PlusCircle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://127.0.0.1:5000';

interface AnalysisResults {
  keywords: string[];
  seo_keywords: string[];
  geo_keywords: string[];
  aeo_keywords: string[];
  google_suggestions: string[];
}

interface KeywordAnalysisProps {
  isSubscribed?: boolean;
  onSubscribeSuccess?: () => void;
  inputText?: string;
}

export function KeywordAnalysis({ isSubscribed = false, onSubscribeSuccess, inputText = '' }: KeywordAnalysisProps) {
  const [text, setText] = useState(inputText);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  
  const extractErrorMessage = (err: any, fallback: string) => {
    let msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || fallback;
    if (typeof msg === 'object') {
      return msg.message || JSON.stringify(msg);
    }
    return String(msg);
  };

  // Sync with main editor text changes
  useEffect(() => {
    setText(inputText);
  }, [inputText]);

  // Auto-analyze debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isSubscribed && text.trim()) {
        handleAnalyze();
      } else if (!text.trim()) {
        setResults(null);
      }
    }, 800);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, isSubscribed]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscription state
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setSubscribeError('Please enter a valid email address.');
      return;
    }

    setIsSubscribing(true);
    setSubscribeError(null);

    try {
      await axios.post(`${API_BASE_URL}/api/analytics/subscribe`, { email });
      if (onSubscribeSuccess) {
         onSubscribeSuccess();
      }
    } catch (err: any) {
       setSubscribeError(extractErrorMessage(err, 'Failed to subscribe. Please try again.'));
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please enter a sentence or paragraph to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/analytics/analyze`, { text }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'test-token'}`
        }
      });
      
      const data = response.data;
      setResults({
        keywords: data.keywords || [],
        seo_keywords: data.seo_keywords || [],
        geo_keywords: data.geo_keywords || [],
        aeo_keywords: data.aeo_keywords || [],
        google_suggestions: data.google_suggestions || []
      });
    } catch (err: any) {
      console.error('Keyword analysis API error:', err);
      setError(extractErrorMessage(err, 'Analysis failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const ResultList = ({ title, items, icon: Icon, colorClass }: { title: string, items: string[], icon: any, colorClass: string }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-50">
        <div className={`p-2 rounded-xl ${colorClass} bg-opacity-10 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-').replace('-100', '-600')}`} />
        </div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <span className="ml-auto bg-slate-100 text-slate-500 text-xs font-semibold px-2 py-1 rounded-full">
          {items.length}
        </span>
      </div>
      
      {items.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">No results found.</p>
      ) : (
        <ul className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
          {items.map((item, idx) => (
            <motion.li 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={idx} 
              className="group flex gap-3 text-sm rounded-lg p-2 hover:bg-slate-50 transition-colors"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-slate-600 font-medium">{item}</span>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );

  return (
    <div className="w-full relative">
      {/* Premium Overlay */}
      {!isSubscribed && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center rounded-2xl bg-white/40 backdrop-blur-[6px] border border-slate-200 shadow-sm transition-all duration-300">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full flex flex-col items-center space-y-4 transform hover:scale-[1.02] transition-transform">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-inner">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Keyword Analytics</h3>
            <p className="text-slate-500 font-medium">
              Unlock AI-powered SEO, GEO, and AEO keyword extraction to optimize your content.
            </p>
            
            <form onSubmit={handleSubscribe} className="w-full mt-4 flex flex-col gap-3">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-slate-700"
                required
              />
              {subscribeError && (
                <p className="text-rose-500 text-sm text-left px-1">{subscribeError}</p>
              )}
              <button 
                type="submit"
                disabled={isSubscribing}
                className={`w-full py-3 text-white font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                  isSubscribing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-95'
                }`}
              >
                {isSubscribing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Unlock Now'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`w-full space-y-6 transition-all duration-500 relative z-10`}>
        {/* Header Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Keyword Analytics Engine</h2>
            <p className="text-slate-500 text-sm">Extract SEO, GEO, and AEO keyword variations from your text</p>
          </div>
        </div>

          <div className="relative mt-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!isSubscribed}
              placeholder="Enter a sentence or paragraph (e.g., 'LED bulbs save electricity for home lighting')"
              className={`w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-xl rounded-b-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none text-slate-700 ${!isSubscribed ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`}
            />
            <div className="bg-slate-50 border border-slate-200 border-t-0 rounded-b-xl flex justify-between items-center p-3">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI-Powered
              </span>
              <button
                onClick={handleAnalyze}
                disabled={loading || !isSubscribed}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white transition-all shadow-md transform active:scale-95 ${
                  loading || !isSubscribed ? 'bg-indigo-300 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
                }`}
              >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? 'Analyzing...' : 'Analyze Text'}
            </button>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-lg text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {results && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ResultList 
              title="Extracted Keywords" 
              items={results.keywords} 
              icon={Search} 
              colorClass="bg-blue-500" 
            />
            <ResultList 
              title="SEO Keywords" 
              items={results.seo_keywords} 
              icon={PlusCircle} 
              colorClass="bg-emerald-500" 
            />
            <ResultList 
              title="GEO Keywords" 
              items={results.geo_keywords} 
              icon={MessageSquare} 
              colorClass="bg-purple-500" 
            />
            <ResultList 
              title="AEO Keywords" 
              items={results.aeo_keywords} 
              icon={Sparkles} 
              colorClass="bg-amber-500" 
            />
            <ResultList 
              title="Google Suggestions" 
              items={results.google_suggestions} 
              icon={Search} 
              colorClass="bg-rose-500" 
            />
          </div>
        )}
      </AnimatePresence>
      
        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 20px; }
        `}} />
      </div>
    </div>
  );
}
