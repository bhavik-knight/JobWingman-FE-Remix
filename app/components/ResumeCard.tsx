import React from 'react';
import { Download } from 'lucide-react';
import { API_BASE } from '../services/api';
import type { Application } from '../services/api';

interface ResumeCardProps {
  app: Application;
  onEdit: (id: string) => void;
  resumeFilter: string;
}

export default function ResumeCard({ app, onEdit, resumeFilter }: ResumeCardProps) {
  const resumeName = app.resume?.structuredData?.name || 'Resume';
  const targetTitle = app.jobDescription?.title || 'Unknown Role';
  const targetCompany = app.jobDescription?.company || 'Unknown Company';
  const originFile = app.resume?.filePath ? app.resume.filePath.split('/').pop() : 'Parsed Markdown';
  const updatedAt = app.resume?.updatedAt || app.createdAt;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col space-y-4 hover:border-primary/45 hover:shadow-primary-glow/5 hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden group shadow-lg">
      <div className="absolute top-0 right-0 p-3">
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
          {resumeFilter === 'saved' ? 'Saved' : app.status === 'DRAFT' ? 'Draft' : 'Uploaded'}
        </span>
      </div>
      <div className="space-y-1 pr-16">
        <h3 className="font-bold text-white group-hover:text-primary transition-colors text-base truncate">
          {resumeName}
        </h3>
        <p className="text-xs text-gray-400 truncate">Target: {targetTitle} at {targetCompany}</p>
      </div>

      <div className="flex items-center justify-between border-t border-border/80 pt-4">
        <div className="flex flex-col min-w-0 flex-grow mr-2">
          <span className="text-[10px] text-gray-500 uppercase font-semibold">Origin Path</span>
          <span className="text-xs text-gray-300 font-semibold truncate">
            {originFile}
          </span>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[10px] text-gray-500 uppercase font-semibold">Updated</span>
          <span className="text-xs text-gray-300 font-medium">
            {new Date(updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(app.id)}
          className="flex-1 bg-background border border-border hover:bg-white/5 text-gray-300 hover:text-white font-semibold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
        >
          <span>Edit Resume</span>
        </button>
        <a
          href={`${API_BASE}/api/applications/${app.id}/compile-pdf`}
          target="_blank"
          rel="noreferrer"
          className="px-3 bg-primary hover:bg-primary/90 text-white rounded-xl flex items-center justify-center transition-all hover:scale-105"
        >
          <Download className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
