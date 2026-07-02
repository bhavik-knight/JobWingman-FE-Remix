import React from 'react';
import { Outlet, useLocation } from '@remix-run/react';
import { useApplications } from '../hooks/useApplications';
import StepIndicator from '../components/StepIndicator';

export default function WizardLayout() {
  const location = useLocation();
  const { selectedApp, wizardForm } = useApplications();
  
  const steps = [
    { id: 1, path: '/wizard/job-details' },
    { id: 2, path: '/wizard/upload-resume' },
    { id: 3, path: '/wizard/align-score' },
    { id: 4, path: '/wizard/edit-resume' },
    { id: 5, path: '/wizard/preview-pdf' },
  ];

  const currentStepIndex = steps.findIndex(s => location.pathname.includes(s.path));
  const currentStepId = currentStepIndex >= 0 ? steps[currentStepIndex].id : 1;

  const isStep1Complete = !!(
    (wizardForm as any)?.title || wizardForm?.jobTitle || ''
  ).trim() && !!(
    (wizardForm as any)?.company || wizardForm?.company || ''
  ).trim() && !!(
    (wizardForm as any)?.rawText || wizardForm?.jobDescription || ''
  ).trim();

  const isStepUnlocked = (stepId: number) => {
    if (stepId === 1) return true;
    if (stepId === 2) return isStep1Complete;
    return !!selectedApp;
  };

  return (
    <div className="w-full flex flex-col h-full space-y-6">
      <StepIndicator currentStepId={currentStepId} isStepUnlocked={isStepUnlocked} />
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
}

