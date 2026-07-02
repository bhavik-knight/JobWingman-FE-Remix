import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SaveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmApplied: (applied: boolean) => void;
  jobTitle?: string;
  company?: string;
}

export default function SaveConfirmationModal({
  isOpen,
  onClose,
  onConfirmApplied,
  jobTitle = 'Target Role',
  company = 'Target Company'
}: SaveConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative overflow-hidden animate-zoom-in">
        <div className="glow-bg top-[-50px] right-[-50px] opacity-40"></div>

        <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30 mx-auto">
          <CheckCircle className="h-6 w-6 text-emerald-400" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-base font-bold text-white">Application State Update</h3>
          <p className="text-xs text-gray-400">
            You have successfully tailored and previewed your resume for <strong>{jobTitle}</strong> at <strong>{company}</strong>.
          </p>
          <p className="text-xs text-primary font-medium mt-2">
            Have you already applied for this job?
          </p>
        </div>

        <div className="flex flex-col space-y-2 pt-2">
          <button
            onClick={() => onConfirmApplied(true)}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
          >
            <span>Yes, I have applied!</span>
          </button>
          <button
            onClick={() => onConfirmApplied(false)}
            className="w-full bg-background hover:bg-background/80 text-gray-305 border border-border font-semibold py-2.5 rounded-xl text-xs transition-colors"
          >
            No, save as draft for later
          </button>
        </div>
      </div>
    </div>
  );
}
