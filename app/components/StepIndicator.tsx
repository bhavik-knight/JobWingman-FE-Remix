import React from 'react';
import { Link } from '@remix-run/react';
import {
  Briefcase,
  Upload,
  Award,
  Edit3,
  Eye,
  CheckCircle,
} from 'lucide-react';

interface Step {
  id: number;
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StepIndicatorProps {
  currentStepId: number;
  isStepUnlocked: (stepId: number) => boolean;
}

export default function StepIndicator({ currentStepId, isStepUnlocked }: StepIndicatorProps) {
  const steps: Step[] = [
    { id: 1, path: '/wizard/job-details', label: 'Job Details', icon: Briefcase },
    { id: 2, path: '/wizard/upload-resume', label: 'Upload Resume', icon: Upload },
    { id: 3, path: '/wizard/align-score', label: 'AI Alignment Audit', icon: Award },
    { id: 4, path: '/wizard/edit-resume', label: 'Edit Resume', icon: Edit3 },
    { id: 5, path: '/wizard/preview-pdf', label: 'Preview PDF', icon: Eye },
  ];

  return (
    <div className="w-full bg-card border border-border rounded-2xl p-4 flex justify-between items-center relative overflow-hidden backdrop-blur-md mb-6 animate-fade-in">
      <div className="flex w-full items-center justify-between z-10">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isActive = currentStepId === s.id;
          const isCompleted = currentStepId > s.id && isStepUnlocked(s.id);
          const unlocked = isStepUnlocked(s.id);

          const content = (
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                isActive
                  ? 'bg-primary border-primary text-white shadow-md shadow-primary-glow scale-105'
                  : isCompleted
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : unlocked
                      ? 'bg-background border-border text-gray-400 hover:border-gray-350 hover:text-white'
                      : 'bg-zinc-900/30 border-zinc-800/40 text-zinc-600'
              }`}
            >
              {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </div>
          );

          if (unlocked) {
            return (
              <React.Fragment key={s.id}>
                <Link to={s.path} className="flex flex-col items-center space-y-1 flex-1 cursor-pointer group">
                  {content}
                  <span className={`text-[10px] font-medium hidden sm:block transition-colors duration-200 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-zinc-200'}`}>
                    {s.label}
                  </span>
                </Link>
                {idx < steps.length - 1 && (
                  <div className={`h-[1px] flex-grow mx-2 hidden sm:block transition-all duration-500 ${currentStepId > s.id ? 'bg-emerald-500/40' : 'bg-border'}`}></div>
                )}
              </React.Fragment>
            );
          } else {
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center space-y-1 flex-1 cursor-not-allowed opacity-50">
                  {content}
                  <span className="text-[10px] font-medium hidden sm:block text-zinc-500">
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
}
