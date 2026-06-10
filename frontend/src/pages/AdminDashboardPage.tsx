import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Users, 
  UserCheck, 
  FileCheck2, 
  History, 
  Check, 
  X, 
  AlertTriangle, 
  Clock, 
  Eye,
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  HelpCircle,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  kycStatus: string;
  createdAt: string;
}

interface KycRecord {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  panNumber: string;
  aadhaarNumber: string;
  selfieUrl: string;
  panCardUrl: string;
  aadhaarCardUrl: string;
  ocrData?: {
    name: string;
    dob: string;
    panNumber: string;
    aadhaarNumber: string;
    confidence: number;
  };
  status: string;
}

interface Loan {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  type: string;
  amount: number;
  tenure: number;
  emi: number;
  interestRate: number;
  status: string;
  createdAt: string;
}

interface AuditLog {
  _id: string;
  userId?: {
    name: string;
    email: string;
  };
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'kyc' | 'loans' | 'users' | 'logs'>('analytics');
  
  const [users, setUsers] = useState<User[]>([]);
  const [kycs, setKycs] = useState<KycRecord[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Rejection modal states
  const [rejectKycId, setRejectKycId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [panPreviewUrl, setPanPreviewUrl] = useState<string | null>(null);
  const [aadhaarPreviewUrl, setAadhaarPreviewUrl] = useState<string | null>(null);
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const [usersRes, kycsRes, loansRes, logsRes, analyticsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/kycs'),
        api.get('/admin/loans'),
        api.get('/admin/audit-logs'),
        api.get('/admin/analytics')
      ]);

      setUsers(usersRes.data);
      setKycs(kycsRes.data);
      setLoans(loansRes.data);
      setLogs(logsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Error fetching admin details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveKyc = async (id: string) => {
    try {
      await api.put(`/admin/kyc/${id}`, { status: 'Approved' });
      alert('KYC successfully approved.');
      fetchAdminData();
    } catch (err) {
      alert('Error updating KYC.');
    }
  };

  const handleRejectKyc = async () => {
    if (!rejectKycId || !rejectionReason) return;
    try {
      await api.put(`/admin/kyc/${rejectKycId}`, { 
        status: 'Rejected', 
        rejectionReason 
      });
      alert('KYC successfully rejected.');
      setRejectKycId(null);
      setRejectionReason('');
      fetchAdminData();
    } catch (err) {
      alert('Error rejecting KYC.');
    }
  };

  const handleApproveLoan = async (id: string) => {
    try {
      await api.put(`/admin/loan/${id}`, { status: 'Approved' });
      alert('Loan application approved.');
      fetchAdminData();
    } catch (err) {
      alert('Error approving loan.');
    }
  };

  const handleRejectLoan = async (id: string) => {
    try {
      await api.put(`/admin/loan/${id}`, { status: 'Rejected' });
      alert('Loan application rejected.');
      fetchAdminData();
    } catch (err) {
      alert('Error rejecting loan.');
    }
  };

  // Helper to build static URLs pointing to backend
  const getStaticUrl = (path: string) => {
    const backendBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${backendBase}${path}`;
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-slate-400">Loading admin suite...</div>;
  }

  // Analytics Chart Prep
  const loanDistributionData = loans.reduce((acc: any[], curr) => {
    const existing = acc.find(x => x.name === curr.type);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.type, value: curr.amount });
    }
    return acc;
  }, []);

  const statusPieData = [
    { name: 'Approved', value: analytics?.summary?.approvedApplications || 0 },
    { name: 'Pending', value: analytics?.summary?.pendingApplications || 0 },
    { name: 'Rejected', value: loans.filter(l => l.status === 'Rejected').length }
  ];

  const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Admin Suite</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Federal compliance verification, risk audits, and platform analytics.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2">
        {[
          { id: 'analytics', label: 'Analytics Dashboard', icon: TrendingUp },
          { id: 'kyc', label: `KYC Reviews (${kycs.filter(k => k.status === 'Pending').length})`, icon: UserCheck },
          { id: 'loans', label: `Loan Requests (${loans.filter(l => l.status === 'Pending').length})`, icon: FileCheck2 },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'logs', label: 'Audit Logs', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold tracking-wide shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ANALYTICS TAB CONTENT */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8">
          
          {/* Summary counters */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
            <div className="glass rounded-2xl bg-white border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs text-slate-400 uppercase font-bold">Total users</span>
              <span className="block text-2xl font-bold text-slate-900 dark:text-white mt-1">{analytics.summary.totalUsers}</span>
            </div>
            <div className="glass rounded-2xl bg-white border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs text-slate-400 uppercase font-bold">Applied Credit Volume</span>
              <span className="block text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{analytics.summary.totalLoanAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="glass rounded-2xl bg-white border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs text-slate-400 uppercase font-bold">Approved Credit Volume</span>
              <span className="block text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{analytics.summary.approvedLoanAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="glass rounded-2xl bg-white border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs text-slate-400 uppercase font-bold">KYC Approval Rate</span>
              <span className="block text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {analytics.summary.totalUsers > 0 
                  ? Math.round((analytics.kyc.approved / analytics.summary.totalUsers) * 100) 
                  : 0}%
              </span>
            </div>
          </div>

          {/* Recharts Charts Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
            {/* Bar Chart: Loan distribution by category */}
            <div className="glass rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 md:col-span-3">
              <h3 className="text-sm font-bold uppercase text-slate-400 mb-6">Applied Capital by Loan Type</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={loanDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 0, 0, 0.05)" />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Application statuses */}
            <div className="glass rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 md:col-span-2 flex flex-col justify-between">
              <h3 className="text-sm font-bold uppercase text-slate-400">Applications Status Breakup</h3>
              <div className="h-48 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around text-xs font-semibold pt-4 border-t border-slate-100 dark:border-slate-800">
                {statusPieData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                    <span className="text-slate-500 dark:text-slate-400">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* KYC QUEUE TAB CONTENT */}
      {activeTab === 'kyc' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Documents Awaiting Compliance Review</h2>

          {kycs.filter(k => k.status === 'Pending').length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl dark:border-slate-800 bg-white dark:bg-slate-900">
              <HelpCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-655 dark:text-slate-400">KYC review queue is clear</p>
              <p className="text-xs text-slate-455 mt-1">No user accounts are currently pending federal document validation.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {kycs.filter(k => k.status === 'Pending').map((k) => (
                <div 
                  key={k._id}
                  className="glass rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-150 dark:border-slate-850">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{k.userId?.name}</h3>
                      <span className="text-[10px] text-slate-400">{k.userId?.email}</span>
                    </div>
                    {k.ocrData && (
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        OCR Confidence: {Math.round(k.ocrData.confidence * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Compare Info */}
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/50 rounded-xl dark:bg-slate-950/20">
                      <div>
                        <span className="block text-slate-400 font-bold uppercase text-[9px]">User Entered PAN</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{k.panNumber}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-bold uppercase text-[9px]">OCR Extracted PAN</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{k.ocrData?.panNumber || 'Unable to read'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/50 rounded-xl dark:bg-slate-950/20">
                      <div>
                        <span className="block text-slate-400 font-bold uppercase text-[9px]">User Entered Aadhaar</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{k.aadhaarNumber}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-bold uppercase text-[9px]">OCR Extracted Aadhaar</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{k.ocrData?.aadhaarNumber || 'Unable to read'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Document Attachment Links */}
                  <div className="flex flex-wrap gap-2 pt-2 text-xs">
                    <a 
                      href={getStaticUrl(k.panCardUrl)} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-450"
                    >
                      <FileText className="h-4 w-4" />
                      <span>PAN card File</span>
                    </a>
                    <a 
                      href={getStaticUrl(k.aadhaarCardUrl)} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-450"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Aadhaar Card File</span>
                    </a>
                    <a 
                      href={getStaticUrl(k.selfieUrl)} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-450"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Selfie Image</span>
                    </a>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleApproveKyc(k._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
                    >
                      <Check className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => setRejectKycId(k._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-500"
                    >
                      <X className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rejection Modal/Overlay */}
          {rejectKycId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
              <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Provide Rejection Reason</h3>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Uploaded PAN card details are blurred."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleRejectKyc}
                    className="flex-1 rounded-xl bg-red-650 py-2.5 text-xs font-bold text-white hover:bg-red-550"
                  >
                    Confirm Rejection
                  </button>
                  <button
                    onClick={() => {
                      setRejectKycId(null);
                      setRejectionReason('');
                    }}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-655 dark:border-slate-800 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* LOAN REQUESTS TAB CONTENT */}
      {activeTab === 'loans' && (
        <div className="glass rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Loan Approvals & Reviews</h2>

          {loans.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">No loan requests submitted.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 dark:border-slate-800">
                    <th className="pb-3 font-semibold">Applicant</th>
                    <th className="pb-3 font-semibold">Loan Type</th>
                    <th className="pb-3 font-semibold">Principal</th>
                    <th className="pb-3 font-semibold">Interest Suggestion</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((l) => (
                    <tr key={l._id} className="border-b border-slate-50 hover:bg-slate-50/20 dark:border-slate-850 dark:hover:bg-slate-800/10">
                      <td className="py-4">
                        <span className="block font-bold text-slate-900 dark:text-white">{l.userId?.name}</span>
                        <span className="block text-[10px] text-slate-400">{l.userId?.email}</span>
                      </td>
                      <td className="py-4 font-semibold text-slate-700 dark:text-slate-300">{l.type} Loan</td>
                      <td className="py-4 font-semibold text-slate-900 dark:text-white">₹{l.amount.toLocaleString('en-IN')}</td>
                      <td className="py-4 text-slate-700 dark:text-slate-300">{l.interestRate}% APR</td>
                      <td className="py-4">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                          l.status === 'Approved' ? 'bg-emerald-105 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 
                          l.status === 'Rejected' ? 'bg-red-105 text-red-700 dark:bg-red-955/10 dark:text-red-400' : 
                          'bg-amber-105 text-amber-700 dark:bg-amber-955/10 dark:text-amber-400'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="py-4">
                        {l.status === 'Pending' ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleApproveLoan(l._id)}
                              className="rounded bg-emerald-500 hover:bg-emerald-600 p-1.5 text-white"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectLoan(l._id)}
                              className="rounded bg-red-500 hover:bg-red-650 p-1.5 text-white"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="block text-center text-xs text-slate-400">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* USER DIRECTORY TAB CONTENT */}
      {activeTab === 'users' && (
        <div className="glass rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans">User Directory</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 dark:border-slate-800">
                  <th className="pb-3 font-semibold">User Details</th>
                  <th className="pb-3 font-semibold">Contact Phone</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Federal KYC</th>
                  <th className="pb-3 font-semibold">Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-slate-50 hover:bg-slate-50/20 dark:border-slate-850 dark:hover:bg-slate-800/10">
                    <td className="py-4">
                      <span className="block font-bold text-slate-900 dark:text-white">{u.name}</span>
                      <span className="block text-xs text-slate-455">{u.email}</span>
                    </td>
                    <td className="py-4 text-slate-700 dark:text-slate-300 font-medium">{u.phone || 'N/A'}</td>
                    <td className="py-4 font-semibold capitalize text-slate-700 dark:text-slate-300">{u.role}</td>
                    <td className="py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                        u.kycStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 
                        u.kycStatus === 'Uploaded' ? 'bg-amber-100 text-amber-700 dark:bg-amber-955/10 dark:text-amber-400' : 
                        u.kycStatus === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-955/10 dark:text-red-400' : 
                        'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {u.kycStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT LOGS TAB CONTENT */}
      {activeTab === 'logs' && (
        <div className="glass rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security & Audit Trails</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 dark:border-slate-800">
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Operator Email</th>
                  <th className="pb-3 font-semibold">Action Trigger</th>
                  <th className="pb-3 font-semibold">Transaction Details</th>
                  <th className="pb-3 font-semibold">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b border-slate-50 hover:bg-slate-50/20 dark:border-slate-850 dark:hover:bg-slate-800/10">
                    <td className="py-3 text-slate-550 dark:text-slate-450 font-mono">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">
                      {log.userId?.email || 'SYSTEM / ANONYMOUS'}
                    </td>
                    <td className="py-3 font-bold text-blue-650 dark:text-blue-400">
                      {log.action}
                    </td>
                    <td className="py-3 text-slate-655 dark:text-slate-350 max-w-sm truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400 font-mono">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
