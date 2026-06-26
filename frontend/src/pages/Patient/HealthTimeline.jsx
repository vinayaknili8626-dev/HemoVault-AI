import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, Calendar, Landmark, ChevronRight, Activity, RefreshCw } from 'lucide-react';

const HealthTimeline = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('/api/reports');
        if (res.data.success) {
          // Sort chronologically (oldest first for timeline)
          const sorted = res.data.reports.sort((a, b) => new Date(a.date) - new Date(b.date));
          setReports(sorted);
        }
      } catch (err) {
        console.error('Failed to load timeline records:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-primary-500" size={32} />
        <span className="text-sm font-semibold text-slate-500">Mapping chronological health timeline...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Medical Timeline</h1>
        <p className="text-xs text-slate-500 mt-1">Chronological trail of your clinical diagnostic milestones</p>
      </div>

      {reports.length === 0 ? (
        <div className="glass-card p-16 rounded-3xl text-center space-y-4">
          <div className="text-4xl text-slate-300">⏳</div>
          <h3 className="font-bold text-slate-700 dark:text-slate-355">Timeline Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Once blood panels are uploaded by laboratories, your interactive clinical timeline will compile here.
          </p>
        </div>
      ) : (
        <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 md:ml-32 py-4 space-y-12">
          {reports.map((r, index) => {
            const dateObj = new Date(r.date);
            const monthStr = dateObj.toLocaleString('default', { month: 'short' });
            const dayStr = dateObj.getDate();
            const yearStr = dateObj.getFullYear();

            return (
              <div key={r._id} className="relative pl-8 md:pl-0">
                {/* Desktop Date badge (placed to the left of the line) */}
                <div className="hidden md:flex absolute -left-32 top-0 w-24 flex-col items-end text-right">
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200">{monthStr} {dayStr}</span>
                  <span className="text-xs font-bold text-primary-500">{yearStr}</span>
                </div>

                {/* Timeline node dot */}
                <div className="absolute -left-3.5 top-1.5 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-4 border-primary-500 flex items-center justify-center shadow-sm z-10">
                  <Activity size={10} className="text-primary-500" />
                </div>

                {/* Mobile Date tag (above card) */}
                <div className="md:hidden flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-bold">
                  <Calendar size={14} />
                  <span>{monthStr} {dayStr}, {yearStr}</span>
                </div>

                {/* Content Card */}
                <div className="glass-card p-6 rounded-3xl hover:shadow-md transition-shadow md:ml-8 border-slate-200/50 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-3xs uppercase font-extrabold text-slate-400">Milestone #{index + 1}</span>
                    <h3 className="text-md font-extrabold text-slate-800 dark:text-slate-100">{r.reportType} Report</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                      <Landmark size={14} className="text-primary-500" />
                      <span>Lab: {r.laboratory?.name || 'Diagnostic Center'}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-850">
                    {r.aiAnalysis && (
                      <div className="text-right">
                        <span className="text-3xs text-slate-450 block font-semibold">Health Score</span>
                        <span className="text-xs font-extrabold text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded">
                          {r.aiAnalysis.healthScore}/100
                        </span>
                      </div>
                    )}
                    <Link to={`/reports/${r._id}`} className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1">
                      <span>View Details</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HealthTimeline;
