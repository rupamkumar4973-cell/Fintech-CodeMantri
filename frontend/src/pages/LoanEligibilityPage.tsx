import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Calculator, 
  ArrowRight, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  TrendingUp, 
  Loader2, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface Assessment {
  isEligible: boolean;
  refusalReason: string;
  maxEligibleAmount: number;
  suggestedInterestRate: number;
  approvalProbability: number;
  emi: number;
  debtToIncomeRatio: number;
  financialHealthScore: number;
  riskAnalysis: {
    category: string;
    suggestions: string[];
    details: string;
  };
  cibilScore: number;
}

export default function LoanEligibilityPage() {
  const [requestedAmount, setRequestedAmount] = useState(500000);
  const [tenure, setTenure] = useState(24);
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [existingLoans, setExistingLoans] = useState(10000);
  const [age, setAge] = useState(28);
  const [employmentType, setEmploymentType] = useState('Salaried');

  const [checking, setChecking] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [pdfDownloading, setPdfDownloading] = useState(false);

  const navigate = useNavigate();

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError('');
    setAssessment(null);
    setReportId(null);

    try {
      const response = await api.post('/loan/check-eligibility', {
        requestedAmount,
        tenure,
        monthlyIncome,
        existingLoans,
        employmentType,
        age
      });
      setAssessment(response.data.assessment);
      setReportId(response.data.reportId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error evaluating eligibility. Complete KYC if you haven\'t yet.');
    } finally {
      setChecking(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportId) return;
    setPdfDownloading(true);
    try {
      const response = await api.get(`/loan/report/${reportId}/pdf`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SmartLoan_Eligibility_Report_${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Could not download PDF report.');
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleProceedApply = () => {
    if (!assessment) return;
    // Pass assessment values as state to Apply form
    navigate('/applications', {
      state: {
        amount: requestedAmount,
        tenure,
        income: monthlyIncome,
        existingLoans
      }
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Eligibility Check</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">
          Calculate your borrowing limit and view AI suggested interest rates based on your current credit parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        
        {/* INPUTS COLUMN */}
        <div className="glass rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6 lg:col-span-2 space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-500" />
            <span>Parameters</span>
          </h2>

          <form onSubmit={handleEvaluate} className="space-y-5">
            {/* Amount Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-350">
                <span>Requested Loan</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">₹{requestedAmount.toLocaleString('en-IN')}</span>
              </div>
              <input 
                type="range" 
                min="50000" 
                max="5000000" 
                step="50000"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600"
              />
            </div>

            {/* Tenure Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-355">
                <span>Tenure Period</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{tenure} Months</span>
              </div>
              <input 
                type="range" 
                min="6" 
                max="84" 
                step="6"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-600"
              />
            </div>

            {/* Income field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-355">Net Monthly Income (₹)</label>
              <input 
                type="number"
                required
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-850 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Existing Obligation field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-355">Existing Loan EMIs (₹/mo)</label>
              <input 
                type="number"
                required
                value={existingLoans}
                onChange={(e) => setExistingLoans(Number(e.target.value))}
                className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-850 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Employment and Age Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-705 dark:text-slate-350">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-850 dark:bg-slate-955 dark:text-white"
                >
                  <option value="Salaried">Salaried</option>
                  <option value="Self-Employed">Self-Employed</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-705 dark:text-slate-350">Age (Years)</label>
                <input 
                  type="number"
                  required
                  min="18"
                  max="65"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-850 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={checking}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/15 hover:bg-blue-500 disabled:opacity-75 transition-all"
            >
              {checking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Assessing details...</span>
                </>
              ) : (
                <span>Calculate Eligibility</span>
              )}
            </button>
          </form>
        </div>

        {/* RESULTS COLUMN */}
        <div className="lg:col-span-3 space-y-6">
          
          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 border border-red-250 dark:bg-red-955/15 dark:border-red-800/50 text-red-700 dark:text-red-400">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <div className="text-sm">
                <span className="font-bold block">Evaluation Alert</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {!assessment && !error && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center bg-white dark:border-slate-800 dark:bg-slate-900">
              <HelpCircle className="h-12 w-12 text-slate-350 mb-3" />
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">Awaiting Inputs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                Provide your monthly income and request amounts on the left to activate the risk evaluation engine.
              </p>
            </div>
          )}

          {assessment && (
            <div className="space-y-6">
              
              {/* Main Eligibility Summary Box */}
              <div className="glass rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Eligibility Verdict</span>
                    <h3 className={`text-xl font-bold ${assessment.isEligible ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-650 dark:text-red-400'}`}>
                      {assessment.isEligible ? 'APPROVED / ELIGIBLE' : 'NOT ELIGIBLE'}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={pdfDownloading}
                      className="rounded-xl border border-slate-200 hover:bg-slate-50 p-2 text-slate-655 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-400"
                      title="Download PDF"
                    >
                      {pdfDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {!assessment.isEligible && (
                  <div className="rounded-2xl bg-red-50 p-4 border border-red-150 text-red-700 text-xs dark:bg-red-955/10 dark:border-red-900/40">
                    <strong>Refusal Reason:</strong> {assessment.refusalReason}
                  </div>
                )}

                {/* Scorecard Metrics */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-xl bg-slate-50/50 p-3 text-center dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850">
                    <span className="block text-[10px] uppercase text-slate-400">CIBIL Score</span>
                    <span className="block text-lg font-bold text-slate-900 dark:text-white mt-1">{assessment.cibilScore}</span>
                  </div>
                  <div className="rounded-xl bg-slate-50/50 p-3 text-center dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850">
                    <span className="block text-[10px] uppercase text-slate-400">Health Score</span>
                    <span className="block text-lg font-bold text-slate-900 dark:text-white mt-1">{assessment.financialHealthScore}/100</span>
                  </div>
                  <div className="rounded-xl bg-slate-50/50 p-3 text-center dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850">
                    <span className="block text-[10px] uppercase text-slate-400">Suggested APR</span>
                    <span className="block text-lg font-bold text-slate-900 dark:text-white mt-1">{assessment.suggestedInterestRate}%</span>
                  </div>
                  <div className="rounded-xl bg-slate-50/50 p-3 text-center dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850">
                    <span className="block text-[10px] uppercase text-slate-400">Match Probability</span>
                    <span className="block text-lg font-bold text-slate-900 dark:text-white mt-1">{assessment.approvalProbability}%</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Proposed Monthly EMI:</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{assessment.emi.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Maximum Eligible Amount:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">₹{assessment.maxEligibleAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Debt-to-Income (DTI) Ratio:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{assessment.debtToIncomeRatio}%</span>
                  </div>
                </div>
              </div>

              {/* Recommendations Suggestions Box */}
              <div className="glass rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span>AI Risk Optimization Tips</span>
                </h3>

                <ul className="space-y-2.5">
                  {assessment.riskAnalysis.suggestions.map((item, idx) => (
                    <li key={idx} className="flex gap-2 text-xs text-slate-655 dark:text-slate-350 items-start">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                  {assessment.riskAnalysis.suggestions.length === 0 && (
                    <li className="text-xs text-emerald-650 dark:text-emerald-400 font-semibold">
                      Your financial health is in excellent standing. You are ready to lock in the lowest rates!
                    </li>
                  )}
                </ul>

                {assessment.isEligible && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleProceedApply}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    >
                      <span>Proceed to Apply for Loan</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
