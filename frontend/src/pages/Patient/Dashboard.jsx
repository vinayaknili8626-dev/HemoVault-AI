import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Activity, FileText, Bell, Calendar, ArrowRight, ShieldCheck, Heart, User, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get('/api/patients/dashboard');
        if (res.data.success) {
          setStats(res.data.stats);
          setReports(res.data.recentReports);
          setNotifications(res.data.recentNotifications);
        }
      } catch (err) {
        console.error('Failed to load patient dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 skeleton rounded-3xl w-2/3" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="h-32 skeleton rounded-3xl" />
          <div className="h-32 skeleton rounded-3xl" />
          <div className="h-32 skeleton rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 skeleton rounded-3xl" />
          <div className="h-80 skeleton rounded-3xl" />
        </div>
      </div>
    );
  }

  const healthScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 75) return 'text-primary-500 bg-primary-500/10 border-primary-500/20';
    if (score >= 60) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl -z-1" />
        <div className="space-y-1 relative z-10">
          <span className="text-xs font-semibold text-primary-300 uppercase tracking-widest">PATIENT PORTAL</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Hello, {user?.name}</h1>
          <p className="text-xs text-slate-300">Your secure clinical record vault is online. Let's look at your health diagnostics.</p>
        </div>
        <div className="flex gap-3 relative z-10">
          <Link to="/reports" className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors flex items-center gap-1.5">
            <FileText size={16} />
            <span>View Reports</span>
          </Link>
          <Link to="/analytics" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors flex items-center gap-1.5">
            <Activity size={16} />
            <span>Health Trends</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl flex items-center justify-between border-slate-200/50 dark:border-slate-800/50">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Health Score</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-black ${healthScoreColor(stats?.healthScore || 100).split(' ')[0]}`}>
                {stats?.healthScore || 'N/A'}
              </span>
              <span className="text-xs text-slate-400">/100</span>
            </div>
            <span className="text-3xs text-slate-400 block pt-1">Algorithmic risk evaluation</span>
          </div>
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${healthScoreColor(stats?.healthScore || 100).split(' ').slice(1).join(' ')}`}>
            <Heart size={26} className="fill-current animate-pulse" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reports Logged</span>
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-200">{stats?.reportsCount || 0}</h3>
            <span className="text-3xs text-slate-400 block pt-1">Total clinical datasets uploaded</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-500 flex items-center justify-center">
            <FileText size={26} />
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blood Registry</span>
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-200">{stats?.bloodGroup || 'N/A'}</h3>
            <span className="text-3xs text-slate-400 block pt-1">Linked gender: {stats?.gender || 'N/A'}</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
            <User size={26} />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-md font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <FileText size={18} className="text-primary-500" />
              <span>Recent Blood Panels</span>
            </h2>
            <Link to="/reports" className="text-xs font-bold text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="glass-card p-12 rounded-3xl text-center text-xs text-slate-400">
                No reports found. Request your laboratory to upload panels to email: {user?.email}
              </div>
            ) : (
              reports.map(r => (
                <div key={r._id} className="glass-card p-5 rounded-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary-500 flex-shrink-0">
                      <Activity size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">{r.reportType} Report</h4>
                      <p className="text-2xs text-slate-400 mt-0.5">
                        Date: {new Date(r.date).toLocaleDateString()} | Lab: {r.laboratory?.name || 'External'}
                      </p>
                      {r.doctor && (
                        <span className="inline-block text-3xs font-semibold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded mt-1.5">
                          Assigned: Dr. {r.doctor.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-850">
                    {r.aiAnalysis && (
                      <span className="text-xs font-bold text-primary-500 bg-primary-500/10 px-2.5 py-1 rounded-xl">
                        Score: {r.aiAnalysis.healthScore || 'N/A'}
                      </span>
                    )}
                    <Link to={`/reports/${r._id}`} className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1">
                      <span>Review Details</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notifications Bar */}
        <div className="space-y-4">
          <h2 className="text-md font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Bell size={18} className="text-primary-500" />
            <span>Health Alerts Ledger</span>
          </h2>

          <div className="glass-card p-6 rounded-3xl divide-y divide-slate-100 dark:divide-slate-850 space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">All alerts clear. No warnings found.</div>
            ) : (
              notifications.map((n, i) => (
                <div key={n._id} className={`pt-4 ${i === 0 ? 'pt-0' : ''} space-y-2`}>
                  <div className="flex items-start gap-2">
                    <span className="text-xs mt-0.5">🔔</span>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">{n.title}</h4>
                      <p className="text-3xs text-slate-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-2xs text-slate-500 dark:text-slate-400 pl-6 leading-relaxed">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
