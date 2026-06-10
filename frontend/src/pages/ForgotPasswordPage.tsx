import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Mail, ArrowLeft, ShieldCheck, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [mockResetLink, setMockResetLink] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    setMockResetLink('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSuccessMessage(response.data.message);
      if (response.data.mockResetLink) {
        setMockResetLink(response.data.mockResetLink);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Server error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">

      <div className="w-full max-w-md space-y-8">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/25">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Forgot Password</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We will send you a mock reset link to restore access.
          </p>
        </div>

        {/* Card Box */}
        <div className="glass rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70">
          
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-650 dark:bg-red-900/10 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage ? (
            <div className="space-y-6 text-center">
              <div className="flex flex-col items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-12 w-12" />
                <span className="text-sm font-semibold">{successMessage}</span>
              </div>

              {mockResetLink && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 text-left dark:border-blue-900/50 dark:bg-blue-950/20">
                  <div className="flex gap-2 text-slate-700 dark:text-slate-300">
                    <Sparkles className="h-5 w-5 text-blue-500 shrink-0" />
                    <div className="text-xs">
                      <span className="block font-bold">Simulator Mock Reset Link</span>
                      <span className="block mt-1">Copy and paste this link in your browser to reset password:</span>
                      <a 
                        href={mockResetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="block mt-2 font-mono text-blue-650 break-all underline hover:text-blue-550 dark:text-blue-400"
                      >
                        {mockResetLink}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <Link 
                to="/login"
                className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-650 hover:text-blue-550 dark:text-blue-400"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Login</span>
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-355">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 focus:outline-none disabled:opacity-70 transition-all"
              >
                {isSubmitting ? 'Sending Request...' : 'Send Reset Link'}
              </button>

              <Link 
                to="/login"
                className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-550 hover:text-slate-755 dark:text-slate-400 dark:hover:text-slate-300"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Login</span>
              </Link>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
