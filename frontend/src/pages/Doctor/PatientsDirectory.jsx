import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, UserRound, ArrowRight, ShieldCheck, Heart, User, RefreshCw } from 'lucide-react';

const PatientsDirectory = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPatients = async (query = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/doctors/patients/search?query=${query}`);
      if (res.data.success) {
        setPatients(res.data.patients);
      }
    } catch (err) {
      console.error('Failed to search patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients(search);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-500/10';
    if (score >= 75) return 'text-primary-500 bg-primary-500/10';
    if (score >= 60) return 'text-amber-500 bg-amber-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Patients Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Locate and review secure patient medical history files</p>
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-md flex gap-2">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
            placeholder="Search by name, email, or phone..."
          />
        </div>
        <button type="submit" className="btn-primary py-2.5 px-5 text-xs font-bold">
          Search
        </button>
      </form>

      {/* Directory Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="animate-spin text-primary-500" size={32} />
            <span className="text-sm font-semibold text-slate-500">Retrieving patient registry...</span>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-450">
            No patient records match query bounds.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 border-b border-slate-200 dark:border-slate-850 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4">Patient ID</th>
                  <th className="px-6 py-4">Demographics</th>
                  <th className="px-6 py-4">Blood Registry</th>
                  <th className="px-6 py-4 text-center">Health Score</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-300">
                {patients.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-450">{p.id.substring(0, 10)}...</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 flex-shrink-0">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200">{p.name}</h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{p.email} | {p.phone || 'No Phone'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-sm bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                        {p.bloodGroup || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 text-2xs font-extrabold rounded-full ${getScoreColor(p.healthScore)}`}>
                        {p.healthScore}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/doctor/patients/${p.id}`} 
                        className="inline-flex items-center gap-1 text-primary-500 font-bold hover:underline"
                      >
                        <span>Open File</span>
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsDirectory;
