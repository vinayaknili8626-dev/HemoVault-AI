import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Mail, AlertCircle } from 'lucide-react';

const FAQ = () => {
  const faqs = [
    {
      q: 'Is my health data shared with external services?',
      a: 'No. HemoVault AI is designed to run 100% offline. All diagnostic audits, parameters validation, health scoring, and AI chat explanations run locally on our offline Node servers, ensuring total patient confidentiality and data sovereignty.'
    },
    {
      q: 'How is the Health Score calculated?',
      a: 'The Health Score starts at 100. For each blood marker (like Hemoglobin, Fasting Glucose, LDL) that deviates from standard clinical reference bounds, points are deducted based on severity (Low, High, or Critical deviations). A score above 85 generally indicates a stable healthy status.'
    },
    {
      q: 'What is QR Cryptographic Verification?',
      a: 'Every approved blood report is stamped with an unique cryptographic verification token and QR code. Scanning the QR code takes anyone to a public registry page that validates the report’s integrity, proving the report has not been edited or forged.'
    },
    {
      q: 'How does the PDF OCR upload work?',
      a: 'Laboratories can upload scanned reports as PDF files. The system uses a local text parsing engine to scan keywords and numbers (e.g. Hemoglobin: 14.5) and auto-populates the digital parameters entry fields.'
    },
    {
      q: 'Can my doctor write prescriptions directly in HemoVault AI?',
      a: 'Yes. Authorized doctors can view patient records, add medical consultation notes, and write prescriptions directly onto the digital report. The system automatically recompiles the PDF to append these notes.'
    }
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Help Center & FAQ</h1>
        <p className="text-xs text-slate-500 mt-1">Get instant answers regarding HemoVault AI infrastructure</p>
      </div>

      {/* FAQs List */}
      <div className="space-y-4">
        <h2 className="text-md font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-4">
          <HelpCircle size={18} className="text-primary-500" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div 
                key={i} 
                className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-850"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full p-5 text-left flex justify-between items-center bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
                >
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200 pr-4">{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {isOpen && (
                  <div className="p-5 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-850 text-xs text-slate-600 dark:text-slate-400 leading-relaxed animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Support Box */}
      <div className="glass-card p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <AlertCircle size={18} className="text-primary-500" />
            <span>Need Additional Assistance?</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Our technical support staff can help laboratories set up local Docker systems or troubleshoot user authentication issues.
          </p>
        </div>
        <div className="flex justify-end">
          <a href="mailto:support@hemovault.com" className="btn-primary w-full sm:w-auto">
            <Mail size={16} />
            <span>Contact Technical Support</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
