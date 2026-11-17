// Pharma Cold Track - Login Page
// Enterprise pharmaceutical authentication portal with MFA support

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Truck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import clsx from 'clsx';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (showMfa) {
        await new Promise(resolve => setTimeout(resolve, 800));
        if (mfaCode.length !== 6) {
          throw new Error('Please enter a valid 6-digit MFA security token');
        }
        navigate(from, { replace: true });
      } else {
        await login({ email, password, remember_me: rememberMe });

        if (email.includes('mfa') || password.includes('mfa')) {
          setShowMfa(true);
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToPassword = () => {
    setShowMfa(false);
    setMfaCode('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#06080d] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[480px] relative z-10 flex flex-col gap-6">
        
        {/* Top Branding Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-400 p-0.5 shadow-xl shadow-teal-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#0a0e17] rounded-[14px] flex items-center justify-center">
              <Truck className="w-7 h-7 text-teal-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              PharmaTrack
            </h1>
            <p className="text-xs font-semibold tracking-wider uppercase text-teal-400 mt-1 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Cold Chain Operations Platform
            </p>
          </div>
        </div>

        {/* Authentication Card */}
        <div className="bg-[#0f1419] rounded-2xl border border-white/10 p-7 sm:p-8 shadow-2xl shadow-black/80 flex flex-col gap-6 backdrop-blur-xl">
          
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {showMfa ? 'Two-Factor Authentication' : 'Welcome back'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {showMfa 
                ? 'Enter the 6-digit security verification code from your authenticator application' 
                : 'Sign in to access real-time telemetry and regulatory logs'}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-300 font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {!showMfa ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Email Address
                </label>
                <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-[#0a0e17] border border-white/10 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-400/20 transition-all">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
                    placeholder="user@company.com"
                    required
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Password
                  </label>
                  <a href="#" className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-[#0a0e17] border border-white/10 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-400/20 transition-all">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#0a0e17] border-white/20 text-teal-500 focus:ring-teal-400/20 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                    Remember this device for 30 days
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="mfaCode" className="text-xs font-semibold uppercase tracking-wider text-slate-300 text-center">
                  6-Digit Verification Code
                </label>
                <div className="flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-[#0a0e17] border border-white/10 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-400/20 transition-all">
                  <KeyRound className="w-5 h-5 text-teal-400 shrink-0" />
                  <input
                    id="mfaCode"
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-transparent text-center text-2xl tracking-[0.4em] font-mono font-bold text-white placeholder:text-slate-700 focus:outline-none"
                    placeholder="000000"
                    required
                    autoFocus
                    autoComplete="one-time-code"
                    disabled={isSubmitting}
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>One-time passcodes refresh every 30 seconds</span>
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting || mfaCode.length !== 6}
                  className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Token...</span>
                    </>
                  ) : (
                    <span>Verify &amp; Continue</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBackToPassword}
                  className="w-full py-2.5 px-4 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Return to email &amp; password
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Access Section */}
          <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Demo Access
              </span>
              <span className="text-[10px] text-teal-400 font-mono">
                1-Click Autofill
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setEmail('demo@pharmatrack.com');
                  setPassword('demo123');
                  setShowMfa(false);
                }}
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-teal-500/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white group-hover:text-teal-300">
                    Standard Access
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Direct
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 truncate">demo@pharmatrack.com</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('user@mfa.com');
                  setPassword('password123');
                  setShowMfa(false);
                }}
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-amber-500/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white group-hover:text-amber-300">
                    MFA Verification
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    2FA
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 truncate">user@mfa.com</p>
              </button>
            </div>
          </div>

          {/* GxP Regulatory Compliance Notice */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5 text-slate-500">
            <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Protected health logistics system. All authentication attempts and session activities are permanently recorded for 21 CFR Part 11 audit compliance.
            </p>
          </div>
        </div>

        {/* Global Footer */}
        <div className="text-center text-[11px] text-slate-600">
          PharmaTrack Operations Platform v2.0 · GxP Validated System
        </div>
      </div>
    </div>
  );
}
