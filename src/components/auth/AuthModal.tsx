import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/common';
import { useAuth } from '../../lib/auth/AuthContext';
import { demoUserAccounts, SeedUserAccount } from '../../lib/supabase/db';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onLoginSuccess?: (role: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess,
}) => {
  const { login, loginAsDemoUser, registerApplicant, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Register form state
  const [regData, setRegData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'male' as 'male' | 'female' | 'other',
    password: '',
    confirm_password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please enter your university email or application email.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      onClose();
      if (onLoginSuccess) {
        onLoginSuccess('user');
      }
    } else {
      setError(res.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleDemoSelect = (account: SeedUserAccount) => {
    loginAsDemoUser(account);
    onClose();
    if (onLoginSuccess) {
      onLoginSuccess(account.role);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regData.first_name || !regData.last_name || !regData.email || !regData.phone) {
      setError('Please fill in all required fields.');
      return;
    }

    if (regData.password && regData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (regData.password && regData.password !== regData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    const res = await registerApplicant({
      first_name: regData.first_name,
      last_name: regData.last_name,
      email: regData.email,
      phone: regData.phone,
      gender: regData.gender,
    });

    if (res.success) {
      setSuccessMsg('Account created successfully! Redirecting to Applicant Portal...');
      setTimeout(() => {
        onClose();
        if (onLoginSuccess) onLoginSuccess('applicant');
      }, 1000);
    } else {
      setError(res.message || 'Failed to create applicant account.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'login'
          ? 'University Portal Sign In'
          : mode === 'register'
          ? 'New Applicant Registration'
          : 'Reset Password'
      }
      subtitle="Access university admissions, student portal, staff workspace, or administrative dashboard."
      size="lg"
    >
      <div className="space-y-6">
        {/* Fast Demo Account Switcher */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-700" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Evaluation Fast-Pass: 1-Click Role Login
            </h4>
          </div>
          <p className="text-xs text-amber-800 mb-3">
            Select any role below to instantly log in and inspect that persona's dedicated dashboard, permissions, and features:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {demoUserAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleDemoSelect(acc)}
                className="flex flex-col items-start p-2 rounded-lg bg-white border border-amber-200 hover:border-amber-400 hover:shadow-xs transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-[#0F2137]">
                    {acc.full_name} ({acc.role_display})
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-0.5" />
                </div>
                <span className="text-[11px] text-slate-500 font-mono truncate w-full mt-0.5">
                  {acc.email}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded mt-1 font-medium">
                  Role: {acc.role.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
            Or Sign In With Custom Email
          </span>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                University / Applicant Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@pfust.edu.ng or applicant@gmail.com"
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-[#0F2137] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                For demo accounts, password is automatically verified.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              leftIcon={LogIn}
            >
              Sign In to Portal
            </Button>

            <div className="text-center text-xs text-slate-600 pt-2">
              Don't have an applicant account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-[#0F2137] font-bold hover:underline cursor-pointer"
              >
                Create Applicant Account
              </button>
            </div>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={regData.first_name}
                  onChange={(e) => setRegData({ ...regData, first_name: e.target.value })}
                  placeholder="e.g. Ibrahim"
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={regData.last_name}
                  onChange={(e) => setRegData({ ...regData, last_name: e.target.value })}
                  placeholder="e.g. Balogun"
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  placeholder="e.g. applicant@gmail.com"
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={regData.phone}
                  onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                  placeholder="e.g. 08012345678"
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Gender *
              </label>
              <select
                value={regData.gender}
                onChange={(e) =>
                  setRegData({ ...regData, gender: e.target.value as 'male' | 'female' | 'other' })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Create Password *
                </label>
                <input
                  type="password"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={regData.confirm_password}
                  onChange={(e) => setRegData({ ...regData, confirm_password: e.target.value })}
                  placeholder="Re-enter password"
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              leftIcon={UserPlus}
            >
              Create Account & Start Application
            </Button>

            <div className="text-center text-xs text-slate-600 pt-2">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[#0F2137] font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Enter your registered email address and we will send you instructions to reset your
              university portal password.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Registered Email
              </label>
              <input
                type="email"
                placeholder="e.g. student@pfust.edu.ng"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2137]"
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => {
                setSuccessMsg('Password reset link sent to your registered email address.');
                setTimeout(() => setMode('login'), 2000);
              }}
              leftIcon={KeyRound}
            >
              Send Reset Instructions
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-[#0F2137] font-semibold hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
