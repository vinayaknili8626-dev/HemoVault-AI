import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Mail, Lock, ShieldAlert } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        // Direct to their dashboard
        if (res.role === 'patient') navigate('/dashboard');
        else if (res.role === 'doctor') navigate('/doctor/dashboard');
        else if (res.role === 'laboratory') navigate('/lab/dashboard');
        else navigate('/admin/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 px-4 py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full space-y-8 glass-card p-8 rounded-3xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -z-10" />

        <div className="text-center">
          <span className="text-3xl">🛡️</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-teal-500 dark:from-primary-400 dark:to-teal-400 bg-clip-text text-transparent">
            HemoVault AI
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sign in to access your digital blood vaults
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3 text-sm animate-shake">
            <ShieldAlert className="flex-shrink-0" size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Email Address
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

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-primary-500 hover:text-primary-400 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-11"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-primary-500 hover:text-primary-400 transition-colors"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
