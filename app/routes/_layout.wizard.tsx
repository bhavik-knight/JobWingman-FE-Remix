import React from 'react';
import { Outlet, useLocation, useNavigate, Link } from '@remix-run/react';
import {
  Briefcase,
  Upload,
  Award,
  Edit3,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { useApplications } from '../hooks/useApplications';

export default function WizardLayout() {
  const location = useLocation();
  const { selectedApp, wizardForm } = useApplications();
  
  const steps = [
    { id: 1, path: '/wizard/job-details', label: 'Job Details', icon: Briefcase },
    { id: 2, path: '/wizard/upload-resume', label: 'Upload Resume', icon: Upload },
    { id: 3, path: '/wizard/align-score', label: 'AI Alignment Audit', icon: Award },
    { id: 4, path: '/wizard/edit-resume', label: 'Edit Resume', icon: Edit3 },
    { id: 5, path: '/wizard/preview-pdf', label: 'Preview PDF', icon: Eye },
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

  const renderStepIndicator = () => {
    return (
      <div className="w-full bg-card border border-border rounded-2xl p-4 flex justify-between items-center relative overflow-hidden backdrop-blur-md mb-6">
        <div className="flex w-full items-center justify-between z-10">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = currentStepId === s.id;
            const isCompleted = currentStepId > s.id && isStepUnlocked(s.id);
            const unlocked = isStepUnlocked(s.id);

            const content = (
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-all ${
                  isActive
                    ? 'bg-primary border-primary text-white shadow-md shadow-primary-glow'
                    : isCompleted
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : unlocked
                        ? 'bg-background border-border text-gray-400 hover:border-gray-300'
                        : 'bg-zinc-900/30 border-zinc-800/40 text-zinc-600'
                }`}
              >
                {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
            );

            if (unlocked) {
              return (
                <React.Fragment key={s.id}>
                  <Link to={s.path} className="flex flex-col items-center space-y-1 flex-1 cursor-pointer">
                    {content}
                    <span className={`text-[10px] font-medium hidden sm:block ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </Link>
                  {idx < steps.length - 1 && (
                    <div className={`h-[1px] flex-grow mx-2 hidden sm:block ${currentStepId > s.id ? 'bg-emerald-500/40' : 'bg-border'}`}></div>
                  )}
                </React.Fragment>
              );
            } else {
              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center space-y-1 flex-1 cursor-not-allowed opacity-50">
                    {content}
                    <span className="text-[10px] font-medium hidden sm:block text-zinc-650">
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="h-[1px] flex-grow mx-2 hidden sm:block bg-border/40"></div>
                  )}
                </React.Fragment>
              );
            }
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col h-full space-y-6">
      {renderStepIndicator()}
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
}
