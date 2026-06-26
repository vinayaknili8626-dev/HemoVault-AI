import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setResetToken('');

    try {
      const res = await axios.post('/api/auth/forgotpassword', { email });
      if (res.data.success) {
        setSuccessMsg('Reset token generated! Copy the token below or click the link to proceed.');
        setResetToken(res.data.resetToken);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 px-4 py-12 transition-colors">
      <div className="max-w-md w-full space-y-8 glass-card p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -z-10" />

        <div className="text-center">
          <span className="text-3xl">🔑</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-teal-500 dark:from-primary-400 dark:to-teal-400 bg-clip-text text-transparent">
            Recover Password
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enter your email to request a secure reset token
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3 text-sm">
            <ShieldAlert className="flex-shrink-0" size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl flex items-center gap-3 text-sm justify-center">
              <CheckCircle2 className="flex-shrink-0" size={18} />
              <span>{successMsg}</span>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850">
              <Link
                to={`/reset-password/${resetToken}`}
                className="text-xs font-semibold text-primary-500 hover:underline break-all"
              >
                Go to Reset Form: /reset-password/{resetToken}
              </Link>
            </div>
            <Link to="/login" className="btn-secondary w-full py-2.5">
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Registered Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3">
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <KeyRound size={18} />
                  <span>Send Reset Token</span>
                </>
              )}
            </button>

            <Link
              to="/login"
              className="w-full btn-secondary py-2.5 mt-2 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              <span>Cancel</span>
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
