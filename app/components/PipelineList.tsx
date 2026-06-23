import React from 'react';
import type { Application } from '../hooks/useApplications';

interface PipelineListProps {
  applications: Application[];
  selectedApp: Application | null;
  onSelect: (id: string) => void;
}

export default function PipelineList({ applications, selectedApp, onSelect }: PipelineListProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3 flex-grow flex flex-col">
      <h2 className="text-sm font-semibold text-white">Application Pipeline</h2>
      <div className="space-y-2 overflow-y-auto max-h-[350px] flex-grow pr-1">
        {applications.map((app) => (
          <div 
            key={app.id}
            onClick={() => onSelect(app.id)}
            className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
              selectedApp && selectedApp.id === app.id 
                ? 'border-primary bg-primary/10' 
                : 'border-border bg-background/30 hover:bg-background/80'
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-white truncate max-w-[140px]">
                {app.jobDescription?.title || 'Untitled'}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                app.status === 'APPLIED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {app.status}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 truncate mt-0.5">
              {app.jobDescription?.company || 'Unknown'}
            </p>
            <div className="flex justify-between items-center mt-2 text-[10px]">
              <span className="text-gray-500">Match score:</span>
              <span className={`font-semibold ${app.matchScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {app.matchScore}%
              </span>
            </div>
          </div>
        ))}
        {applications.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-6">No applications loaded yet.</p>
        )}
      </div>
    </div>
  );
}
