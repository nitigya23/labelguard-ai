import React, { useState } from 'react';
import { ArrowRight, Sparkles, Database, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export default function Step1DescribeChange({
  productMaster,
  onSubmitChange,
  isLoading,
  error
}) {
  const [description, setDescription] = useState(
    "Storage temperature changes from 2-8 C to 2-25 C following real-time stability qualification study STAB-2026-Q3."
  );

  const presets = [
    {
      title: "Storage Temperature (Primary Hackathon Demo)",
      badge: "High Impact (8 Labels)",
      text: "Storage temperature changes from 2-8 C to 2-25 C following real-time stability qualification study STAB-2026-Q3."
    },
    {
      title: "Legal Manufacturer Address Relocation",
      badge: "Global Impact (9 Labels)",
      text: "Legal manufacturer address changes to Unit 4, Westside Life Sciences Campus, Galway, H91 V4X2, Ireland."
    },
    {
      title: "Sterilization Validation Update",
      badge: "Pouch & IFU (5 Labels)",
      text: "Sterilization method specification updated to STERILE R (Gamma Radiation per ISO 11137)."
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    onSubmitChange(description.trim());
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Intro Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 md:p-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-[#0B7285]/10 text-[#0B7285] text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                Step 1 of 6
              </span>
              <span className="text-xs text-slate-500 font-mono">Engineering Change Order (ECO)</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0B2545] mt-2">Describe the Product Change</h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              Enter the proposed design, specification, or regulatory change. LabelGuard AI will parse the affected parameters, evaluate the product master record, and map impacts across all registered packaging, IFU leaflets, and device markings.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-sm text-[#C2410C]">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Change Input Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Change Description / Regulatory Rationale
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Storage temperature changes from 2-8 C to 2-25 C..."
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-[#0B7285] focus:ring-2 focus:ring-[#0B7285]/20 text-slate-800 text-sm outline-hidden transition shadow-inner font-sans"
                required
              />
            </div>
          </div>

          {/* Quick-fill Demo Presets */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-[#F2B04A]" />
              <span>Or Select a Demo Scenario (Instant Fill):</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setDescription(p.text)}
                  className="text-left p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 transition text-xs group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800 group-hover:text-[#0B7285]">{p.title}</span>
                  </div>
                  <span className="inline-block text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono group-hover:bg-teal-100 group-hover:text-teal-800">
                    {p.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !description.trim()}
              className="flex items-center space-x-2 px-6 py-3 bg-[#0B7285] hover:bg-[#095c6b] text-white text-sm font-semibold rounded-lg shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? "Parsing Parameters & Mapping..." : "Analyze Regulatory Impact"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Product Master Record Reference Card */}
      {productMaster && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-[#0B7285]" />
              <h3 className="text-sm font-bold text-[#0B2545] uppercase tracking-wider">
                Product Master Record (Baseline DHF v2.4)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Verified Regulatory Status: Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Device Name</span>
              <span className="font-bold text-slate-800">{productMaster.name}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Model Code</span>
              <span className="font-bold text-slate-800 font-mono">{productMaster.model_code}</span>
            </div>
            <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200">
              <span className="text-amber-700 block text-[10px] uppercase font-semibold">Storage Temperature</span>
              <span className="font-bold text-amber-900">{productMaster.storage_temp_text}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">UDI-DI / GTIN</span>
              <span className="font-bold text-slate-800 font-mono">{productMaster.udi_di}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg col-span-2">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Legal Manufacturer & Site</span>
              <span className="font-bold text-slate-800">{productMaster.manufacturer_name} ({productMaster.manufacturer_address})</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Notified Body</span>
              <span className="font-bold text-slate-800 font-mono">{productMaster.ce_notified_body}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sterilization Method</span>
              <span className="font-bold text-slate-800">{productMaster.sterilization_method}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
