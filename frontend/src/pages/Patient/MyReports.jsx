import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Calendar, FileDown, ShieldCheck, ChevronRight, Activity, Filter, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MyReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('/api/reports');
        if (res.data.success) {
          setReports(res.data.reports);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const reportTypesList = [
    'All',
    'CBC',
    'Blood Sugar',
    'Lipid Profile',
    'Thyroid',
    'Liver Function',
    'Kidney Function',
    'Vitamin Tests',
    'Iron Studies',
    'Custom'
  ];

  // Filtering logic
  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      r.reportType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.laboratory?.name && r.laboratory.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r._id.toString().includes(searchQuery);

    const matchesFilter = filterType === 'All' || r.reportType === filterType;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-primary-500" size={32} />
        <span className="text-sm font-semibold text-slate-500">Retrieving secure blood index...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Clinical Blood Vault</h1>
          <p className="text-xs text-slate-500 mt-1">Review and manage your cryptographically authenticated blood panels</p>
        </div>
        <div className="flex items-center gap-2 text-2xs font-bold text-slate-400 uppercase bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-full">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Secured Ledger</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-11"
            placeholder="Search by test type, report ID, or laboratory..."
          />
        </div>

        {/* Filter Type */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Filter size={18} />
          </span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field pl-11"
          >
            {reportTypesList.map(type => (
              <option key={type} value={type}>{type} Panels</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports Directory */}
      {filteredReports.length === 0 ? (
        <div className="glass-card p-16 rounded-3xl text-center space-y-4">
          <div className="text-4xl text-slate-350 dark:text-slate-700">📭</div>
          <h3 className="font-bold text-slate-700 dark:text-slate-300">No Blood Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or contact your medical diagnostic lab to submit panels for: <span className="font-semibold text-slate-600 dark:text-slate-300">{user?.email}</span>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.map(r => (
            <div 
              key={r._id} 
              className="glass-card p-6 rounded-3xl space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-500 transition-colors">
                        {r.reportType} Report
                      </h3>
                      <p className="text-3xs text-slate-400 mt-0.5">
                        Ref: {r._id.toString().substring(0, 10)}...
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-3xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                    {r.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2 text-2xs text-slate-500 dark:text-slate-400 border-y border-slate-100 dark:border-slate-850">
                  <div>
                    <span className="block text-3xs text-slate-400 font-semibold uppercase">Date</span>
                    <span className="font-semibold block mt-0.5">{new Date(r.date).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block text-3xs text-slate-400 font-semibold uppercase">Laboratory</span>
                    <span className="font-semibold block mt-0.5 truncate">{r.laboratory?.name || 'Diagnostic Center'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {r.pdfUrl ? (
                  <a
                    href={r.pdfUrl}
                    download
                    className="p-2 text-slate-500 hover:text-primary-500 dark:text-slate-400 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Download Official PDF"
                    onClick={(e) => {
                      // Allow default download unless handled differently
                      console.log('Downloading PDF:', r.pdfUrl);
                    }}
                  >
                    <FileDown size={20} />
                  </a>
                ) : (
                  <div />
                )}
                
                <Link 
                  to={`/reports/${r._id}`} 
                  className="btn-secondary py-2 px-4 text-xs font-bold group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all"
                >
                  <span>Review Analysis</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReports;
