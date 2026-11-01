import React, { useState, useEffect } from 'react';
import HeaderBanner from './components/HeaderBanner';
import StepProgressBar from './components/StepProgressBar';
import Step1DescribeChange from './components/Step1DescribeChange';
import Step2ImpactMap from './components/Step2ImpactMap';
import Step3ReviewDrafts from './components/Step3ReviewDrafts';
import Step4VisualRedline from './components/Step4VisualRedline';
import Step5Approval from './components/Step5Approval';
import Step6AuditTrail from './components/Step6AuditTrail';

import {
  fetchProductMaster,
  submitChangeRequest,
  resetDemoData,
  fetchImpactSummary,
  fetchDraftsAndChecks,
  submitApproval
} from './api/client';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxReachedStep, setMaxReachedStep] = useState(1);

  const [productMaster, setProductMaster] = useState(null);
  const [changeRequest, setChangeRequest] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [draftsData, setDraftsData] = useState([]);
  const [activeRedlineLabelId, setActiveRedlineLabelId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load product master on initial mount
  useEffect(() => {
    loadMasterRecord();
  }, []);

  const loadMasterRecord = async () => {
    try {
      const data = await fetchProductMaster();
      setProductMaster(data);
    } catch (err) {
      console.error("Failed to load product master:", err);
    }
  };

  // Step 1: Submit Change -> Load Impact Map -> Step 2
  const handleDescribeChange = async (description) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const cr = await submitChangeRequest(description);
      setChangeRequest(cr);

      const impact = await fetchImpactSummary(cr.id);
      setImpactData(impact);

      setCurrentStep(2);
      setMaxReachedStep((prev) => Math.max(prev, 2));
    } catch (err) {
      setErrorMessage(err.message || "Failed to analyze change request.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Proceed to Step 3 (Drafts and Rule Checks)
  const handleProceedToDrafts = async () => {
    if (!changeRequest) return;
    setIsLoading(true);
    try {
      const drafts = await fetchDraftsAndChecks(changeRequest.id);
      setDraftsData(drafts);

      // Default active redline label to carton EN or first affected label
      const firstAff = drafts.find((d) => d.is_affected);
      if (firstAff) {
        setActiveRedlineLabelId(firstAff.label_id);
      } else if (drafts.length > 0) {
        setActiveRedlineLabelId(drafts[0].label_id);
      }

      setCurrentStep(3);
      setMaxReachedStep((prev) => Math.max(prev, 3));
    } catch (err) {
      alert("Error loading drafts: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Proceed to Step 4 (Visual Redline)
  const handleProceedToRedline = (labelId) => {
    setActiveRedlineLabelId(labelId);
    setCurrentStep(4);
    setMaxReachedStep((prev) => Math.max(prev, 4));
  };

  // Step 4: Proceed to Step 5 (Approval Sign-off)
  const handleProceedToApproval = () => {
    setCurrentStep(5);
    setMaxReachedStep((prev) => Math.max(prev, 5));
  };

  // Step 5: Submit RA/QA Approval -> Step 6 (Release & Audit Trail)
  const handleApprovalComplete = async (payload) => {
    setIsLoading(true);
    try {
      await submitApproval(payload);
      setCurrentStep(6);
      setMaxReachedStep(6);
    } catch (err) {
      alert("Error submitting regulatory approval: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Global "Load Demo Data" / Reset Action
  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await resetDemoData();
      await loadMasterRecord();
      setChangeRequest(null);
      setImpactData(null);
      setDraftsData([]);
      setActiveRedlineLabelId(null);
      setErrorMessage("");
      setCurrentStep(1);
      setMaxReachedStep(1);
    } catch (err) {
      alert("Error resetting demo data: " + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6F9] text-slate-900 flex flex-col font-sans">
      {/* Header and Step Progress Bar */}
      <HeaderBanner
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
        currentStep={currentStep}
      />

      <StepProgressBar
        currentStep={currentStep}
        onSelectStep={(step) => setCurrentStep(step)}
        maxReachedStep={maxReachedStep}
      />

      {/* Main Step Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 1 && (
          <Step1DescribeChange
            productMaster={productMaster}
            onSubmitChange={handleDescribeChange}
            isLoading={isLoading}
            error={errorMessage}
          />
        )}

        {currentStep === 2 && (
          <Step2ImpactMap
            impactData={impactData}
            onProceed={handleProceedToDrafts}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3ReviewDrafts
            draftsData={draftsData}
            onProceedToRedline={handleProceedToRedline}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4VisualRedline
            labelsList={draftsData}
            initialLabelId={activeRedlineLabelId}
            onProceedToApproval={handleProceedToApproval}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && (
          <Step5Approval
            changeRequest={changeRequest}
            onApprovalComplete={handleApprovalComplete}
            onBack={() => setCurrentStep(4)}
            isLoading={isLoading}
          />
        )}

        {currentStep === 6 && (
          <Step6AuditTrail
            onRestart={() => {
              setCurrentStep(1);
              setMaxReachedStep(1);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <span>
            <strong>LabelGuard AI</strong> — Prototype for Tata Elxsi Teliport S4 (Case Study 4: Medical Device Labeling Automation)
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Fictional Data Only • ISO 15223-1 / EU MDR 2017/745 / FDA 21 CFR 801
          </span>
        </div>
      </footer>
    </div>
  );
}
