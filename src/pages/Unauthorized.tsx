/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
      <div className="text-center p-8">
        <div className="w-20 h-20 bg-error-container rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-on-error-container" />
        </div>
        <h1 className="text-3xl font-headline font-bold text-on-surface mb-2">
          Akses Ditolak
        </h1>
        <p className="text-on-surface-variant mb-8 max-w-md mx-auto">
          Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika Anda membutuhkan akses.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleNavigate}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            {isAuthenticated ? <Home className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            {isAuthenticated ? 'Kembali ke Dashboard' : 'Login'}
          </button>
          {isAuthenticated && (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 border border-outline-variant text-on-surface rounded-xl font-medium hover:bg-surface-container-low transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Ganti Akun
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
