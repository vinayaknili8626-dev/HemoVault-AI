import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  ArrowLeft, 
  Activity, 
  User, 
  Heart, 
  FileText, 
  Plus, 
  Trash2,
  Calendar,
  AlertCircle,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const PatientMedicalRecord = () => {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState(null);
  const [reports, setReports] = useState([]);
  const [trends, setTrends] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Edit History States
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newSurgery, setNewSurgery] = useState('');

  const fetchRecord = async () => {
    try {
      const res = await axios.get(`/api/doctors/patients/${id}`);
      if (res.data.success) {
        setPatient(res.data.patient);
        setHistory(res.data.history);
        setReports(res.data.reports);
      }
      
      const trendRes = await axios.get(`/api/patients/trends?patientId=${id}`);
      if (trendRes.data.success) {
        setTrends(trendRes.data.trends);
      }
    } catch (err) {
      console.error('Failed to load patient record:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, [id]);

  const handleUpdateHistory = async (updatedHistory) => {
    setHistoryLoading(true);
    try {
      const res = await axios.put('/api/patients/history', {
        patientId: id,
        ...updatedHistory
      });
      if (res.data.success) {
        setHistory(res.data.history);
      }
    } catch (err) {
      alert('Failed to update medical history: ' + err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const addItem = (field, item, setItem) => {
    if (!item.trim()) return;
    const list = [...history[field], item.trim()];
    const updated = { ...history, [field]: list };
    handleUpdateHistory(updated);
    setItem('');
  };

  const removeItem = (field, idx) => {
    const list = history[field].filter((_, i) => i !== idx);
    const updated = { ...history, [field]: list };
    handleUpdateHistory(updated);
  };

  // Generate chart data for Glucose
  const getChartData = () => {
    if (!trends || !trends.glucose_fasting || trends.glucose_fasting.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = trends.glucose_fasting.map(t => t.date);
    const values = trends.glucose_fasting.map(t => t.value);

    return {
      labels,
      datasets: [
        {
          label: 'Fasting Glucose (mg/dL)',
          data: values,
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.3
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-primary-500" size={32} />
        <span className="text-sm font-semibold text-slate-500">Decrypting clinical history ledger...</span>
      </div>
    );
  }

  const chartData = getChartData();
  const hasChartData = chartData.labels.length > 0;

  return (
    <div className="space-y-6">
      {/* Top action */}
      <div className="flex items-center gap-3">
        <Link to="/doctor/patients" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl transition-all shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white">Patient Record Vault</h1>
          <p className="text-3xs text-slate-500">Managing files for Patient: {patient?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Demographics & Medical History Form */}
        <div className="space-y-6">
          {/* Demographic summary */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <User size={18} className="text-primary-500" />
              <span>Demographics</span>
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Blood Group:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{patient?.bloodGroup || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gender:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{patient?.gender || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Birth Date:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {patient?.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Health Score:</span>
                <span className="font-bold text-primary-500">{patient?.healthScore || 100}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Emergency Contact:</span>
                <span className="font-bold text-slate-850 dark:text-slate-205">
                  {patient?.emergencyContact?.name || 'N/A'} ({patient?.emergencyContact?.relationship || ''})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Emergency Phone:</span>
                <span className="font-bold text-slate-850 dark:text-slate-205">{patient?.emergencyContact?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Medical history editor */}
          <div className="glass-card p-6 rounded-3xl space-y-5 relative">
            {historyLoading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-10">
                <RefreshCw className="animate-spin text-primary-500" size={24} />
              </div>
            )}

            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <Heart size={18} className="text-primary-500" />
              <span>Medical History</span>
            </h3>

            {/* Allergies list */}
            <div className="space-y-2">
              <span className="text-3xs font-semibold text-slate-450 uppercase block">Allergies Registry</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  className="input-field py-1.5 text-xs"
                  placeholder="Add allergy..."
                />
                <button 
                  onClick={() => addItem('allergies', newAllergy, setNewAllergy)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {history?.allergies.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">
                    <span>{item}</span>
                    <button onClick={() => removeItem('allergies', idx)} className="hover:text-red-700">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Conditions list */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
              <span className="text-3xs font-semibold text-slate-450 uppercase block">Chronic Conditions</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="input-field py-1.5 text-xs"
                  placeholder="Add condition..."
                />
                <button 
                  onClick={() => addItem('chronicConditions', newCondition, setNewCondition)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {history?.chronicConditions.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full">
                    <span>{item}</span>
                    <button onClick={() => removeItem('chronicConditions', idx)} className="hover:text-indigo-700">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Surgeries list */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
              <span className="text-3xs font-semibold text-slate-450 uppercase block">Surgical Record</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSurgery}
                  onChange={(e) => setNewSurgery(e.target.value)}
                  className="input-field py-1.5 text-xs"
                  placeholder="Add surgery..."
                />
                <button 
                  onClick={() => addItem('pastSurgeries', newSurgery, setNewSurgery)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-1 pt-1.5">
                {history?.pastSurgeries.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-3xs text-slate-500 py-1 border-b border-slate-100 dark:border-slate-850">
                    <span>{item}</span>
                    <button onClick={() => removeItem('pastSurgeries', idx)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Charts & Reports List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Charts Trends preview */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <Activity size={18} className="text-primary-500" />
              <span>Glucose Longitudinal Trend</span>
            </h3>
            
            <div className="h-64 relative">
              {hasChartData ? (
                <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <AlertCircle size={28} className="text-slate-350" />
                  <span className="text-xs mt-2">Insufficient historical reports to construct trend line.</span>
                </div>
              )}
            </div>
          </div>

          {/* Patient Blood Reports directory */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <FileText size={18} className="text-primary-500" />
              <span>Historical Reports Log</span>
            </h3>

            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="glass-card p-12 rounded-3xl text-center text-xs text-slate-400">
                  No blood reports recorded for this patient.
                </div>
              ) : (
                reports.map(r => (
                  <div key={r._id} className="glass-card p-5 rounded-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">{r.reportType} Panel</h4>
                      <p className="text-3xs text-slate-400 mt-0.5">
                        Uploaded: {new Date(r.date).toLocaleDateString()} | Lab: {r.laboratory?.name || 'Diagnostic Center'}
                      </p>
                      {r.aiAnalysis && (
                        <div className="flex gap-2 mt-1.5">
                          <span className="inline-block text-[9px] bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded font-bold">
                            Score: {r.aiAnalysis.healthScore}/100
                          </span>
                          {r.aiAnalysis.abnormalValues?.length > 0 && (
                            <span className="inline-block text-[9px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-bold">
                              {r.aiAnalysis.abnormalValues.length} Anomalies
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-850">
                      <Link to={`/reports/${r._id}`} className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1">
                        <span>Review Audit</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PatientMedicalRecord;
