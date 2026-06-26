import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Activity, 
  FileDown, 
  Send, 
  Bot, 
  User, 
  Plus, 
  Stethoscope, 
  Landmark, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Lightbulb,
  Heart,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ReportDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Doctor consultation form states
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [consultSubmitLoading, setConsultSubmitLoading] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const res = await axios.get(`/api/reports/${id}`);
        if (res.data.success) {
          setReport(res.data.report);
          setClinicalNotes(res.data.report.clinicalNotes || '');
          setPrescription(res.data.report.prescription || '');
          
          // Seed initial chat greetings
          setChatMessages([
            {
              sender: 'bot',
              text: `Hello! I am your HemoVault Offline AI Medical Assistant. I have successfully loaded your ${res.data.report.reportType} report. I can explain parameters, detail high/low values, recommend lifestyle habits, or discuss diet changes. What would you like to ask?`
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [id]);

  // Scroll chat window to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = userInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setUserInput('');
    setChatLoading(true);

    try {
      const res = await axios.post(`/api/reports/${id}/chat`, { message: userMessage });
      if (res.data.success) {
        setChatMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Sorry, I encountered an issue querying the offline diagnostics. Please try again.' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    setConsultSubmitLoading(true);
    try {
      const res = await axios.put(`/api/reports/${id}/consultation`, { clinicalNotes, prescription });
      if (res.data.success) {
        setReport(prev => ({
          ...prev,
          clinicalNotes: res.data.report.clinicalNotes,
          prescription: res.data.report.prescription,
          pdfUrl: res.data.report.pdfUrl // Update to recompiled PDF path
        }));
        alert('Consultation details and prescription successfully published. Report PDF has been recompiled.');
      }
    } catch (err) {
      alert('Failed to publish consultation details: ' + (err.response?.data?.message || err.message));
    } finally {
      setConsultSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="animate-spin text-primary-500" size={32} />
        <span className="text-sm font-semibold text-slate-500">Decrypting medical panel records...</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-bold">Report Not Found</h3>
        <Link to="/reports" className="btn-primary w-full sm:w-auto py-2.5 mx-auto">
          Back to Reports List
        </Link>
      </div>
    );
  }

  // Helper to color statuses
  const parameterStatus = (key, value) => {
    // We can simulate reference ranges quickly locally
    const norm = {
      hemoglobin: { min: 12.0, max: 17.5, unit: 'g/dL' },
      rbc: { min: 4.0, max: 5.9, unit: 'M/mcL' },
      wbc: { min: 4.5, max: 11.0, unit: 'K/mcL' },
      platelets: { min: 150, max: 450, unit: 'K/mcL' },
      hematocrit: { min: 36.0, max: 50.0, unit: '%' },
      glucose_fasting: { min: 70, max: 100, unit: 'mg/dL' },
      glucose_pp: { min: 70, max: 140, unit: 'mg/dL' },
      hba1c: { min: 4.0, max: 5.7, unit: '%' },
      cholesterol_total: { min: 120, max: 200, unit: 'mg/dL' },
      triglycerides: { min: 50, max: 150, unit: 'mg/dL' },
      hdl: { min: 40, max: 60, unit: 'mg/dL', inverse: true },
      ldl: { min: 50, max: 100, unit: 'mg/dL' },
      t3: { min: 80, max: 200, unit: 'ng/dL' },
      t4: { min: 4.5, max: 12.0, unit: 'mcg/dL' },
      tsh: { min: 0.45, max: 4.5, unit: 'uIU/mL' },
      creatinine: { min: 0.6, max: 1.2, unit: 'mg/dL' },
      urea_bun: { min: 7, max: 20, unit: 'mg/dL' },
      vitamin_d3: { min: 30, max: 100, unit: 'ng/mL' },
      vitamin_b12: { min: 200, max: 900, unit: 'pg/mL' }
    }[key.toLowerCase()];

    if (!norm) return { label: 'Normal', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' };

    const numVal = Number(value);
    if (norm.inverse) {
      if (numVal < norm.min) {
        const isCritical = numVal < norm.min * 0.7;
        return { 
          label: isCritical ? 'Critical Low' : 'Low', 
          color: isCritical ? 'text-red-500 bg-red-500/10' : 'text-primary-500 bg-primary-500/10' 
        };
      }
    } else {
      if (numVal < norm.min) {
        const isCritical = numVal < norm.min * 0.7;
        return { 
          label: isCritical ? 'Critical Low' : 'Low', 
          color: isCritical ? 'text-blue-500 bg-blue-500/10' : 'text-primary-500 bg-primary-500/10' 
        };
      } else if (numVal > norm.max) {
        const isCritical = numVal > norm.max * 1.3;
        return { 
          label: isCritical ? 'Critical High' : 'High', 
          color: isCritical ? 'text-red-500 bg-red-500/10' : 'text-amber-500 bg-amber-500/10' 
        };
      }
    }

    return { label: 'Normal', color: 'text-emerald-500 bg-emerald-500/10' };
  };

  const getUnit = (key) => {
    return {
      hemoglobin: 'g/dL', rbc: 'M/mcL', wbc: 'K/mcL', platelets: 'K/mcL', hematocrit: '%',
      glucose_fasting: 'mg/dL', glucose_pp: 'mg/dL', hba1c: '%',
      cholesterol_total: 'mg/dL', triglycerides: 'mg/dL', hdl: 'mg/dL', ldl: 'mg/dL',
      t3: 'ng/dL', t4: 'mcg/dL', tsh: 'uIU/mL', creatinine: 'mg/dL', urea_bun: 'mg/dL',
      vitamin_d3: 'ng/mL', vitamin_b12: 'pg/mL'
    }[key.toLowerCase()] || '';
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link to="/reports" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl transition-all shadow-sm">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-white">Report Audit: {report.reportType}</h1>
            <p className="text-3xs text-slate-400">ID: {report._id.toString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {report.pdfUrl && (
            <a
              href={report.pdfUrl}
              download
              className="btn-secondary py-2 px-4 text-xs font-bold"
            >
              <FileDown size={14} />
              <span>Download Official Report</span>
            </a>
          )}
          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold px-3 py-1.5 rounded-xl text-2xs uppercase tracking-wider">
            <ShieldCheck size={14} />
            <span>AUTHENTICATED</span>
          </div>
        </div>
      </div>

      {/* Main Grid splits details vs AI assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Report Parameter listings & Doctor Notes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Metadata Card */}
          <div className="glass-card p-6 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-3xs text-slate-400 font-semibold uppercase tracking-wider block">Patient Name</span>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250">{report.patient?.name}</h4>
              <p className="text-3xs text-slate-400">{report.patient?.email}</p>
            </div>
            <div className="space-y-1 sm:border-l border-slate-200 dark:border-slate-800 sm:pl-6">
              <span className="text-3xs text-slate-400 font-semibold uppercase tracking-wider block">Issuing Laboratory</span>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250">{report.laboratory?.name}</h4>
              <p className="text-3xs text-slate-400">Verified Facility</p>
            </div>
            <div className="space-y-1 sm:border-l border-slate-200 dark:border-slate-800 sm:pl-6">
              <span className="text-3xs text-slate-400 font-semibold uppercase tracking-wider block">Date of Test</span>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250 flex items-center gap-1.5">
                <Calendar size={14} className="text-primary-500" />
                <span>{new Date(report.date).toLocaleDateString()}</span>
              </h4>
            </div>
          </div>

          {/* Test Parameters Data Grid */}
          <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
            <div className="p-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500">Blood Metrics Log</span>
              <span className="text-3xs text-slate-400">Values matched to clinical standards</span>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-850">
              {Object.entries(report.parameters).map(([key, val]) => {
                const status = parameterStatus(key, val);
                return (
                  <div key={key} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <div className="space-y-0.5">
                      <span className="font-bold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                        {key.replace('_', ' ')}
                      </span>
                      <span className="text-3xs text-slate-400 block font-medium">Unit: {getUnit(key)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-slate-850 dark:text-slate-100 text-sm">
                        {val}
                      </span>
                      <span className={`px-2.5 py-1 text-3xs font-bold rounded-full uppercase tracking-wider ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Consultation Notes Section */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <Stethoscope size={18} className="text-primary-500" />
              <span>Physician Consultation Notes</span>
            </h3>

            {user.role === 'doctor' ? (
              // Doctor can update notes
              <form onSubmit={handleConsultSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Clinical Findings & Observations
                  </label>
                  <textarea
                    rows={3}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="input-field py-2"
                    placeholder="Write patient diagnostics, physical presentations, and clinical interpretations..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Prescriptions & Medications
                  </label>
                  <textarea
                    rows={2}
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    className="input-field py-2 font-mono text-xs"
                    placeholder="e.g. Rx Metformin 500mg - twice daily with meals..."
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={consultSubmitLoading} className="btn-primary py-2 px-4 text-xs font-bold">
                    {consultSubmitLoading ? 'Saving...' : 'Publish Consult & Recompile PDF'}
                  </button>
                </div>
              </form>
            ) : (
              // Patient/Lab view notes
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-3xs text-slate-400 font-semibold uppercase tracking-wider block">Clinical Notes</span>
                  <div className="p-4 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 min-h-24 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {report.clinicalNotes || 'No notes appended by consulting physician yet.'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-3xs text-slate-400 font-semibold uppercase tracking-wider block">Rx Medication Prescription</span>
                  <div className="p-4 bg-primary-500/5 dark:bg-primary-950/10 rounded-2xl border border-primary-500/10 min-h-24 text-xs leading-relaxed text-slate-650 dark:text-primary-300 font-mono">
                    {report.prescription || 'No prescriptions generated.'}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: AI Assessment & Conversational Assistant */}
        <div className="space-y-6">
          
          {/* Health Score & Summary Card */}
          {report.aiAnalysis && (
            <div className="glass-card p-6 rounded-3xl space-y-4 bg-gradient-to-br from-primary-50/50 via-white to-transparent dark:from-primary-950/10 dark:via-slate-900 border-primary-500/10">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-extrabold uppercase tracking-widest text-primary-500 flex items-center gap-1.5">
                  <Sparkles size={14} className="animate-pulse" />
                  <span>OFFLINE AI DIGEST</span>
                </span>
                <span className="text-3xs bg-primary-600/10 text-primary-500 px-2 py-0.5 rounded font-bold">
                  Rule Engine v1
                </span>
              </div>

              {/* Health Score */}
              <div className="flex items-center gap-4 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-850">
                <div className="w-14 h-14 rounded-full border-4 border-primary-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-black text-primary-600 dark:text-primary-400">
                    {report.aiAnalysis.healthScore || 100}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Patient Health Score</h4>
                  <p className="text-3xs text-slate-400 mt-0.5">Assessed score based on parameter deviations.</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-justify">
                {report.aiAnalysis.summary}
              </p>

              {/* Suggestions */}
              {report.aiAnalysis.lifestyleSuggestions?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-150 dark:border-slate-800">
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Lightbulb size={12} className="text-amber-500" />
                    <span>LIFESTYLE MODIFICATIONS</span>
                  </span>
                  <ul className="space-y-1.5">
                    {report.aiAnalysis.lifestyleSuggestions.slice(0, 3).map((s, idx) => (
                      <li key={idx} className="text-3xs text-slate-500 dark:text-slate-400 leading-normal list-disc pl-1 ml-3">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* QR Code and verification Details */}
              {report.qrCodeUrl && (
                <div className="pt-4 border-t border-slate-150 dark:border-slate-800 flex items-center gap-4 bg-slate-100/50 dark:bg-slate-950/20 p-3 rounded-2xl">
                  <img src={report.qrCodeUrl} alt="QR Verify" className="w-16 h-16 rounded border border-slate-200 dark:border-slate-800 bg-white" />
                  <div className="space-y-1 overflow-hidden">
                    <h5 className="text-3xs font-bold uppercase tracking-wider text-slate-400">Public Verification Code</h5>
                    <p className="text-4xs text-slate-400 truncate">{report.verificationToken}</p>
                    <Link to={`/verify-report/${report.verificationToken}`} className="text-4xs font-bold text-primary-500 hover:underline block pt-0.5">
                      Verify Ledger Link
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Medical Chatbot Interface */}
          <div className="glass-card rounded-3xl overflow-hidden h-[420px] flex flex-col justify-between border border-slate-200 dark:border-slate-800">
            {/* Chat header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-600/10 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0">
                <Bot size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Medical Assistant</h4>
                <span className="text-[10px] text-slate-400 block -mt-0.5">Context: {report.reportType} panel</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-100/30 dark:bg-slate-950/10">
              {chatMessages.map((msg, i) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div 
                    key={i} 
                    className={`flex items-start gap-2 max-w-[85%] ${
                      isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-3xs flex-shrink-0 ${
                      isBot ? 'bg-primary-600/10 text-primary-600' : 'bg-slate-800 text-white'
                    }`}>
                      {isBot ? <Bot size={12} /> : <User size={12} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm ${
                      isBot 
                        ? 'bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-slate-700 dark:text-slate-350' 
                        : 'bg-primary-600 text-white'
                    }`}>
                      {msg.text.split('\n').map((line, lidx) => (
                        <p key={lidx} className={lidx > 0 ? 'mt-1.5' : ''}>{line}</p>
                      ))}
                    </div>
                  </div>
                );
              })}
              {chatLoading && (
                <div className="flex items-start gap-2 mr-auto">
                  <div className="w-6 h-6 rounded-full bg-primary-600/10 text-primary-600 flex items-center justify-center text-3xs">
                    <Bot size={12} />
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={chatLoading}
                className="input-field py-2 text-xs flex-1 rounded-xl"
                placeholder="Ask about your results..."
              />
              <button 
                type="submit" 
                disabled={chatLoading}
                className="p-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all shadow shadow-primary-500/10"
              >
                <Send size={14} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
