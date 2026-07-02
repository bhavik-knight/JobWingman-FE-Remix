import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Application } from '../hooks/useApplications';

interface ApplicationCardProps {
  app: Application;
  onSelect: (id: string) => void;
}

export default function ApplicationCard({ app, onSelect }: ApplicationCardProps) {
  const isApplied = app.status === 'APPLIED';
  const isHighMatch = app.matchScore >= 70;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col space-y-4 hover:border-primary/45 hover:shadow-primary-glow/5 hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden group shadow-lg">
      <div className="absolute top-0 right-0 p-3">
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border transition-colors ${
          isApplied 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        }`}>
          {app.status}
        </span>
      </div>
      <div className="space-y-1 pr-16">
        <h3 className="font-bold text-white group-hover:text-primary transition-colors text-base truncate">
          {app.jobDescription?.title || 'Unknown Role'}
        </h3>
        <p className="text-xs text-gray-400 truncate">{app.jobDescription?.company || 'Unknown Company'}</p>
      </div>

      <div className="flex items-center justify-between border-t border-border/80 pt-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase font-semibold">Match Score</span>
          <span className={`text-base font-extrabold ${isHighMatch ? 'text-emerald-400' : 'text-rose-450'}`}>
            {app.matchScore.toFixed(0)}%
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-gray-500 uppercase font-semibold">Created</span>
          <span className="text-xs text-gray-300 font-medium">
            {new Date(app.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <button
        onClick={() => onSelect(app.id)}
        className="w-full bg-background border border-border hover:bg-white/5 text-gray-300 hover:text-white font-semibold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
      >
        <span>{isApplied ? 'View Details' : 'Resume Setup ⚡'}</span>
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
