/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MOCK_USERS, ROLE_DISPLAY_NAMES } from '../types/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const success = await login(email, password);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('Email atau password salah. Gunakan password: "password"');
    }
    setIsLoading(false);
  };

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
      <div className="w-full max-w-md p-8">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-on-primary" />
          </div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">
            Industrial ERP
          </h1>
          <p className="text-on-surface-variant mt-2">
            Sistem ERP Kontraktor Terintegrasi
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-error-container rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-on-error-container flex-shrink-0" />
            <p className="text-sm text-on-error-container">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="Masukkan email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-on-surface-variant mt-2">
              Password default: "password"
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-on-primary border-t-transparent" />
                Masuk...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        {/* Quick Login */}
        <div className="mt-8 pt-8 border-t border-outline-variant">
          <p className="text-sm font-medium text-on-surface-variant mb-4 text-center">
            Quick Login (Demo)
          </p>
          <div className="grid grid-cols-2 gap-3">
            {MOCK_USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => quickLogin(user.email)}
                className="p-3 rounded-xl border border-outline-variant hover:bg-surface-container-low transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold">
                    {user.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-on-surface">{user.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{ROLE_DISPLAY_NAMES[user.role]}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
