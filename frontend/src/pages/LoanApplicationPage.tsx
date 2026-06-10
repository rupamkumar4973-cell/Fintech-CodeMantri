import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { 
  FileText, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  AlertCircle, 
  Loader2, 
  FilePlus2,
  DollarSign
} from 'lucide-react';

interface Application {
  _id: string;
  type: string;
  amount: number;
  income: number;
  tenure: number;
  emi: number;
  interestRate: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export default function LoanApplicationPage() {
  const location = useLocation();
  
  // Extract state if redirected from eligibility calculator
  const routeState = location.state as {
    amount?: number;
    tenure?: number;
    income?: number;
    existingLoans?: number;
  } || {};

  const [type, setType] = useState('Personal');
  const [amount, setAmount] = useState(routeState.amount || 200000);
  const [tenure, setTenure] = useState(routeState.tenure || 24);
  const [income, setIncome] = useState(routeState.income || 50000);
  const [existingLoans, setExistingLoans] = useState(routeState.existingLoans || 5000);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch applications list
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/loan/applications');
      setApplications(response.data);
    } catch (err) {
      console.error('Error fetching applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !tenure || !income) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/loan/apply', {
        type,
        amount,
        income,
        tenure,
        existingLoans
      });
      setSuccess(`Your ${type} Loan application has been submitted successfully.`);
      fetchApplications(); // refresh list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error submitting application. Complete KYC if required.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'Rejected': return <ShieldAlert className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-amber-500 animate-pulse" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'Rejected': return 'text-red-700 bg-red-100 dark:bg-red-955/10 dark:text-red-400';
      default: return 'text-amber-700 bg-amber-100 dark:bg-amber-955/10 dark:text-amber-400';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Apply & Track</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">
          Apply for new credit accounts and track active loan status reviews.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        
        {/* APPLICATION FORM */}
        <div className="glass rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6 lg:col-span-2 space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FilePlus2 className="h-5 w-5 text-blue-500" />
            <span>Apply Now</span>
          </h2>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-650 dark:bg-red-900/10 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleApply} className="space-y-4">
            
            {/* Loan Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-705 dark:text-slate-350">Loan Product</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-850 dark:bg-slate-955 dark:text-white"
              >
                <option value="Personal">Personal Loan</option>
                <option value="Home">Home Loan</option>
                <option value="Vehicle">Vehicle Loan</option>
                <option value="Education">Education Loan</option>
                <option value="Business">Business Loan</option>
              </select>
            </div>

            {/* Requested Amount */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-705 dark:text-slate-350">Requested Amount (₹)</label>
              <input 
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-850 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Monthly Income */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-705 dark:text-slate-350">Monthly Income (₹)</label>
              <input 
                type="number"
                required
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-850 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Tenure (months) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-705 dark:text-slate-350">Tenure (Months)</label>
              <input 
                type="number"
                required
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-850 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Existing Obligations */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-705 dark:text-slate-350">Existing Monthly EMIs (₹)</label>
              <input 
                type="number"
                required
                value={existingLoans}
                onChange={(e) => setExistingLoans(Number(e.target.value))}
                className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-850 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Submit application */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/10 hover:bg-blue-500 disabled:opacity-75 transition-all pt-2.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting request...</span>
                </>
              ) : (
                <span>Submit Application</span>
              )}
            </button>
          </form>
        </div>

        {/* TRACK APPLICATIONS LIST */}
        <div className="glass rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6 lg:col-span-3 space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            <span>Applications Tracker</span>
          </h2>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">Loading loan applications...</div>
          ) : applications.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl dark:border-slate-800">
              <HelpCircle className="h-10 w-10 text-slate-350 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-655 dark:text-slate-400">No active applications</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">Submit your first loan request on the left side form to track its verification.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div 
                  key={app._id}
                  className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/20 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{app.type} Loan</h3>
                      <span className="text-[10px] text-slate-455">ID: {app._id}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(app.status)}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${getStatusClass(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="block text-slate-400 uppercase text-[9px] font-bold">Principal</span>
                      <span className="font-semibold text-slate-900 dark:text-white">₹{app.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 uppercase text-[9px] font-bold">Monthly EMI</span>
                      <span className="font-semibold text-slate-900 dark:text-white">₹{app.emi.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 uppercase text-[9px] font-bold">Interest Rate</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{app.interestRate}% APR</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 uppercase text-[9px] font-bold">Term Period</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{app.tenure} Months</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
