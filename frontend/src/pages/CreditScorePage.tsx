import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

import api from '../utils/api';
import { 
  TrendingUp, 
  Percent, 
  FileText, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface CreditProfile {
  score: number;
  creditUtilization: number;
  activeLoans: number;
  repaymentHistory: number;
  riskCategory: 'Low Risk' | 'Medium Risk' | 'High Risk';
}

export default function CreditScorePage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<CreditProfile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [requiresKyc, setRequiresKyc] = useState(false);

  useEffect(() => {
    const fetchCreditScore = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError('');
        setRequiresKyc(false);
        const response = await api.get(`/credit-score/${user._id}`);
        setProfile(response.data);
      } catch (err: any) {
        if (err.response?.data?.requiresKyc) {
          setRequiresKyc(true);
        } else {
          setError(err.response?.data?.message || 'Failed to fetch credit bureau details.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCreditScore();
  }, [user]);

  // Generate historical CIBIL data for charts based on current score
  const getChartData = (currentScore: number) => {
    return [
      { month: 'Jan', score: currentScore - 40 },
      { month: 'Feb', score: currentScore - 25 },
      { month: 'Mar', score: currentScore - 30 },
      { month: 'Apr', score: currentScore - 15 },
      { month: 'May', score: currentScore - 5 },
      { month: 'Jun', score: currentScore }
    ];
  };

  const getDialColor = (score: number) => {
    if (score > 750) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 650) return 'text-amber-500 stroke-amber-500';
    return 'text-red-500 stroke-red-500';
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Low Risk': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'Medium Risk': return 'bg-amber-100 text-amber-700 dark:bg-amber-955/10 dark:text-amber-400';
      default: return 'bg-red-100 text-red-700 dark:bg-red-955/10 dark:text-red-400';
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-slate-400">Fetching credit bureau profile...</div>;
  }

  if (requiresKyc) {
    return (
      <div className="py-12 text-center max-w-lg mx-auto border border-slate-200 bg-white rounded-3xl dark:border-slate-800 dark:bg-slate-900 shadow-sm p-8">
        <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">KYC Verification Required</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Federal banking API protocols require verified PAN identification cards before requesting credit history from CIBIL bureaus.
        </p>
        <Link 
          to="/kyc" 
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/10 hover:bg-blue-500"
        >
          <span>Upload KYC Documents</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-2xl bg-red-50 p-4 border border-red-250 dark:bg-red-955/10 dark:border-red-800/50 text-red-700 dark:text-red-400">
        <AlertTriangle className="h-6 w-6 mb-2" />
        <h3 className="font-bold">Error retrieving report</h3>
        <p className="text-sm">{error || 'An error occurred.'}</p>
      </div>
    );
  }

  // Dial values
  const currentScore = profile.score;
  const scorePercent = ((currentScore - 300) / 600) * 100;
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference;

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Credit bureau</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">
            Direct integration with credit scoring bureaus. Updated monthly.
          </p>
        </div>
        
        <div className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${getRiskBadgeColor(profile.riskCategory)}`}>
          {profile.riskCategory}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        
        {/* CIBIL Score Dial Card */}
        <div className="glass rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">CIBIL Score</span>
          
          <div className="relative flex items-center justify-center h-44 w-44">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="80"
                strokeWidth="10"
                stroke="rgba(0, 0, 0, 0.05)"
                fill="transparent"
                className="dark:stroke-slate-800"
              />
              <circle
                cx="88"
                cy="88"
                r="80"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className={`transition-all duration-1000 ${getDialColor(currentScore)}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{currentScore}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                {currentScore > 750 ? 'Excellent' : (currentScore >= 650 ? 'Good' : 'Needs Repair')}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-6">Score ranges from 300 to 900</p>
        </div>

        {/* Indicators card details */}
        <div className="glass rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6 md:col-span-2 space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">Bureau Health Indicators</h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            
            {/* Active loans */}
            <div className="rounded-2xl bg-slate-50/50 p-4 border border-slate-100 dark:border-slate-800 dark:bg-slate-950/20">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Active Credit Accounts</span>
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{profile.activeLoans}</span>
            </div>

            {/* Credit Utilization */}
            <div className="rounded-2xl bg-slate-50/50 p-4 border border-slate-100 dark:border-slate-800 dark:bg-slate-950/20">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Utilization Ratio</span>
                <Percent className="h-4 w-4" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{profile.creditUtilization}%</span>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 dark:bg-slate-700">
                <div 
                  className={`h-1.5 rounded-full ${profile.creditUtilization > 40 ? 'bg-amber-500' : 'bg-blue-600'}`}
                  style={{ width: `${profile.creditUtilization}%` }}
                />
              </div>
            </div>

            {/* Repayment History */}
            <div className="rounded-2xl bg-slate-50/50 p-4 border border-slate-100 dark:border-slate-800 dark:bg-slate-955/20">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Repayment Rate</span>
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{profile.repaymentHistory}%</span>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 dark:bg-slate-700">
                <div 
                  className={`h-1.5 rounded-full ${profile.repaymentHistory > 90 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${profile.repaymentHistory}%` }}
                />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Visual Chart score progression */}
      <div className="glass rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider">CIBIL Trend History</h2>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getChartData(currentScore)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 0, 0, 0.05)" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={[300, 900]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#2563eb" 
                strokeWidth={3} 
                dot={{ stroke: '#2563eb', strokeWidth: 2, r: 4 }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
