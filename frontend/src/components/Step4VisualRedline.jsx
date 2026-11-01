import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Layers, AlertCircle, Eye, CheckCircle2, SplitSquareVertical, ZoomIn } from 'lucide-react';
import { fetchLabelRedline } from '../api/client';

export default function Step4VisualRedline({
  labelsList,
  initialLabelId,
  onProceedToApproval,
  onBack
}) {
  const [selectedLabelId, setSelectedLabelId] = useState(initialLabelId || labelsList[0]?.label_id);
  const [redlineData, setRedlineData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("diff"); // "diff", "side-by-side", "split"

  useEffect(() => {
    if (selectedLabelId) {
      loadRedline(selectedLabelId);
    }
  }, [selectedLabelId]);

  const loadRedline = async (id) => {
    setIsLoading(true);
    try {
      const data = await fetchLabelRedline(id);
      setRedlineData(data);
    } catch (err) {
      console.error("Error loading redline:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner and Label Selector */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-[#0B7285]/10 text-[#0B7285] text-xs font-bold px-2 py-0.5 rounded-md uppercase">
                Step 4 of 6
              </span>
              <h2 className="text-xl font-bold text-[#0B2545]">Visual Redline & OpenCV Artifact Diff</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Side-by-side graphical comparison of Baseline (v2.4) vs. Proposed (v3.0). Changed regions are detected via computer vision contour analysis.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("diff")}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                viewMode === "diff"
                  ? "bg-[#0B2545] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              OpenCV Redline Overlay
            </button>
            <button
              type="button"
              onClick={() => setViewMode("side-by-side")}
              className={`px-3 py-1.5 rounded-md font-semibold transition cursor-pointer ${
                viewMode === "side-by-side"
                  ? "bg-[#0B2545] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Side-by-Side (v2 vs v3)
            </button>
          </div>
        </div>

        {/* Label Selector Buttons */}
        <div className="mt-4 flex items-center space-x-2 overflow-x-auto pb-2">
          {labelsList.map((lbl) => {
            const isSelected = lbl.label_id === selectedLabelId;
            const isDeviceWithDeliberateIssue = lbl.label_code === "LBL-DEV-EN";

            return (
              <button
                key={lbl.label_id}
                type="button"
                onClick={() => setSelectedLabelId(lbl.label_id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold shrink-0 border transition cursor-pointer ${
                  isSelected
                    ? "bg-[#0B7285] text-white border-[#0B7285] shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>{lbl.label_code}</span>
                {isDeviceWithDeliberateIssue ? (
                  <span className="bg-[#C2410C] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                    2 Flags (Demo Defect)
                  </span>
                ) : lbl.is_affected ? (
                  <span className="bg-[#F2B04A] text-slate-900 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                    1 Change
                  </span>
                ) : (
                  <span className="bg-slate-300 text-slate-700 text-[9px] px-1.5 py-0.2 rounded-full">
                    No change
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">Computing image absolute difference and bounding contours...</p>
        </div>
      )}

      {/* Main Redline Display Area */}
      {redlineData && !isLoading && (
        <div className="space-y-6">
          {/* Detected Changes Badges Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-[#C2410C]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0B2545]">
                  Visual Inspection Summary: {redlineData.label_name}
                </h3>
                <span className="text-xs text-slate-500">
                  {redlineData.difference_count} visual bounding difference{redlineData.difference_count === 1 ? '' : 's'} highlighted by OpenCV
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {redlineData.flags.length > 0 ? (
                redlineData.flags.map((flag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-[#C2410C] border border-red-300"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{flag}</span>
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>No Critical Defect Flags</span>
                </span>
              )}
            </div>
          </div>

          {/* Graphical View Area */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            {viewMode === "diff" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pb-2 border-b border-slate-100">
                  <span>OpenCV Computer Vision Redline Overlay (Changed Zones Boxed in Red)</span>
                  <span className="text-[11px] font-mono text-[#C2410C] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    High Precision Pixel Diff Analysis
                  </span>
                </div>

                <div className="flex justify-center bg-slate-900/5 p-4 rounded-xl border border-slate-200">
                  <img
                    src={redlineData.redline_image_url}
                    alt="OpenCV Redline Diff"
                    className="max-h-[500px] w-auto rounded-lg shadow-lg border border-slate-300 object-contain bg-white"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Baseline v2.4 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1 border-b border-slate-200">
                    <span>Baseline (Version 2.4 - Approved)</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">Current DHF</span>
                  </div>
                  <div className="flex justify-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <img
                      src={redlineData.image_v2_url}
                      alt="Label Version 2"
                      className="max-h-[380px] w-auto rounded shadow-sm border border-slate-300 object-contain bg-white"
                    />
                  </div>
                </div>

                {/* Right: Proposed v3.0 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-teal-900 pb-1 border-b border-teal-200">
                    <span>Proposed Update (Version 3.0 - In Review)</span>
                    <span className="text-[10px] bg-[#0B7285] text-white px-1.5 py-0.5 rounded font-bold">New Revision</span>
                  </div>
                  <div className="flex justify-center bg-teal-50/50 p-2 rounded-lg border border-teal-200">
                    <img
                      src={redlineData.image_v3_url}
                      alt="Label Version 3"
                      className="max-h-[380px] w-auto rounded shadow-sm border border-teal-300 object-contain bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Semantic Text Redline Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Word-by-Word Text Redline (Deletions & Additions)
            </h3>
            <div
              className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono leading-relaxed text-slate-800"
              dangerouslySetInnerHTML={{ __html: redlineData.text_diff_html }}
            />
            <div className="mt-3 flex items-center space-x-4 text-[11px] text-slate-500">
              <span className="flex items-center space-x-1">
                <span className="inline-block w-3 h-3 bg-red-100 border border-red-300 line-through rounded-xs"></span>
                <span>Obsolete / Removed Specification</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="inline-block w-3 h-3 bg-emerald-100 border border-emerald-300 rounded-xs"></span>
                <span>Proposed Validated Specification</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Review Drafts & Checks</span>
        </button>

        <button
          type="button"
          onClick={onProceedToApproval}
          className="flex items-center space-x-2 px-6 py-2.5 bg-[#0B7285] hover:bg-[#095c6b] text-white text-xs font-semibold rounded-lg shadow-md transition cursor-pointer"
        >
          <span>Proceed to RA / QA Approval Sign-off</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
