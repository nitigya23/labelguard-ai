import React from 'react';
import { Edit3, Network, FileCheck, Layers, Award, History } from 'lucide-react';

const STEPS = [
  { id: 1, name: "Describe the Change", short: "1. Change Input", icon: Edit3 },
  { id: 2, name: "Impact Map", short: "2. Impact Map", icon: Network },
  { id: 3, name: "Review Draft & Checks", short: "3. Drafts & Rules", icon: FileCheck },
  { id: 4, name: "Visual Redline", short: "4. Redline", icon: Layers },
  { id: 5, name: "RA / QA Approval", short: "5. Sign-off", icon: Award },
  { id: 6, name: "Release & Audit Trail", short: "6. Audit Log", icon: History },
];

export default function StepProgressBar({ currentStep, onSelectStep, maxReachedStep }) {
  return (
    <div className="bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between space-x-2 md:space-x-4">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCurrent = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              const isClickable = step.id <= maxReachedStep;

              return (
                <li key={step.id} className="flex-1">
                  <button
                    type="button"
                    disabled={!isClickable}
                    onClick={() => isClickable && onSelectStep(step.id)}
                    className={`w-full group flex flex-col items-center py-2 px-1 text-center border-b-2 transition-all cursor-pointer ${
                      isCurrent
                        ? "border-[#0B7285] text-[#0B2545]"
                        : isCompleted
                        ? "border-emerald-500 text-slate-700 hover:border-emerald-600"
                        : "border-transparent text-slate-400 hover:text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                          isCurrent
                            ? "bg-[#0B7285] text-white shadow-xs"
                            : isCompleted
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {isCompleted ? "✓" : step.id}
                      </div>
                      <Icon
                        className={`w-4 h-4 hidden sm:inline ${
                          isCurrent
                            ? "text-[#0B7285]"
                            : isCompleted
                            ? "text-emerald-500"
                            : "text-slate-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[11px] md:text-xs font-medium mt-1 truncate ${
                        isCurrent
                          ? "font-bold text-[#0B2545]"
                          : isCompleted
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {step.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
