import React from 'react';
import { ShieldCheck, RefreshCw, Cpu, CheckCircle2, FileCheck } from 'lucide-react';

export default function HeaderBanner({ onResetDemo, isResetting, currentStep }) {
  return (
    <header className="bg-[#0B2545] text-white shadow-lg sticky top-0 z-50">
      {/* Top Value Proposition Banner */}
      <div className="bg-[#0B7285] px-4 py-1.5 text-xs text-center font-medium tracking-wide flex items-center justify-center space-x-2 border-b border-teal-500/30">
        <Cpu className="w-3.5 h-3.5 text-teal-200" />
        <span>AI drafts & flags</span>
        <span className="text-teal-300">•</span>
        <FileCheck className="w-3.5 h-3.5 text-teal-200" />
        <span>Rules verify</span>
        <span className="text-teal-300">•</span>
        <CheckCircle2 className="w-3.5 h-3.5 text-[#F2B04A]" />
        <span className="font-semibold text-white">People approve</span>
        <span className="text-teal-300">•</span>
        <span className="text-teal-100 hidden sm:inline italic">AI never edits an approved label directly</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-[#F2B04A]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">LabelGuard AI</h1>
              <span className="bg-[#0B7285] text-teal-100 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-teal-400/30 uppercase">
                Prototype v1.0
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Tata Elxsi Teliport S4 • End-to-End Medical Device Labeling Automation
            </p>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[11px] text-slate-300 font-mono">Fictional Device: GlucoGuard Pro CGM</span>
            <span className="text-[10px] text-emerald-400 font-medium">Compliance Baseline: ISO 15223-1 / EU MDR / FDA 801</span>
          </div>

          <button
            onClick={onResetDemo}
            disabled={isResetting}
            title="Reset all sample data and restart demo"
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? "Resetting..." : "Load Demo Data"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
