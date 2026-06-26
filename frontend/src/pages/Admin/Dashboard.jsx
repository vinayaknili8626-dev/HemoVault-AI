import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Shield, Users, Activity, ShieldAlert, CheckCircle, ArrowRight, RefreshCw, Landmark } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const res = await axios.get('/api/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
        
        const logsRes = await axios.get('/api/admin/logs');
        if (logsRes.data.success) {
          setLogs(logsRes.data.logs);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-primary-500" size={32} />
        <span className="text-sm font-semibold text-slate-500">Retrieving system diagnostics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-primary-950 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <span className="text-xs font-semibold text-primary-300 uppercase tracking-widest">SYSTEM INFRASTRUCTURE CORE</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">HemoVault AI Control Panel</h1>
          <p className="text-xs text-slate-350">Managing local cryptographic ledgers, role permissions, and compliance logs.</p>
        </div>
        <div className="relative z-10">
          <Link to="/admin/users" className="btn-primary bg-primary-600 hover:bg-primary-500 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm">
            <Users size={16} />
            <span>Manage User Directory</span>
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-3xl space-y-2">
          <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Registered Accounts</span>
          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-200">{stats?.totalUsers || 0}</h3>
            <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary-500">
              <Users size={20} />
            </span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl space-y-2">
          <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Blood Panels Logged</span>
          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-200">{stats?.reportsCount || 0}</h3>
            <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-teal-500">
              <Activity size={20} />
            </span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl space-y-2">
          <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Diagnostics Labs</span>
          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-200">{stats?.labsCount || 0}</h3>
            <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-500">
              <Landmark size={20} />
            </span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl space-y-2">
          <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Pending Registrations</span>
          <div className="flex justify-between items-center">
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-200">{stats?.pendingApprovals || 0}</h3>
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              stats?.pendingApprovals > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              <ShieldAlert size={20} />
            </span>
          </div>
        </div>
      </div>

      {/* Audit Logs Preview */}
      <div className="space-y-4 max-w-4xl">
        <div className="flex justify-between items-center">
          <h2 className="text-md font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Shield size={18} className="text-primary-500" />
            <span>Cryptographic Activity Logs</span>
          </h2>
          <Link to="/admin/logs" className="text-xs font-bold text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-1">
            <span>Open Audits Ledger</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="glass-card p-6 rounded-3xl divide-y divide-slate-150 dark:divide-slate-850 space-y-3">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-450">No events logged in the system.</div>
          ) : (
            logs.slice(0, 5).map((log, i) => (
              <div key={i} className={`pt-3 ${i === 0 ? 'pt-0' : ''} flex justify-between items-start gap-4 text-xs`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${log.type === 'security' ? 'bg-red-500' : 'bg-primary-500'}`} />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{log.event}</span>
                  </div>
                  <p className="text-2xs text-slate-500 dark:text-slate-400 pl-4">{log.message}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
