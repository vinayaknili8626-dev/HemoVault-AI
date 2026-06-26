import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, Search, FileText, CheckCircle2, ShieldAlert, Sparkles, Plus, AlertCircle } from 'lucide-react';

const UploadReport = () => {
  const navigate = useNavigate();

  // Search Patient
  const [patientSearch, setPatientSearch] = useState('');
  const [patientsList, setPatientsList] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Form Details
  const [reportType, setReportType] = useState('CBC');
  const [pdfFile, setPdfFile] = useState(null);
  const [manualParameters, setManualParameters] = useState({});
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Common parameters fields mapping based on test type
  const PARAMETER_FIELDS = {
    'CBC': ['hemoglobin', 'rbc', 'wbc', 'platelets', 'hematocrit'],
    'Blood Sugar': ['glucose_fasting', 'glucose_pp', 'hba1c'],
    'Lipid Profile': ['cholesterol_total', 'triglycerides', 'hdl', 'ldl'],
    'Thyroid': ['t3', 't4', 'tsh'],
    'Liver Function': ['sgot_ast', 'sgpt_alt', 'bilirubin', 'albumin'],
    'Kidney Function': ['creatinine', 'urea_bun'],
    'Vitamin Tests': ['vitamin_d3', 'vitamin_b12'],
    'Iron Studies': ['iron_serum', 'ferritin']
  };

  const getPlaceholderLabel = (paramName) => {
    return paramName.replace('_', ' ').toUpperCase();
  };

  // Search Patient handler
  useEffect(() => {
    const searchPatients = async () => {
      if (patientSearch.length < 2) {
        setPatientsList([]);
        return;
      }
      try {
        const res = await axios.get(`/api/doctors/patients/search?query=${patientSearch}`);
        if (res.data.success) {
          setPatientsList(res.data.patients);
        }
      } catch (err) {
        console.error(err);
      }
    };
    const debounce = setTimeout(searchPatients, 300);
    return () => clearTimeout(debounce);
  }, [patientSearch]);

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientSearch('');
    setPatientsList([]);
    setIsDropdownOpen(false);
  };

  // OCR Scanner (uploads PDF to backend OCR parser and pre-fills fields)
  const handleOcrScan = async (e) => {
    e.preventDefault();
    if (!pdfFile) return alert('Please select a PDF file first.');
    if (!selectedPatient) return alert('Please search and select a patient first.');

    setOcrLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('patientId', selectedPatient.id);

    try {
      const res = await axios.post('/api/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        const parsedParams = res.data.report.parameters;
        setReportType(res.data.report.reportType);
        
        // Auto populate parameters form
        const formParams = {};
        for (const [key, val] of Object.entries(parsedParams)) {
          formParams[key] = val;
        }
        setManualParameters(formParams);
        setSuccessMsg('PDF parsed successfully! Extracted parameters populated below. Review and save.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to extract PDF parameters. Try manual input.');
    } finally {
      setOcrLoading(false);
    }
  };

  // Final Publish Handler
  const handleFinalPublish = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return setErrorMsg('Please select a patient first');
    
    const activeFields = PARAMETER_FIELDS[reportType] || [];
    const payloadParameters = {};
    
    // Validate all active fields have values
    for (const field of activeFields) {
      if (manualParameters[field] === undefined || manualParameters[field] === '') {
        return setErrorMsg(`Please fill out parameter value: ${getPlaceholderLabel(field)}`);
      }
      payloadParameters[field] = Number(manualParameters[field]);
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await axios.post('/api/reports/upload', {
        patientId: selectedPatient.id,
        reportType,
        parameters: payloadParameters
      });

      if (res.data.success) {
        setSuccessMsg('Blood report successfully logged and published on secure ledger.');
        setManualParameters({});
        setSelectedPatient(null);
        setTimeout(() => navigate('/reports'), 2000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to publish blood report.');
    } finally {
      setLoading(false);
    }
  };

  const handleParamChange = (param, value) => {
    setManualParameters(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const activeFieldsList = PARAMETER_FIELDS[reportType] || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Publish Test Report</h1>
        <p className="text-xs text-slate-500 mt-1">Upload blood panel results and append parameters to the secure ledger</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-2 text-xs font-bold">
          <ShieldAlert size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Select Patient */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Step 1: Patient Link</h3>
        
        {selectedPatient ? (
          <div className="p-4 bg-primary-500/10 border border-primary-500/20 text-primary-600 rounded-2xl flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-205">{selectedPatient.name}</h4>
              <p className="text-3xs text-slate-400">{selectedPatient.email} | Blood Group: {selectedPatient.bloodGroup}</p>
            </div>
            <button 
              onClick={() => setSelectedPatient(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                setIsDropdownOpen(true);
              }}
              className="input-field pl-11"
              placeholder="Search patient by name or email..."
            />
            {isDropdownOpen && patientsList.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-850">
                {patientsList.map(p => (
                  <button
                    key={p.id}
                    onClick={() => selectPatient(p)}
                    className="w-full p-4 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-850/50 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{p.name}</h4>
                      <p className="text-3xs text-slate-400 mt-0.5">{p.email} | Phone: {p.phone}</p>
                    </div>
                    <span className="font-bold bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-[10px]">
                      {p.bloodGroup}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* STEP 2: PDF OCR SCANNER (Optional shortcut) */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={16} className="text-primary-500 animate-pulse" />
            <span>Step 2: Fast PDF OCR Scanning (Optional)</span>
          </h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input 
            type="file" 
            accept=".pdf"
            onChange={(e) => setPdfFile(e.target.files[0])}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200"
          />
          <button
            onClick={handleOcrScan}
            disabled={ocrLoading || !pdfFile}
            className="w-full sm:w-auto btn-secondary text-xs font-bold py-2.5 bg-slate-100 border-0 hover:bg-slate-200 flex items-center justify-center gap-1"
          >
            {ocrLoading ? 'Parsing...' : 'Scan PDF & Extract'}
          </button>
        </div>
        <p className="text-[10px] text-slate-400">
          Upload report as a PDF. Our local parser matches terms and automatically populates parameters below.
        </p>
      </div>

      {/* STEP 3: Manual Entry & Publish */}
      <form onSubmit={handleFinalPublish} className="glass-card p-6 rounded-3xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
          <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Step 3: Parameters Log</h3>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-1 bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
          >
            {Object.keys(PARAMETER_FIELDS).map(type => (
              <option key={type} value={type}>{type} Panel</option>
            ))}
          </select>
        </div>

        {/* Dynamic fields */}
        {activeFieldsList.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 flex items-center justify-center gap-2">
            <AlertCircle size={16} />
            <span>Select a report type to load standard parameters list</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeFieldsList.map(field => (
              <div key={field}>
                <label className="text-3xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {getPlaceholderLabel(field)}
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={manualParameters[field] !== undefined ? manualParameters[field] : ''}
                  onChange={(e) => handleParamChange(field, e.target.value)}
                  className="input-field py-2"
                  placeholder="Enter value"
                />
              </div>
            ))}
          </div>
        )}

        {/* Publish Button */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-850">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 px-8 text-xs font-bold"
          >
            {loading ? 'Publishing...' : 'Publish Secure Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadReport;
