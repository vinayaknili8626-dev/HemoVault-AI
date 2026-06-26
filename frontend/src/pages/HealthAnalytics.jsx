import React, { useState, useEffect } from 'react';
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
import { Activity, ShieldCheck, Heart, Info, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Register ChartJS modules
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
);

const HealthAnalytics = () => {
  const { user } = useAuth();

  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedParameter, setSelectedParameter] = useState('hemoglobin');

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await axios.get('/api/patients/trends');
        if (res.data.success) {
          setTrends(res.data.trends);
        }
      } catch (err) {
        console.error('Failed to load trends data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, []);

  const parametersMetadata = {
    hemoglobin: { name: 'Hemoglobin', unit: 'g/dL', color: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.1)', range: '12.0 - 17.5 g/dL' },
    glucose_fasting: { name: 'Fasting Blood Glucose', unit: 'mg/dL', color: 'rgb(245, 158, 11)', bg: 'rgba(245, 158, 11, 0.1)', range: '70 - 100 mg/dL' },
    ldl: { name: 'LDL (Bad) Cholesterol', unit: 'mg/dL', color: 'rgb(79, 70, 229)', bg: 'rgba(79, 70, 229, 0.1)', range: '50 - 100 mg/dL' },
    hdl: { name: 'HDL (Good) Cholesterol', unit: 'mg/dL', color: 'rgb(16, 185, 129)', bg: 'rgba(16, 185, 129, 0.1)', range: '40 - 60 mg/dL' },
    tsh: { name: 'Thyroid Stimulating Hormone (TSH)', unit: 'uIU/mL', color: 'rgb(14, 165, 233)', bg: 'rgba(14, 165, 233, 0.1)', range: '0.45 - 4.5 uIU/mL' }
  };

  const getChartData = () => {
    if (!trends || !trends[selectedParameter] || trends[selectedParameter].length === 0) {
      return { labels: [], datasets: [] };
    }

    const paramData = trends[selectedParameter];
    const labels = paramData.map(item => item.date);
    const dataValues = paramData.map(item => item.value);
    const meta = parametersMetadata[selectedParameter];

    return {
      labels,
      datasets: [
        {
          label: `${meta.name} (${meta.unit})`,
          data: dataValues,
          fill: true,
          borderColor: meta.color,
          backgroundColor: meta.bg,
          tension: 0.3,
          pointBackgroundColor: meta.color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };
  };

  const getChartOptions = () => {
    const meta = parametersMetadata[selectedParameter];
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { size: 12, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 10,
          cornerRadius: 12,
          displayColors: false
        }
      },
      scales: {
        y: {
          grid: {
            color: 'rgba(226, 232, 240, 0.5)'
          },
          ticks: {
            font: { size: 10 }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: { size: 10 }
          }
        }
      }
    };
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-primary-500" size={32} />
        <span className="text-sm font-semibold text-slate-500">Aggregating historical biomarkers...</span>
      </div>
    );
  }

  const selectedMeta = parametersMetadata[selectedParameter];
  const chartData = getChartData();
  const hasData = chartData.datasets.length > 0 && chartData.datasets[0].data.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Health Biomarker Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">Monitor historical physiological shifts using longitudinal charts</p>
        </div>
      </div>

      {/* Select Parameter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl">
        {Object.entries(parametersMetadata).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setSelectedParameter(key)}
            className={`py-3 px-2 text-3xs font-bold rounded-xl truncate transition-all text-center ${
              selectedParameter === key
                ? 'bg-white dark:bg-slate-800 text-primary-600 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {value.name}
          </button>
        ))}
      </div>

      {/* Analytics Main panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Panel */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">{selectedMeta.name} Progression</h3>
              <p className="text-3xs text-slate-400 mt-0.5">Reference bounds: {selectedMeta.range}</p>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              Longitudinal Log
            </span>
          </div>

          <div className="h-72 relative">
            {hasData ? (
              <Line data={chartData} options={getChartOptions()} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 text-slate-400">
                <Activity size={36} className="text-slate-300 animate-pulse" />
                <span className="text-xs">No historical logs found for {selectedMeta.name}.</span>
                <span className="text-[10px] text-slate-400">Upload multiple reports to start generating charts.</span>
              </div>
            )}
          </div>
        </div>

        {/* Clinical Reference Card */}
        <div className="glass-card p-6 rounded-3xl space-y-4 bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-950/10">
          <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
            <Heart size={18} className="text-primary-500" />
            <span>Biomarker Guide</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-3xs text-slate-400 font-semibold uppercase block">Standard Ranges</span>
              <span className="font-black text-sm text-slate-700 dark:text-slate-200 mt-1 block">
                {selectedMeta.range}
              </span>
            </div>

            <div className="flex gap-3 text-slate-500 dark:text-slate-400 leading-relaxed text-justify">
              <Info size={16} className="text-primary-500 flex-shrink-0 mt-0.5" />
              <div>
                <p>
                  Long-term tracking of {selectedMeta.name.toLowerCase()} levels helps identify early metabolic shifts, vitamin absorption deficiencies, or cardiovascular anomalies.
                </p>
                <p className="mt-2 text-3xs text-slate-400">
                  Fluctuations can stem from diet, sleep deficits, clinical pathology, or hydration status. Please consult your physician to interpret trends clinically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthAnalytics;
