import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Award, AlertTriangle, CheckCircle, XCircle, ShieldAlert, Lock, UserCheck } from 'lucide-react';

export default function Step5Approval({
  changeRequest,
  onApprovalComplete,
  onBack,
  isLoading
}) {
  const [actorName, setActorName] = useState("Dr. Eleanor Vance");
  const [actorRole, setActorRole] = useState("Director of Regulatory Affairs & Quality Assurance");
  const [decision, setDecision] = useState("APPROVED");
  const [comments, setComments] = useState(
    "Verified stability qualification test data STAB-2026-Q3. Evaluated all 8 affected labels against ISO 15223-1:2021 Clause 5.3.7 and EU MDR Annex I. Temperature excursion criteria validated. Approved for batch release."
  );
  const [formError, setFormError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!actorName.trim()) {
      setFormError("Full Name of Signatory is mandatory.");
      return;
    }
    if (!actorRole.trim()) {
      setFormError("Professional Role is required for 21 CFR Part 11 compliance.");
      return;
    }

    onApprovalComplete({
      change_request_id: changeRequest.id,
      actor_name: actorName.trim(),
      actor_role: actorRole.trim(),
      decision,
      comments: comments.trim()
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Human Gate Alert Banner */}
      <div className="bg-[#FFFBEB] border-2 border-[#F2B04A] rounded-xl p-5 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-lg bg-[#F2B04A]/20 flex items-center justify-center shrink-0 text-[#C2410C]">
            <Lock className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-[#F2B04A] text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Regulatory Sign-off Gate
              </span>
              <span className="text-xs text-amber-800 font-semibold">21 CFR Part 11 / EU MDR Article 10</span>
            </div>
            <h3 className="text-lg font-bold text-[#0B2545] mt-1">Human Verification & Release Authority</h3>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              <strong>Core Rule:</strong> AI drafts text, and automated rules verify compliance, but only authorized Regulatory Affairs (RA) and Quality Assurance (QA) professionals can sign off on release. <em>AI never edits or releases an approved label directly.</em>
            </p>
          </div>
        </div>
      </div>

      {/* Main Sign-off Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 md:p-8">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 5 of 6</span>
            <h2 className="text-xl font-bold text-[#0B2545]">RA / QA Electronic Sign-off</h2>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Target Change Request</span>
            <span className="font-mono font-bold text-[#0B7285]">CR-ECO-#{changeRequest?.id || "101"}</span>
          </div>
        </div>

        {formError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#C2410C] font-semibold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Signatory Name and Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Authorized Signatory Full Name *
              </label>
              <input
                type="text"
                value={actorName}
                onChange={(e) => setActorName(e.target.value)}
                placeholder="e.g. Dr. Eleanor Vance"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#0B7285] focus:ring-2 focus:ring-[#0B7285]/20 text-slate-800 text-xs font-medium outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Professional Role / Regulatory Title *
              </label>
              <input
                type="text"
                value={actorRole}
                onChange={(e) => setActorRole(e.target.value)}
                placeholder="e.g. Director of Regulatory Affairs"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#0B7285] focus:ring-2 focus:ring-[#0B7285]/20 text-slate-800 text-xs font-medium outline-hidden"
                required
              />
            </div>
          </div>

          {/* Quick Role Fill Pills */}
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <span>Quick Fill Role:</span>
            <button
              type="button"
              onClick={() => {
                setActorName("Dr. Eleanor Vance");
                setActorRole("Director of Regulatory Affairs");
              }}
              className="text-[#0B7285] hover:underline cursor-pointer"
            >
              Director of RA
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setActorName("Marcus Chen, PE");
                setActorRole("Lead Quality Assurance Manager");
              }}
              className="text-[#0B7285] hover:underline cursor-pointer"
            >
              Lead QA Manager
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setActorName("Sarah Jenkins, RAC");
                setActorRole("Medical Device Compliance Officer");
              }}
              className="text-[#0B7285] hover:underline cursor-pointer"
            >
              Compliance Officer
            </button>
          </div>

          {/* Decision Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Formal Regulatory Decision *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition cursor-pointer ${
                  decision === "APPROVED"
                    ? "border-emerald-500 bg-emerald-50/50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="APPROVED"
                  checked={decision === "APPROVED"}
                  onChange={() => setDecision("APPROVED")}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Approve for Release (v3.0)</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Certifies rule conformance, approves batch update, and commits to official DHF record.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition cursor-pointer ${
                  decision === "REJECTED"
                    ? "border-red-500 bg-red-50/50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="REJECTED"
                  checked={decision === "REJECTED"}
                  onChange={() => setDecision("REJECTED")}
                  className="mt-1 text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900 text-sm">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Reject / Request Revision</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Declines the proposal and returns change request to initiator with specified remarks.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Comments / Rationale */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reviewer Regulatory Justification & Audit Comments *
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#0B7285] focus:ring-2 focus:ring-[#0B7285]/20 text-slate-800 text-xs font-mono outline-hidden leading-relaxed"
              required
            />
          </div>

          {/* Electronic Signature Legal Confirmation */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-start space-x-2">
            <UserCheck className="w-4 h-4 text-[#0B7285] shrink-0 mt-0.5" />
            <span>
              By clicking below, I legally certify under 21 CFR Part 11 / EU MDR Article 10 that I have reviewed the impact graph, AI drafted revisions, rule validations, and OpenCV visual redlines for accuracy and regulatory compliance.
            </span>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Visual Redline</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-xs font-bold shadow-md transition cursor-pointer text-white ${
                decision === "APPROVED"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-[#C2410C] hover:bg-red-800"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{isLoading ? "Executing Cryptographic Sign-off..." : `Commit & Sign-off: ${decision}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
