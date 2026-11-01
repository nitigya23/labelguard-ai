import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Network, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';

export default function Step2ImpactMap({
  impactData,
  onProceed,
  onBack
}) {
  const [selectedNode, setSelectedNode] = useState(null);

  if (!impactData) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Loading regulatory impact analysis...</p>
      </div>
    );
  }

  const {
    change_request,
    total_labels,
    affected_labels_count,
    affected_percentage,
    nodes,
    edges
  } = impactData;

  // Filter nodes for categorization
  const fieldNode = nodes.find(n => n.type === 'product_field');
  const labelNodes = nodes.filter(n => n.type === 'label');
  const regNodes = nodes.filter(n => n.type === 'regulatory_rule');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Affected Scope</span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-3xl font-extrabold text-[#C2410C]">{affected_labels_count}</span>
              <span className="text-sm font-semibold text-slate-500">of {total_labels} labels</span>
            </div>
            <span className="text-[11px] text-[#C2410C] font-medium">{affected_percentage}% of total labeling</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-[#C2410C]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unaffected Labels</span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-3xl font-extrabold text-emerald-600">{total_labels - affected_labels_count}</span>
              <span className="text-sm font-semibold text-slate-500">labels isolated</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">E.g., Device direct markings</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trigger Parameter</span>
            <h4 className="text-base font-bold text-[#0B2545] mt-1 capitalize truncate max-w-[150px]">
              {change_request.field_key.replace('_', ' ')}
            </h4>
            <span className="text-[11px] text-[#0B7285] font-semibold">Parsed via NetworkX</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center">
            <Network className="w-6 h-6 text-[#0B7285]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Regulatory Standards</span>
            <div className="text-lg font-bold text-[#0B2545] mt-1">3 Frameworks</div>
            <span className="text-[11px] text-slate-500 font-medium">ISO 15223-1 / EU MDR / FDA</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-[#0B2545]" />
          </div>
        </div>
      </div>

      {/* Main Graph Visualization Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-[#0B7285]/10 text-[#0B7285] text-xs font-bold px-2 py-0.5 rounded-md uppercase">
                Step 2 of 6
              </span>
              <h3 className="text-lg font-bold text-[#0B2545]">Traceability Impact Graph (NetworkX)</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive relationship map linking changed engineering specification to registered labels and governing standards.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-medium">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#0B7285]"></span>
              <span className="text-slate-600">Changed Attribute</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#F2B04A] border border-amber-600"></span>
              <span className="text-slate-600">Affected Label ({affected_labels_count})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-300"></span>
              <span className="text-slate-600">Unaffected Label ({total_labels - affected_labels_count})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-md bg-[#0B2545]"></span>
              <span className="text-slate-600">Regulatory Standard</span>
            </div>
          </div>
        </div>

        {/* SVG Graph Canvas */}
        <div className="relative mt-4 bg-slate-50/70 border border-slate-200 rounded-xl p-4 overflow-hidden">
          <svg className="w-full h-[380px]" viewBox="0 0 920 380">
            <defs>
              <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0B7285" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#C2410C" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="regGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C2410C" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0B2545" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Left: Changed Field Node */}
            <g transform="translate(60, 180)">
              <circle r="44" fill="#0B7285" className="animate-pulse" opacity="0.15" />
              <circle r="36" fill="#0B7285" stroke="#095c6b" strokeWidth="2.5" />
              <text textAnchor="middle" y="-6" fill="#ffffff" fontSize="11" fontWeight="bold">TRIGGER</text>
              <text textAnchor="middle" y="10" fill="#E0F2FE" fontSize="9" fontWeight="medium">Storage Temp</text>
              <text textAnchor="middle" y="24" fill="#F2B04A" fontSize="8" fontWeight="bold">2-8°C → 2-25°C</text>
            </g>

            {/* Middle Column: Label Nodes */}
            {labelNodes.map((lbl, idx) => {
              const totalItems = labelNodes.length;
              const yPos = 35 + idx * 36;
              const isAffected = lbl.category === 'affected';
              const xPos = 440;

              return (
                <g
                  key={lbl.id}
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedNode(lbl)}
                >
                  {/* Curved connection line from Trigger to Label */}
                  <path
                    d={`M 96 180 C 260 180, 280 ${yPos}, ${xPos - 85} ${yPos}`}
                    fill="none"
                    stroke={isAffected ? "url(#edgeGrad)" : "#CBD5E1"}
                    strokeWidth={isAffected ? "2" : "1"}
                    strokeDasharray={isAffected ? "none" : "3 3"}
                  />

                  {/* Label Pill Box */}
                  <rect
                    x={xPos - 80}
                    y={yPos - 13}
                    width="180"
                    height="26"
                    rx="6"
                    fill={isAffected ? "#FFFBEB" : "#F8FAFC"}
                    stroke={isAffected ? "#F2B04A" : "#CBD5E1"}
                    strokeWidth={isAffected ? "1.8" : "1"}
                  />
                  <circle
                    cx={xPos - 68}
                    cy={yPos}
                    r="4"
                    fill={isAffected ? "#C2410C" : "#94A3B8"}
                  />
                  <text
                    x={xPos - 58}
                    y={yPos + 3}
                    fontSize="10"
                    fontWeight="bold"
                    fill={isAffected ? "#0B2545" : "#64748B"}
                  >
                    {lbl.details?.code || lbl.label}
                  </text>
                  <text
                    x={xPos + 55}
                    y={yPos + 3}
                    fontSize="8.5"
                    fontWeight="semibold"
                    fill={isAffected ? "#C2410C" : "#94A3B8"}
                  >
                    {isAffected ? "AFFECTED" : "ISOLATED"}
                  </text>

                  {/* Line from Label to Regulatory Standards */}
                  <path
                    d={`M ${xPos + 100} ${yPos} C 620 ${yPos}, 650 ${idx < 3 ? 90 : idx < 6 ? 190 : 290}, 760 ${idx < 3 ? 90 : idx < 6 ? 190 : 290}`}
                    fill="none"
                    stroke="url(#regGrad)"
                    strokeWidth="1.2"
                    strokeOpacity="0.7"
                  />
                </g>
              );
            })}

            {/* Right Column: Regulatory Standards */}
            {regNodes.map((reg, idx) => {
              const yPos = 90 + idx * 100;
              const xPos = 760;

              return (
                <g key={reg.id} transform={`translate(${xPos}, ${yPos})`}>
                  <rect
                    x="0"
                    y="-22"
                    width="145"
                    height="44"
                    rx="8"
                    fill="#0B2545"
                    stroke="#1E3A8A"
                    strokeWidth="1.5"
                  />
                  <text x="12" y="-3" fill="#ffffff" fontSize="10" fontWeight="bold">
                    {reg.label.split(' ')[0]} {reg.label.split(' ')[1]}
                  </text>
                  <text x="12" y="12" fill="#93C5FD" fontSize="8">
                    {reg.label.split('(')[1]?.replace(')', '') || "Regulatory Framework"}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Node detail callout if clicked */}
          {selectedNode && (
            <div className="absolute bottom-3 left-3 bg-white p-3 rounded-lg border border-slate-300 shadow-md text-xs max-w-sm">
              <div className="flex items-center justify-between font-bold text-[#0B2545] mb-1">
                <span>{selectedNode.details?.code}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedNode.category === 'affected' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                  {selectedNode.category === 'affected' ? 'Affected by Change' : 'Unaffected'}
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">{selectedNode.details?.name}</p>
              <div className="mt-1 text-[10px] text-slate-500">
                Language: <span className="font-mono uppercase">{selectedNode.details?.language}</span> | Type: <span className="capitalize">{selectedNode.details?.type}</span>
              </div>
            </div>
          )}
        </div>

        {/* Impact Breakdown Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-xs text-left border border-slate-200 rounded-lg">
            <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Label Code</th>
                <th className="py-2.5 px-4">Label Name & Component</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Language</th>
                <th className="py-2.5 px-4">Impact Status</th>
                <th className="py-2.5 px-4">Governing Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {labelNodes.map((lbl) => {
                const isAff = lbl.category === 'affected';
                return (
                  <tr key={lbl.id} className={isAff ? "bg-amber-50/40 hover:bg-amber-50/70" : "hover:bg-slate-50"}>
                    <td className="py-2 px-4 font-mono font-bold text-slate-800">{lbl.details?.code}</td>
                    <td className="py-2 px-4 text-slate-700">{lbl.details?.name}</td>
                    <td className="py-2 px-4 capitalize text-slate-600">{lbl.details?.type}</td>
                    <td className="py-2 px-4 uppercase font-mono">{lbl.details?.language}</td>
                    <td className="py-2 px-4">
                      {isAff ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#F2B04A]/20 text-[#C2410C] border border-[#F2B04A]">
                          Requires Update (v3 Draft)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          Unaffected (v2 Retained)
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-slate-500 font-mono text-[10px]">
                      {isAff ? "ISO 15223-1 / EU MDR" : "FDA 21 CFR 801 (Tx Marking)"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Controls */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Modify Change Input</span>
          </button>

          <button
            type="button"
            onClick={onProceed}
            className="flex items-center space-x-2 px-6 py-2.5 bg-[#0B7285] hover:bg-[#095c6b] text-white text-xs font-semibold rounded-lg shadow-md transition cursor-pointer"
          >
            <span>Proceed to AI Drafts & Rule Checks ({affected_labels_count} Labels)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
