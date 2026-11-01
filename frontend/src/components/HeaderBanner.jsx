import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Cpu, CheckCircle2, FileCheck, Users, ExternalLink, Award } from 'lucide-react';

export default function HeaderBanner({ onResetDemo, isResetting, currentStep }) {
  const [showTeamModal, setShowTeamModal] = useState(false);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-[#F2B04A]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">LabelGuard AI</h1>
              <span className="bg-[#0B7285] text-teal-100 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-teal-400/30 uppercase">
                Teliport S4
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Tata Elxsi Case Study 4 • End-to-End Medical Device Labeling Automation
            </p>
          </div>
        </div>

        {/* Right side actions & Team Badge */}
        <div className="flex items-center space-x-3">
          {/* Team Tech Titans Button */}
          <div className="relative">
            <button
              onClick={() => setShowTeamModal(!showTeamModal)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#0B7285]/40 hover:bg-[#0B7285]/70 border border-teal-400/40 text-xs text-teal-100 transition cursor-pointer"
              title="View Team Tech Titans Details"
            >
              <Users className="w-3.5 h-3.5 text-[#F2B04A]" />
              <span className="font-semibold text-white">Tech Titans</span>
              <span className="hidden lg:inline text-teal-200 text-[10px]">(UIET, MDU)</span>
            </button>

            {/* Team Dropdown / Popover */}
            {showTeamModal && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-[#0B7285]" />
                    <span className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">Team Tech Titans</span>
                  </div>
                  <span className="text-[10px] bg-teal-50 text-[#0B7285] px-1.5 py-0.5 rounded font-semibold">Teliport S4</span>
                </div>

                <div className="mt-2.5 space-y-2 text-xs">
                  <div className="p-2 bg-amber-50/70 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Kuldeep</span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-200 px-1.5 py-0.2 rounded uppercase">Leader</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">kuldeep.uietrohtak@gmail.com</span>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Sakshi Kumari</span>
                      <span className="text-[10px] text-slate-600 bg-slate-200 px-1.5 py-0.2 rounded font-medium">Member</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">sakshikumari544@gmail.com</span>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Nitigya Talwar</span>
                      <span className="text-[10px] text-slate-600 bg-slate-200 px-1.5 py-0.2 rounded font-medium">Member</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">nitigyatalwar@gmail.com</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-center text-slate-500 font-medium">
                  🏛️ UIET, MDU Rohtak, Haryana
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Button */}
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
