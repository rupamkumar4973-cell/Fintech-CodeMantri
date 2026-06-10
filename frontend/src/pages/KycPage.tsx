import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';

import { updateKycStatus } from '../store/authSlice';
import api from '../utils/api';
import { 
  ShieldCheck, 
  Upload, 
  FileText, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';

interface KycRecord {
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
  rejectionReason?: string;
}

export default function KycPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  
  const [panFile, setPanFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [kycData, setKycData] = useState<KycRecord | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Fetch current KYC Status on Mount
  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        setLoadingStatus(true);
        const response = await api.get('/kyc/status');
        if (response.data.kyc) {
          setKycData(response.data.kyc);
          setPanNumber(response.data.kyc.panNumber);
          setAadhaarNumber(response.data.kyc.aadhaarNumber);
        }
      } catch (err) {
        console.error('Error fetching KYC status', err);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchKycStatus();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!panNumber || !aadhaarNumber || !panFile || !aadhaarFile || !selfieFile) {
      setError('Please provide all document numbers and upload files.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    // Prepare FormData for file uploads
    const formData = new FormData();
    formData.append('panNumber', panNumber);
    formData.append('aadhaarNumber', aadhaarNumber);
    formData.append('panCard', panFile);
    formData.append('aadhaarCard', aadhaarFile);
    formData.append('selfie', selfieFile);

    try {
      const response = await api.post('/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccess('KYC documents uploaded successfully. Running AI OCR details verification...');
      setKycData(response.data.kyc);
      
      // Dispatch status update in Redux Auth Slice
      dispatch(updateKycStatus('Uploaded'));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error uploading KYC files. Please check file sizes or format.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStatus) {
    return <div className="py-12 text-center text-sm text-slate-400">Loading KYC details...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">KYC Verification</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">
          Federal laws require identity checks. Complete KYC to fetch bureau credit scores and request loan disbursal.
        </p>
      </div>

      {/* KYC Status Banner */}
      {user?.kycStatus === 'Approved' && (
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 border border-emerald-250 dark:bg-emerald-950/20 dark:border-emerald-800/50">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-emerald-900 dark:text-emerald-400">KYC Verification Complete</h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Your identity has been verified successfully. Your credit score profile and loan applications are now unlocked!
            </p>
          </div>
        </div>
      )}

      {user?.kycStatus === 'Uploaded' && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-250 dark:bg-amber-955/10 dark:border-amber-800/50">
          <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h3 className="font-bold text-amber-900 dark:text-amber-400">KYC Review in Progress</h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Your documents have been processed. Our admin officers are reviewing the OCR details comparison.
            </p>
            {kycData?.ocrData && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs rounded-xl bg-white/70 p-3 dark:bg-slate-950/40 text-slate-655 dark:text-slate-350">
                <Sparkles className="h-4 w-4 text-blue-500 shrink-0" />
                <span>AI OCR extraction confidence: <strong>{kycData.ocrData.confidence * 100}%</strong></span>
              </div>
            )}
          </div>
        </div>
      )}

      {user?.kycStatus === 'Rejected' && (
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 border border-red-250 dark:bg-red-955/10 dark:border-red-800/50">
          <AlertCircle className="h-6 w-6 text-red-650 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900 dark:text-red-400">KYC Verification Failed</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-2">
              The uploaded files were rejected by the review officer.
            </p>
            <p className="text-xs font-semibold text-red-800 dark:text-red-400 bg-white/75 p-2 rounded-lg dark:bg-slate-950/50">
              Reason: {kycData?.rejectionReason || 'Uploaded cards were not clear.'}
            </p>
          </div>
        </div>
      )}

      {/* KYC Upload Form (Shown if Pending, Rejected) */}
      {(user?.kycStatus === 'Pending' || user?.kycStatus === 'Rejected') && (
        <div className="glass rounded-3xl border border-slate-200 bg-white/70 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 p-6 sm:p-8">
          
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-650 dark:bg-red-900/10 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Number Fields Row */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-705 dark:text-slate-350">PAN Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="ABCDE1234F"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-850 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-705 dark:text-slate-350">Aadhaar Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="0000 0000 0000"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-850 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            {/* Document Upload Grids */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              
              {/* PAN CARD */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-slate-705 dark:text-slate-350">PAN Card Attachment</span>
                <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 dark:border-slate-800 p-5 text-center transition-all bg-white dark:bg-slate-950/40">
                  <Upload className="h-6 w-6 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-655 dark:text-slate-400">
                    {panFile ? panFile.name : 'Select PAN card'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG up to 5MB</span>
                  <input
                    type="file"
                    required
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => setPanFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* AADHAAR CARD */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-slate-705 dark:text-slate-350">Aadhaar Card Attachment</span>
                <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 dark:border-slate-800 p-5 text-center transition-all bg-white dark:bg-slate-950/40">
                  <FileText className="h-6 w-6 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-655 dark:text-slate-400">
                    {aadhaarFile ? aadhaarFile.name : 'Select Aadhaar card'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG up to 5MB</span>
                  <input
                    type="file"
                    required
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* SELFIE */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-slate-705 dark:text-slate-350">Selfie Upload</span>
                <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 dark:border-slate-800 p-5 text-center transition-all bg-white dark:bg-slate-950/40">
                  <User className="h-6 w-6 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-655 dark:text-slate-400">
                    {selfieFile ? selfieFile.name : 'Select Selfie image'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">JPG, JPEG, PNG up to 5MB</span>
                  <input
                    type="file"
                    required
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

            </div>

            {/* Note of fast approval for user testing */}
            <div className="rounded-xl bg-blue-50/50 p-4 border border-blue-200/50 text-slate-700 dark:bg-blue-950/15 dark:border-blue-900/50 dark:text-slate-300">
              <span className="block text-xs font-bold">💡 Testing Tip</span>
              <span className="block text-xs mt-0.5">
                After uploading your files, you can log in to the <strong>Admin Dashboard</strong> (admin@smartloan.com) to instantly approve or reject your KYC submissions.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/10 hover:bg-blue-500 disabled:opacity-75 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading documents & running OCR...</span>
                </>
              ) : (
                <span>Submit KYC Documents</span>
              )}
            </button>

          </form>
        </div>
      )}

    </div>
  );
}
