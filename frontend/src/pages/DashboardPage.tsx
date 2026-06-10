import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

import api from '../utils/api';
import { 
  UserCheck, 
  TrendingUp, 
  FileCheck, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  PlusCircle, 
  HelpCircle 
} from 'lucide-react';

interface LoanApplication {
  _id: string;
  type: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch applications
        const appsRes = await api.get('/loan/applications');
        setApplications(appsRes.data);

        // Fetch credit score
        if (user) {
          try {
            const scoreRes = await api.get(`/credit-score/${user._id}`);
            setCreditScore(scoreRes.data.score);
          } catch (err: any) {
            // If credit score requires KYC, set score to null
            setCreditScore(null);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'Uploaded': return 'text-amber-600 bg-amber-100 dark:bg-amber-950/20 dark:text-amber-400';
      case 'Rejected': return 'text-red-650 bg-red-100 dark:bg-red-950/20 dark:text-red-400';
      default: return 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getLoanStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'Rejected': return <ShieldAlert className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-amber-500 animate-pulse" />;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Welcome Board */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor KYC verification, credit standing, and active loan reviews.
          </p>
        </div>
        
        <Link 
          to="/eligibility"
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-500"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Assessment</span>
        </Link>
      </div>

      {/* Grid of status cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        
        {/* KYC Verification Card */}
        <div className="glass rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 glow-primary">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">KYC Status</span>
            <UserCheck className="h-5 w-5 text-blue-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${getKycStatusColor(user?.kycStatus || 'Pending')}`}>
              {user?.kycStatus || 'Pending'}
            </span>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
            <Link to="/kyc" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
              <span>{user?.kycStatus === 'Pending' ? 'Upload Documents' : 'Manage KYC'}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Credit Score Card */}
        <div className="glass rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 glow-purple">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">CIBIL score</span>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            {creditScore ? (
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{creditScore}</span>
            ) : (
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Requires Approved KYC</span>
            )}
          </div>
          <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
            <Link to="/credit-score" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
              <span>View Score Card</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Active Application Count Card */}
        <div className="glass rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 glow-success">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Applications</span>
            <FileCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {applications.length}
            </span>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
            <Link to="/applications" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
              <span>Track Status</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Applications list */}
      <div className="glass rounded-2xl border border-slate-200 bg-white/70 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Loan Applications</h2>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-405">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl dark:border-slate-800">
            <HelpCircle className="h-10 w-10 text-slate-350 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-655 dark:text-slate-400">No loan applications yet</p>
            <p className="text-xs text-slate-455 mb-4">Run an eligibility check to verify which loan products you match.</p>
            <Link 
              to="/eligibility"
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Check eligibility
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-800">
                  <th className="pb-3 font-semibold">Product Type</th>
                  <th className="pb-3 font-semibold">Applied Amount</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id} className="border-b border-slate-50 hover:bg-slate-50/20 dark:border-slate-850 dark:hover:bg-slate-800/10">
                    <td className="py-4 font-bold text-slate-900 dark:text-white">{app.type} Loan</td>
                    <td className="py-4 font-medium text-slate-700 dark:text-slate-300">₹{app.amount.toLocaleString('en-IN')}</td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">{new Date(app.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5">
                        {getLoanStatusIcon(app.status)}
                        <span className="font-semibold capitalize text-slate-755 dark:text-slate-300">{app.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
