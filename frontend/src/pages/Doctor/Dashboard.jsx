import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Users, Calendar, Clock, ArrowRight, User, Stethoscope, ChevronRight, Activity, RefreshCw } from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('/api/doctors/dashboard');
        if (res.data.success) {
          setProfile(res.data.profile);
          setStats(res.data.stats);
          setAppointments(res.data.appointments);
          setRecentReports(res.data.recentReports);
        }
      } catch (err) {
        console.error('Failed to load doctor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, []);

  const handleUpdateStatus = async (appId, status) => {
    try {
      const res = await axios.put(`/api/appointments/${appId}/status`, { status });
      if (res.data.success) {
        setAppointments(prev => prev.filter(app => app._id !== appId));
        alert(`Appointment marked as ${status}`);
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-primary-500" size={32} />
        <span className="text-sm font-semibold text-slate-500">Mapping clinical panels...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome doctor */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl -z-1" />
        <div className="space-y-1 relative z-10">
          <span className="text-xs font-semibold text-teal-300 uppercase tracking-widest">CLINICAL PHYSICIAN PORTAL</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-xs text-slate-350">{profile?.specialization} | Hospital: {profile?.hospital?.name || 'Metro General'}</p>
        </div>
        <div className="relative z-10">
          <Link to="/doctor/patients" className="btn-primary bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 border-teal-600 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm">
            <Users size={16} />
            <span>Search Patient Vault</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Patients</span>
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-200">{stats?.patientsCount || 0}</h3>
            <span className="text-3xs text-slate-400 block pt-1">Patients with active reports</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-500 flex items-center justify-center">
            <Users size={26} />
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Consultations</span>
            <h3 className="text-3xl font-black text-slate-800 dark:text-slate-200">{stats?.appointmentsCount || 0}</h3>
            <span className="text-3xs text-slate-400 block pt-1">Pending calendar appointments</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-500 flex items-center justify-center">
            <Calendar size={26} />
          </div>
        </div>
      </div>

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-md font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Calendar size={18} className="text-primary-500" />
              <span>Today's Appointments Ledger</span>
            </h2>
            <Link to="/doctor/schedule" className="text-xs font-bold text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-1">
              <span>View Full Schedule</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="glass-card p-12 rounded-3xl text-center text-xs text-slate-400">
                No consultations scheduled for today.
              </div>
            ) : (
              appointments.map(app => (
                <div key={app._id} className="glass-card p-5 rounded-3xl space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                        {app.patient?.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{app.patient?.name}</h4>
                        <p className="text-3xs text-slate-450 mt-0.5">Email: {app.patient?.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-350 block">
                        {new Date(app.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-3xs text-slate-400 block mt-0.5">
                        {new Date(app.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {app.notes && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-3xs text-slate-500 leading-relaxed border border-slate-150 dark:border-slate-850">
                      Notes: {app.notes}
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-850">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(app._id, 'completed')}
                        className="btn-primary py-1.5 px-3 rounded-lg text-2xs font-bold bg-teal-600 hover:bg-teal-500"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app._id, 'cancelled')}
                        className="btn-secondary py-1.5 px-3 rounded-lg text-2xs font-bold hover:bg-red-500/10 hover:text-red-500"
                      >
                        Cancel
                      </button>
                    </div>
                    <Link to={`/doctor/patients/${app.patient?._id}`} className="text-2xs font-bold text-primary-500 flex items-center gap-0.5">
                      <span>Access File</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent reports list */}
        <div className="space-y-4">
          <h2 className="text-md font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Activity size={18} className="text-primary-500" />
            <span>Recent Test Reviews</span>
          </h2>

          <div className="glass-card p-5 rounded-3xl divide-y divide-slate-150 dark:divide-slate-850 space-y-4">
            {recentReports.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No reports reviewed recently.</div>
            ) : (
              recentReports.map((r, i) => (
                <div key={r._id} className={`pt-4 ${i === 0 ? 'pt-0' : ''} space-y-2`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100">{r.reportType} Report</h4>
                      <span className="text-3xs text-slate-400">{r.patient?.name}</span>
                    </div>
                    <Link to={`/reports/${r._id}`} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                      <ChevronRight size={16} className="text-slate-400" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;
