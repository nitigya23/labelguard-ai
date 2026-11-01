import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Info, Sparkles, ShieldCheck, Layers } from 'lucide-react';

export default function Step3ReviewDrafts({
  draftsData,
  onProceedToRedline,
  onBack
}) {
  const [selectedLabelIndex, setSelectedLabelIndex] = useState(0);

  if (!draftsData || draftsData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Generating drafts and evaluating regulatory compliance rules...</p>
      </div>
    );
  }

  // Filter to affected labels first or allow all
  const currentLabel = draftsData[selectedLabelIndex] || draftsData[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Intro and Label Selector */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-[#0B7285]/10 text-[#0B7285] text-xs font-bold px-2 py-0.5 rounded-md uppercase">
                Step 3 of 6
              </span>
              <h2 className="text-xl font-bold text-[#0B2545]">Review AI Drafts & Regulatory Rules</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              "AI drafts and flags, rules verify, people approve." Every check is validated against loaded YAML regulatory rules.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3 py-1.5 rounded-lg flex items-center space-x-2">
            <Info className="w-4 h-4 text-[#F2B04A] shrink-0" />
            <span className="text-[11px] font-medium">Sample rules for demo; verify against official standards before production release.</span>
          </div>
        </div>

        {/* Label Selector Tabs */}
        <div className="mt-4 flex items-center space-x-2 overflow-x-auto pb-2">
          {draftsData.map((lbl, idx) => {
            const isSelected = idx === selectedLabelIndex;
            const hasFlags = lbl.flag_count > 0;

            return (
              <button
                key={lbl.label_id}
                type="button"
                onClick={() => setSelectedLabelIndex(idx)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold shrink-0 transition border cursor-pointer ${
                  isSelected
                    ? "bg-[#0B2545] text-white border-[#0B2545] shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>{lbl.label_code}</span>
                {hasFlags ? (
                  <span className="w-4 h-4 rounded-full bg-[#C2410C] text-white text-[9px] flex items-center justify-center font-bold">
                    {lbl.flag_count}
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Comparative Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Side-by-Side Text Draft (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Target Label Component
                </span>
                <h3 className="text-base font-bold text-[#0B2545]">
                  {currentLabel.label_name} ({currentLabel.label_code})
                </h3>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono uppercase text-[10px]">
                  Lang: {currentLabel.language}
                </span>
                <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded capitalize text-[10px] font-semibold">
                  Type: {currentLabel.label_type}
                </span>
              </div>
            </div>

            {/* Version 2.4 vs Version 3.0 Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Baseline Current Text */}
              <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Baseline (v2.4 Approved)
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded font-semibold">
                    DHF Active
                  </span>
                </div>
                <div className="text-xs text-slate-700 font-mono leading-relaxed bg-white p-3 rounded border border-slate-200 min-h-[160px] whitespace-pre-wrap">
                  {currentLabel.current_text}
                </div>
                <span className="text-[10px] text-slate-400 mt-2 block italic">
                  Immutable baseline record. Cannot be edited directly.
                </span>
              </div>

              {/* AI Drafted Text */}
              <div className="bg-teal-50/60 rounded-lg p-3.5 border border-teal-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#0B7285]" />
                    <span className="text-[10px] font-bold text-[#0B7285] uppercase tracking-wider">
                      AI Proposed Draft (v3.0)
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-semibold">
                    Awaiting QA Sign-off
                  </span>
                </div>
                <div className="text-xs text-slate-800 font-mono leading-relaxed bg-white p-3 rounded border border-teal-300 min-h-[160px] whitespace-pre-wrap shadow-xs">
                  {currentLabel.drafted_text}
                </div>
                <span className="text-[10px] text-teal-700 mt-2 block font-medium">
                  Harmonized with change request parameter without altering other DHF attributes.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Compliance Checks Panel (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#0B7285]" />
                <h3 className="text-sm font-bold text-[#0B2545] uppercase tracking-wider">
                  Automated Rule Engine Checks
                </h3>
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] font-bold">
                <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  {currentLabel.pass_count} Pass
                </span>
                <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                  {currentLabel.changed_count} Changed
                </span>
                {currentLabel.flag_count > 0 && (
                  <span className="bg-red-100 text-[#C2410C] px-1.5 py-0.5 rounded">
                    {currentLabel.flag_count} Flag
                  </span>
                )}
              </div>
            </div>

            {/* List of Rule Check Results */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {currentLabel.checks.map((check) => {
                const isPass = check.status === "PASS";
                const isChanged = check.status === "CHANGED";
                const isFlag = check.status === "FLAG";

                return (
                  <div
                    key={check.rule_id}
                    className={`p-3 rounded-lg border text-xs transition ${
                      isFlag
                        ? "bg-red-50/70 border-red-200"
                        : isChanged
                        ? "bg-amber-50/70 border-amber-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-1.5">
                        {isPass && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {isChanged && <AlertTriangle className="w-4 h-4 text-[#F2B04A] shrink-0" />}
                        {isFlag && <XCircle className="w-4 h-4 text-[#C2410C] shrink-0" />}
                        <span className="font-bold text-slate-800">{check.title}</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                          isFlag
                            ? "bg-[#C2410C] text-white"
                            : isChanged
                            ? "bg-[#F2B04A] text-slate-900"
                            : "bg-emerald-600 text-white"
                        }`}
                      >
                        {check.status}
                      </span>
                    </div>

                    <div className="mt-1 text-[11px] text-slate-600">
                      {check.finding}
                    </div>

                    {check.recommendation && (
                      <div className="mt-1 text-[10px] text-[#C2410C] font-semibold bg-red-100/60 p-1.5 rounded">
                        Action Required: {check.recommendation}
                      </div>
                    )}

                    {/* Rule ID & Regulatory Citation */}
                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>ID: <strong className="text-slate-700">{check.rule_id}</strong></span>
                      <span>Source: <strong className="text-[#0B7285]">{check.source}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Impact Map</span>
        </button>

        <button
          type="button"
          onClick={() => onProceedToRedline(currentLabel.label_id)}
          className="flex items-center space-x-2 px-6 py-2.5 bg-[#0B7285] hover:bg-[#095c6b] text-white text-xs font-semibold rounded-lg shadow-md transition cursor-pointer"
        >
          <Layers className="w-4 h-4" />
          <span>View OpenCV Visual Redline Diff</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
