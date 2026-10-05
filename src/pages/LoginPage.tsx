import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, ArrowRight, Building, KeyRound, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [emailOrMobile, setEmailOrMobile] = useState('rajesh.shah@rajmills.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOrMobile.trim()) {
      login(emailOrMobile, 'Director');
    }
  };

  const handleQuickDemo = (role: 'Director' | 'Auditor' | 'Accountant', email: string) => {
    setEmailOrMobile(email);
    login(email, role);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-md font-bold text-xl mb-3">
          LP
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          LedgerPulse
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          B2B Accounting Reporting & Analytics Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-lg sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="emailOrMobile"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
              >
                Email or Registered Mobile
              </label>
              <input
                id="emailOrMobile"
                type="text"
                required
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
                placeholder="name@company.com or 10-digit mobile"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors text-slate-800"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs text-slate-600">Remember this workstation</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-xs text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Access Roles */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-2xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('Director', 'rajesh.shah@rajmills.com')}
                className="px-2 py-1.5 text-2xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors text-center"
              >
                Director
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('Auditor', 'audit.ca@suratcacs.in')}
                className="px-2 py-1.5 text-2xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors text-center"
              >
                Auditor / CA
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('Accountant', 'accounts@rajmills.com')}
                className="px-2 py-1.5 text-2xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors text-center"
              >
                Accountant
              </button>
            </div>
          </div>

          {/* Windows Sync Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-2xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Read-only reporting client · TLS 1.3 Encrypted</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-sm p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900">Reset Access Credentials</h3>
            </div>
            {resetSent ? (
              <div className="text-center py-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-800">Verification Link Sent</p>
                <p className="text-2xs text-slate-500 mt-1">
                  We have dispatched password recovery instructions to your registered email and mobile.
                </p>
                <button
                  onClick={() => {
                    setForgotPasswordOpen(false);
                    setResetSent(false);
                  }}
                  className="mt-4 px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-500 mb-3">
                  Enter your business email or registered mobile number to receive a temporary login OTP.
                </p>
                <input
                  type="text"
                  defaultValue={emailOrMobile}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded mb-3 text-slate-800"
                  placeholder="Enter email or mobile"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setForgotPasswordOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setResetSent(true)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Send OTP
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
