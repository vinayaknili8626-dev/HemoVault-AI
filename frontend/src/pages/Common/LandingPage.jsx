import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, HeartPulse, FileSpreadsheet, Key, HelpCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between transition-colors">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-primary-600 to-teal-500 dark:from-primary-400 dark:to-teal-400 bg-clip-text text-transparent">
              HemoVault AI
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/login" className="btn-secondary px-4 py-2 text-xs sm:text-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary px-4 py-2 text-xs sm:text-sm">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-950/10">
          {/* Animated decorative blobs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary-500/10 dark:bg-primary-400/10 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider mx-auto"
            >
              <Sparkles size={14} />
              <span>Offline Clinical AI Diagnostics</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white"
            >
              Secure, AI-Powered <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary-600 to-teal-500 dark:from-primary-400 dark:to-teal-400 bg-clip-text text-transparent">
                Blood Test Record Ledger
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto text-base sm:text-lg text-slate-500 dark:text-slate-400"
            >
              Ditch paper blood reports. HemoVault AI processes lab uploads, performs clinical parameter audits, computes health scores, and charts historical health trends—all locally and offline.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-center gap-4 pt-4"
            >
              <Link to="/register" className="btn-primary px-8 py-3 text-base shadow-lg shadow-primary-500/20">
                Register Free
              </Link>
              <Link to="/login" className="btn-secondary px-8 py-3 text-base">
                Dashboard Portal
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
              Platform Features
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-lg mx-auto">
              HemoVault AI integrates patients, clinical laboratories, and medical practitioners on one unified secure ledger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-primary-500/10 text-primary-500 rounded-2xl flex items-center justify-center">
                <HeartPulse size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Patient Dashboard</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Track your longitudinal health index, view automated parameters, and discuss your metrics with an interactive local AI medical assistant.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-teal-500/10 text-teal-500 rounded-2xl flex items-center justify-center">
                <FileSpreadsheet size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Laboratory Portal</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Directly upload blood panels using manual forms or drag-and-drop PDFs. Our local OCR extracts blood metrics, generating secure PDF reports.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">QR Cryptographic Audit</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Every published report holds a secure, encrypted QR verification code, allowing hospitals or third parties to immediately check record legitimacy.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="py-12 bg-slate-100 dark:bg-slate-900 border-y border-slate-200/50 dark:border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <span className="block text-3xl font-extrabold text-primary-500">100%</span>
              <span className="text-2xs text-slate-400 uppercase tracking-widest font-bold block mt-1">Offline & Private</span>
            </div>
            <div>
              <span className="block text-3xl font-extrabold text-primary-500">20+</span>
              <span className="text-2xs text-slate-400 uppercase tracking-widest font-bold block mt-1">Blood Parameters</span>
            </div>
            <div>
              <span className="block text-3xl font-extrabold text-primary-500">5 Roles</span>
              <span className="text-2xs text-slate-400 uppercase tracking-widest font-bold block mt-1">Dashboard Profiles</span>
            </div>
            <div>
              <span className="block text-3xl font-extrabold text-primary-500">1-Click</span>
              <span className="text-2xs text-slate-400 uppercase tracking-widest font-bold block mt-1">QR Verification</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-850/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400 dark:text-slate-600">
          <p>© {new Date().getFullYear()} HemoVault AI. Secured Digital Medical Record Infrastructure.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
