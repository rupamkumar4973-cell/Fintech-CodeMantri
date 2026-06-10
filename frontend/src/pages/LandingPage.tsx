import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Cpu, Sparkles, TrendingUp, BarChart3, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-white">
      
      {/* Background blobs for premium glassmorphism glow */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute top-20 -right-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
      <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000" />

      {/* Hero Header */}
      <header className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span>SmartLoan <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">AI</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-350 hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-all">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
          <div className="flex flex-col gap-6 text-left">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 ring-1 ring-blue-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen FinTech Platform</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
              Instant Loan <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Eligibility</span> Engine
            </h1>
            <p className="max-w-md text-base text-slate-350 sm:text-lg">
              Check credit bureau scores, verify KYC using OCR extraction, and evaluate borrowing potential instantly with AI-powered risk scoring.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/register" className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-blue-500/30 hover:bg-blue-500 transition-all hover:scale-[1.02]">
                <span>Check Eligibility Now</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#features" className="rounded-xl border border-slate-700 bg-slate-800/40 px-6 py-3.5 text-base font-semibold text-slate-300 hover:bg-slate-800 transition-all">
                Learn More
              </a>
            </div>
          </div>

          {/* Interactive Card Presentation */}
          <div className="relative">
            <div className="glass rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 overflow-hidden">
              <div className="flex items-center justify-between pb-6 border-b border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Scorecard Assessment</span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 ring-1 ring-emerald-500/20">Low Risk</span>
              </div>
              
              <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-700">
                <div>
                  <span className="block text-[10px] uppercase text-slate-400">Bureau Credit Score</span>
                  <span className="text-3xl font-extrabold text-white">795</span>
                  <span className="block text-[10px] text-emerald-400 font-semibold mt-1">Excellent Range</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-slate-400">Borrowing Capacity</span>
                  <span className="text-3xl font-extrabold text-blue-400">₹15,00,000</span>
                  <span className="block text-[10px] text-slate-400 mt-1">Max Limit</span>
                </div>
              </div>

              <div className="space-y-4 pt-6 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">AI Suggested APR</span>
                  <span className="font-bold text-white">8.99%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Debt-to-Income (DTI)</span>
                  <span className="font-bold text-white">22%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Approval Probability</span>
                  <span className="font-bold text-emerald-400">96.8%</span>
                </div>
              </div>
            </div>
            
            {/* Secondary backing card */}
            <div className="absolute top-8 left-8 right-0 bottom-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl -z-10 translate-x-2 translate-y-2 opacity-30 blur-sm" />
          </div>
        </div>
      </main>

      {/* Feature Section */}
      <section id="features" className="relative z-10 bg-slate-950 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Platform Capabilities</h2>
            <p className="text-slate-400">Equipped with enterprise-grade features to deliver accurate, secure assessments in milliseconds.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 pt-16">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 ring-1 ring-blue-500/20">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">OCR Document Extraction</h3>
              <p className="text-sm text-slate-400">Upload identity cards. Our OCR layer automatically reads details to bypass manual entry bottlenecks.</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 ring-1 ring-indigo-500/20">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Risk Assessment Engine</h3>
              <p className="text-sm text-slate-400">Advanced models run multi-parameter tests evaluating CIBIL, DTI, age, and records for absolute safety.</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/10 text-purple-400 ring-1 ring-purple-500/20">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Smart Financial Health</h3>
              <p className="text-sm text-slate-400">Receive customized recommendation paths to repair scores, extend tenures, or optimize monthly EMIs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} SmartLoan AI. Built under banking-grade AES-256 and HTTPS specifications.</p>
        </div>
      </footer>
    </div>
  );
}
