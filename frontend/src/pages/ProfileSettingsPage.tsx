import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';

import { authSuccess } from '../store/authSlice';
import api from '../utils/api';
import { 
  Settings, 
  User, 
  Phone, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Mail
} from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user, token, refreshToken } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload: any = { name, phone };
      if (password) {
        payload.password = password;
      }

      const response = await api.put('/auth/profile', payload);
      
      // Update store
      if (token && refreshToken) {
        dispatch(authSuccess({
          user: response.data,
          token,
          refreshToken
        }));
      }

      setSuccess('Profile details successfully updated.');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating profile details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Profile Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">
          Update your contact details and change password credentials.
        </p>
      </div>

      <div className="glass rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 p-6 sm:p-8 max-w-xl">
        <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-6">
          <Settings className="h-5 w-5 text-blue-500" />
          <span>Account Preferences</span>
        </h2>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-655 dark:bg-red-900/10 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-755 dark:bg-emerald-900/10 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          {/* Email (Read-Only) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Email Address (Cannot change)</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-4 w-4 text-slate-350" />
              </div>
              <input
                type="text"
                disabled
                value={user?.email}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-405 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-705 dark:text-slate-350">Full Name</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-850 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-705 dark:text-slate-350">Mobile Number</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Phone className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-850 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="border-t border-slate-100 pt-5 dark:border-slate-850 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Change Password (Optional)</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-705 dark:text-slate-350">New Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-850 dark:bg-slate-950 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-705 dark:text-slate-350">Confirm Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-850 dark:bg-slate-950 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit preferences */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/10 hover:bg-blue-500 disabled:opacity-75 transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating preferences...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
