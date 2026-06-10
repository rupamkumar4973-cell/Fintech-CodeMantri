import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { 
  Sparkles, 
  Cpu, 
  TrendingUp, 
  HelpCircle, 
  Heart, 
  CheckCircle, 
  ChevronRight, 
  ArrowRight,
  TrendingDown,
  ShieldCheck
} from 'lucide-react';

interface Recommendation {
  title: string;
  description: string;
  badge: string;
}

interface RecommendationsData {
  cibilScore: number;
  financialHealthScore: number;
  riskCategory: string;
  suggestions: string[];
  recommendations: Recommendation[];
}

export default function AiRecommendationsPage() {
  const [data, setData] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await api.get('/loan/recommendations');
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching recommendation details.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-800/50';
    if (score >= 55) return 'text-blue-500 bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-800/50';
    return 'text-red-500 bg-red-50 border-red-100 dark:bg-red-955/10 dark:border-red-800/50';
  };

  const getHealthBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 55) return 'bg-blue-600';
    return 'bg-red-500';
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-slate-400 font-sans">AI Recommendations Engine processing data...</div>;
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl bg-red-50 p-4 border border-red-200 dark:bg-red-955/10 dark:border-red-800/50 text-red-750 dark:text-red-400">
        <h3 className="font-bold mb-1">Could not fetch recommendations</h3>
        <p className="text-sm">{error || 'Please complete KYC first to activate AI risk models.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">AI Recommendations</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">
          Customized financial health scoring, score repair suggestions, and personalized loan configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
        
        {/* HEALTH & RISK SCORECARD */}
        <div className="glass rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6 md:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Financial Health Index</span>
            <div className={`rounded-2xl border p-4 text-center mt-3 ${getHealthColor(data.financialHealthScore)}`}>
              <Heart className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <span className="block text-4xl font-extrabold text-slate-900 dark:text-white">{data.financialHealthScore}%</span>
              <span className="block text-xs uppercase font-bold tracking-wider text-slate-400 mt-2">Overall Scoring Ratio</span>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-350">
              <span>Credit Score Quality</span>
              <span>{data.cibilScore} CIBIL</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-1 dark:bg-slate-700">
              <div 
                className={`h-2 rounded-full ${getHealthBarColor(data.financialHealthScore)}`}
                style={{ width: `${data.financialHealthScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* CREDIT REPAIR ADVISORY */}
        <div className="glass rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6 md:col-span-3 space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <span>Credit repair suggestions</span>
          </h2>

          <div className="space-y-4">
            {data.suggestions.map((sug, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 rounded-2xl bg-slate-50/50 p-4 border border-slate-100 dark:border-slate-800 dark:bg-slate-950/20 text-xs text-slate-655 dark:text-slate-350"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {idx + 1}
                </div>
                <p className="leading-relaxed font-sans">{sug}</p>
              </div>
            ))}
            {data.suggestions.length === 0 && (
              <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 border border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-800/40 text-xs text-slate-655 dark:text-slate-350">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <p>Outstanding credit behavior. No repair actions recommended. You are locked in for the lowest rates available.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* PERSONALIZED OFFERS */}
      <div className="glass rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6 space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <span>Recommended Products for You</span>
        </h2>

        {data.recommendations.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl dark:border-slate-800">
            <TrendingDown className="h-10 w-10 text-slate-350 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-655 dark:text-slate-400">No product recommendations</p>
            <p className="text-xs text-slate-455 mt-1">Check loan eligibility with different loan amounts to unlock recommendations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {data.recommendations.map((rec, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/20 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 uppercase">
                      {rec.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{rec.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">{rec.description}</p>
                </div>
                <div className="border-t border-slate-100 pt-3 mt-1 dark:border-slate-800 flex justify-end">
                  <Link 
                    to="/eligibility"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    <span>Configure limits</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
