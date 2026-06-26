import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, Phone, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const DoctorSchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async () => {
    try {
      const res = await axios.get('/api/appointments');
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await axios.put(`/api/appointments/${id}/status`, { status });
      if (res.data.success) {
        fetchSchedule(); // Reload
        alert(`Appointment status marked as ${status}`);
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-primary-500" size={32} />
        <span className="text-sm font-semibold text-slate-500">Retrieving doctor calendar...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Consultation Schedule</h1>
        <p className="text-xs text-slate-500 mt-1">Review scheduled appointments and follow-up consultation requests</p>
      </div>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="glass-card p-16 rounded-3xl text-center text-xs text-slate-400">
            No appointments booked in your schedule.
          </div>
        ) : (
          appointments.map(app => (
            <div key={app._id} className="glass-card p-6 rounded-3xl space-y-4 hover:border-slate-350 dark:hover:border-slate-750 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-550/10 text-primary-500 flex items-center justify-center font-bold">
                    {app.patient?.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{app.patient?.name}</h3>
                    <p className="text-3xs text-slate-450 mt-0.5">Email: {app.patient?.email} | Phone: {app.patient?.phone}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-750 dark:text-slate-300 justify-end">
                    <Calendar size={14} className="text-primary-500" />
                    <span>{new Date(app.date).toLocaleDateString()}</span>
                  </div>
                  <span className="text-3xs text-slate-400 font-semibold mt-0.5 block">
                    Time: {new Date(app.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {app.notes && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 text-xs text-slate-500 leading-relaxed">
                  Patient notes: {app.notes}
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-850">
                <span className={`px-2 py-0.5 text-3xs font-bold uppercase rounded ${
                  app.status === 'scheduled' ? 'bg-primary-500/10 text-primary-500' :
                  app.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {app.status}
                </span>

                {app.status === 'scheduled' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatusChange(app._id, 'completed')}
                      className="btn-primary py-1.5 px-3 rounded-lg text-2xs font-bold flex items-center gap-1"
                    >
                      <CheckCircle size={12} />
                      <span>Complete</span>
                    </button>
                    <button 
                      onClick={() => handleStatusChange(app._id, 'cancelled')}
                      className="btn-secondary py-1.5 px-3 rounded-lg text-2xs font-bold text-red-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 flex items-center gap-1"
                    >
                      <XCircle size={12} />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorSchedule;
