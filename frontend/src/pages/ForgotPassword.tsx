import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldAlert, CheckCircle } from 'lucide-react';
import api from '../services/api';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setResetToken(null);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setResetToken(res.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request password reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-primary transition-all">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Reset password
        </h2>
        <p className="mt-2 text-center text-xs text-gray-500">
          Enter your registered email address to receive a secure password reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-premium rounded-3xl border border-gray-100 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert size={14} />
              {error}
            </div>
          )}

          {resetToken ? (
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle size={16} className="text-green-600" />
                Simulated Reset Link Generated
              </div>
              <p>For local testing, click the button below to navigate to the reset page:</p>
              <Link
                to={`/reset-password?token=${resetToken}`}
                className="inline-block w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-center shadow-md transition-all text-xs"
              >
                Go to Reset Password Page
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                    placeholder="name@organization.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10"
                >
                  {loading ? 'Generating Link...' : 'Generate Reset Link'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;
