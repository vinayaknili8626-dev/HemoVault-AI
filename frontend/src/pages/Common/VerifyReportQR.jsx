import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, Calendar, User, Landmark, Activity, CheckCircle, RefreshCw } from 'lucide-react';

const VerifyReportQR = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const verifyReport = async () => {
      try {
        const res = await axios.get(`/api/reports/verify/${token}`);
        if (res.data.success && res.data.verified) {
          setReport(res.data.report);
        } else {
          setErrorMsg('This blood report could not be verified on HemoVault AI Ledger.');
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Verification failed. Report token is invalid.');
      } finally {
        setLoading(false);
      }
    };

    verifyReport();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors">
      <div className="max-w-2xl w-full glass-card p-8 rounded-3xl relative overflow-hidden space-y-6 shadow-xl border-slate-200 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -z-10" />

        {/* Brand */}
        <div className="text-center">
          <span className="text-xs uppercase tracking-widest font-extrabold text-slate-400 block mb-1">
            Official Registry Ledger
          </span>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-200">HEMOVAULT AI SECURITY CORE</h2>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="animate-spin text-primary-500" size={32} />
            <span className="text-sm font-semibold text-slate-500">Decrypting record signature...</span>
          </div>
        ) : errorMsg ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert size={32} />
            </div>
            <h3 className="text-2xl font-bold text-red-500">Verification Failure</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {errorMsg}
            </p>
            <div className="pt-4">
              <Link to="/" className="btn-secondary w-full sm:w-auto py-2.5 mx-auto">
                Go to Landing Page
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Success Badge */}
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left justify-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-500">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h4 className="text-md font-bold uppercase tracking-wider">RECORD VERIFIED AUTHENTIC</h4>
                <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Cryptographically matching database index on HemoVault AI Ledger.
                </p>
              </div>
            </div>

            {/* Demographics Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <User size={14} />
                  <span>Patient Identity</span>
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200">{report.patientName}</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Landmark size={14} />
                  <span>Issuing Laboratory</span>
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200">{report.laboratoryName}</h4>
                <span className="text-3xs bg-slate-200 dark:bg-slate-850 px-2 py-0.5 text-slate-500 dark:text-slate-400 rounded font-semibold">
                  LIC: {report.labLicense || 'N/A'}
                </span>
              </div>

              <div className="space-y-3 sm:col-span-2 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar size={14} />
                    <span>Date of Test</span>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    {new Date(report.date).toLocaleDateString()}
                  </h4>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Activity size={14} />
                    <span>Report Classification</span>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{report.reportType}</h4>
                </div>
              </div>
            </div>

            {/* Parameters listing */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Ledger Parameter Log
              </h3>
              <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-850">
                {Object.entries(report.parameters).map(([key, value]) => (
                  <div key={key} className="p-3 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide text-xs">
                      {key.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 text-center">
              <Link to="/login" className="btn-primary w-full py-3">
                Go to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyReportQR;
