import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, ShieldAlert, KeyRound, Clock, Activity, RefreshCw } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/api/admin/logs');
        if (res.data.success) {
          setLogs(res.data.logs);
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-primary-500" size={32} />
        <span className="text-sm font-semibold text-slate-500">Decrypting system log file...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Audit Logs Ledger</h1>
        <p className="text-xs text-slate-500 mt-1">Review system ledger transactions, security incidents, and activities logs</p>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
        <div className="p-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-500">Security & Operational Logs</span>
          <span className="text-3xs text-slate-400">Total logged items: {logs.length}</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-850">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No operations logged.</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all flex justify-between items-start gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {log.type === 'security' ? (
                      <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-bold uppercase text-[9px] border border-red-500/20">
                        <ShieldAlert size={10} />
                        <span>Security Event</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-primary-500/10 text-primary-550 px-2 py-0.5 rounded font-bold uppercase text-[9px] border border-primary-500/20">
                        <Activity size={10} />
                        <span>Operation Log</span>
                      </span>
                    )}
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-250 text-sm">
                      {log.event}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-550 dark:text-slate-450 leading-relaxed font-medium pl-0.5">
                    {log.message}
                  </p>
                </div>
                
                <div className="text-right flex-shrink-0 flex items-center gap-1.5 text-3xs font-semibold text-slate-400">
                  <Clock size={12} />
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
