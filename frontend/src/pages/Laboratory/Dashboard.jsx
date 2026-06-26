import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { Activity, UploadCloud, FileText, CheckCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LabDashboard = () => {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('/api/labs/dashboard');
        if (res.data.success) {
          setProfile(res.data.profile);
          setStats(res.data.stats);
          setRecentReports(res.data.recentReports);
        }
      } catch (err) {
        console.error('Failed to load lab dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-primary-500" size={32} />
        <span className="text-sm font-semibold text-slate-500">Retrieving laboratory status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome lab */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl -z-1" />
        <div className="space-y-1 relative z-10">
          <span className="text-xs font-semibold text-primary-300 uppercase tracking-widest">DIAGNOSTIC LABORATORY PORTAL</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Facility: {profile?.name}</h1>
          <p className="text-xs text-slate-350">Licence ID: {profile?.licenseNumber} | Contact: {profile?.contactNumber}</p>
        </div>
        <div className="relative z-10">
          <RouterLink to="/lab/upload" className="btn-primary px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md">
            <UploadCloud size={16} />
            <span>Upload New Report</span>
          </RouterLink>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Uploaded</span>
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-200">{stats?.totalUploaded || 0}</h3>
            <span className="text-3xs text-slate-400 block pt-1">Total panels published</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-500 flex items-center justify-center">
            <FileText size={26} />
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Validations</span>
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-200">{stats?.pendingCount || 0}</h3>
            <span className="text-3xs text-slate-400 block pt-1">Reports awaiting signatures</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
            <RefreshCw size={26} className="animate-spin-slow" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Reports</span>
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-200">{stats?.approvedCount || 0}</h3>
            <span className="text-3xs text-slate-400 block pt-1">Ledger synced entries</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
            <CheckCircle size={26} />
          </div>
        </div>
      </div>

      {/* Recent Uploads List */}
      <div className="space-y-4 max-w-4xl">
        <div className="flex justify-between items-center">
          <h2 className="text-md font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <FileText size={18} className="text-primary-500" />
            <span>Recent Upload Actions</span>
          </h2>
        </div>

        <div className="space-y-4">
          {recentReports.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl text-center text-xs text-slate-400">
              No reports uploaded yet. Click Upload New Report to publish first test.
            </div>
          ) : (
            recentReports.map(r => (
              <div key={r._id} className="glass-card p-5 rounded-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-105 dark:bg-slate-800 flex items-center justify-center text-primary-500 flex-shrink-0">
                    <Activity size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{r.reportType} Panel</h4>
                    <p className="text-3xs text-slate-400 mt-0.5">
                      Uploaded: {new Date(r.date).toLocaleDateString()} | Patient: {r.patient?.name || 'Unknown'} ({r.patient?.email})
                    </p>
                    <span className="inline-block text-[9px] font-semibold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded mt-1.5 uppercase">
                      Status: {r.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-850">
                  <RouterLink to={`/reports/${r._id}`} className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1">
                    <span>Open Record</span>
                    <ChevronRight size={14} />
                  </RouterLink>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LabDashboard;
