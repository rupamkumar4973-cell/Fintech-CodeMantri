import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure, clearError } from '../store/authSlice';
import type { RootState } from '../store';

import api from '../utils/api';
import { User, Lock, Mail, Phone, Loader2, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Verification View states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [mockOtpVal, setMockOtpVal] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [tempAuthData, setTempAuthData] = useState<any>(null);

  const [resendingOtp, setResendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState('');

  // Cooldown timer effect
  useEffect(() => {
    let interval: any;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setResendingOtp(true);
    setResendSuccess('');
    dispatch(clearError());
    try {
      const response = await api.post('/auth/resend-otp', { email });
      setResendSuccess('Code resent successfully.');
      setResendCooldown(30);
      if (response.data.mockOtp) {
        setMockOtpVal(response.data.mockOtp);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to resend verification code.';
      dispatch(authFailure(errMsg));
    } finally {
      setResendingOtp(false);
    }
  };


  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error } = useSelector((state: RootState) => state.auth);

  // Submit register request
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) return;

    setIsSubmitting(true);
    dispatch(authStart());
    try {
      const response = await api.post('/auth/register', { name, email, phone, password });
      
      // Save temp auth payload and switch to OTP verify view
      setTempAuthData(response.data);
      setMockOtpVal(response.data.mockOtp);
      setOtpSent(true);
      dispatch(clearError());
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registration failed. Try using a unique email address.';
      dispatch(authFailure(errMsg));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit OTP verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !tempAuthData) return;

    setVerifyingOtp(true);
    try {
      // Temporarily store authorization token to make authorized OTP calls
      const tempToken = tempAuthData.token;
      
      await api.post('/auth/verify-otp', { otp: otpCode }, {
        headers: { Authorization: `Bearer ${tempToken}` }
      });

      // Verification complete, finalize auth login state
      dispatch(authSuccess(tempAuthData));
      navigate('/dashboard');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Invalid OTP. Please enter the correct verification code.';
      dispatch(authFailure(errMsg));
    } finally {
      setVerifyingOtp(false);
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
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {otpSent ? 'Verify Mobile Number' : 'Create your account'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {otpSent ? (
              <span>Verification code sent to registration details</span>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Sign in
                </Link>
              </>
            )}
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

          {!otpSent ? (
            /* REGISTRATION FORM */
            <form className="space-y-4" onSubmit={handleRegister}>
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-355">Full Name</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-355">Email Address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-355">Mobile Number</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-355">Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit Register */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 focus:outline-none disabled:opacity-70 transition-all pt-2.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Register & Send OTP</span>
                )}
              </button>
            </form>
          ) : (
            /* OTP VERIFICATION CODE FORM */
            <form className="space-y-5" onSubmit={handleVerifyOtp}>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-355 text-center block">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="block w-full rounded-xl border border-slate-300 bg-white py-3 text-center text-xl font-bold tracking-widest shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  placeholder="000000"
                />
              </div>

              {/* Resend Code Action */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Didn't receive the code?</span>
                <button
                  type="button"
                  disabled={resendingOtp || resendCooldown > 0}
                  onClick={handleResendOtp}
                  className="font-semibold text-blue-650 hover:underline disabled:opacity-55 disabled:hover:no-underline dark:text-blue-400"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

              {resendSuccess && (
                <p className="text-center text-xs font-semibold text-emerald-650 dark:text-emerald-400 mt-2">
                  {resendSuccess}
                </p>
              )}


              {/* Submit OTP Verification */}
              <button
                type="submit"
                disabled={verifyingOtp}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500 focus:outline-none disabled:opacity-70 transition-all"
              >
                {verifyingOtp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <span>Verify Mobile Number</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-center text-xs font-semibold text-slate-550 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              >
                Back to registration
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
