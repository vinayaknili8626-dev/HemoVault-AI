import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, CheckCircle2, ShieldAlert, LogIn } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      return setErrorMsg('Passwords do not match');
    }

    setLoading(true);

    try {
      const res = await axios.put(`/api/auth/resetpassword/${token}`, { password });
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Password reset failed. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 px-4 py-12 transition-colors">
      <div className="max-w-md w-full space-y-8 glass-card p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -z-10" />

        <div className="text-center">
          <span className="text-3xl">🔒</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-teal-500 dark:from-primary-400 dark:to-teal-400 bg-clip-text text-transparent">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Set your new credentials to access your vault
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3 text-sm">
            <ShieldAlert className="flex-shrink-0" size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl flex items-center gap-3 text-sm justify-center">
              <CheckCircle2 className="flex-shrink-0" size={18} />
              <span>Password successfully reset!</span>
            </div>
            <Link to="/login" className="btn-primary w-full py-2.5">
              <LogIn size={16} />
              <span>Sign In</span>
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-11"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3">
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
