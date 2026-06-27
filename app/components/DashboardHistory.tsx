import React, { useState } from 'react';
import { 
  Briefcase, 
  Award, 
  Calendar, 
  Link, 
  ArrowRight, 
  FileText,
  Clock,
  Sparkles,
  Inbox
} from 'lucide-react';
import type { Application } from '../hooks/useApplications';

interface DashboardHistoryProps {
  applications: Application[];
  onResumeApplication: (app: Application) => void;
}

export default function DashboardHistory({ 
  applications, 
  onResumeApplication 
}: DashboardHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'draft' | 'applied'>('all');

  const filteredApps = applications.filter((app) => {
    if (filter === 'draft') return app.status === 'DRAFT';
    if (filter === 'applied') return app.status === 'APPLIED';
    return true;
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Page 2: Applications & Resumes Dashboard
          </h2>
          <p className="text-xs text-gray-400">Track and manage your existing resume tailoring applications.</p>
        </div>

        {/* Filter Controls */}
        <div className="flex bg-background border border-border p-1 rounded-xl text-xs">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'all' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({applications.length})
          </button>
          <button 
            onClick={() => setFilter('draft')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'draft' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Drafts ({applications.filter(a => a.status === 'DRAFT').length})
          </button>
          <button 
            onClick={() => setFilter('applied')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'applied' ? 'bg-primary text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Applied ({applications.filter(a => a.status === 'APPLIED').length})
          </button>
        </div>
      </div>

      {/* Grid List of Applications */}
      {filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => {
            const hasReferral = !!app.jobDescription?.referralName;
            const hasDeadline = !!app.jobDescription?.deadline;
            const deadlineDate = hasDeadline ? new Date(app.jobDescription.deadline!) : null;
            const formattedDeadline = deadlineDate ? deadlineDate.toLocaleDateString() : '';

            return (
              <div 
                key={app.id} 
                className="bg-background border border-border rounded-xl p-4 flex flex-col space-y-4 hover:border-primary/40 hover:shadow-lg transition-all relative overflow-hidden group"
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                <div className="flex justify-between items-start z-10">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
                      {app.jobDescription?.title}
                    </h3>
                    <p className="text-[10px] text-gray-400 line-clamp-1">{app.jobDescription?.company}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[8px] ${
                    app.status === 'APPLIED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {app.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 border-t border-b border-border/50 py-2.5 z-10">
                  <div className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-primary/70" />
                    <span className="font-semibold text-white">{app.matchScore.toFixed(0)}% Match</span>
                  </div>
                  {hasDeadline && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-500" />
                      <span className="truncate">{formattedDeadline}</span>
                    </div>
                  )}
                  {hasReferral && (
                    <div className="flex items-center gap-1 col-span-2 mt-1">
                      <Clock className="h-3.5 w-3.5 text-gray-500" />
                      <span className="truncate">Referral: {app.jobDescription.referralName}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2 z-10">
                  {app.status === 'DRAFT' ? (
                    <button 
                      onClick={() => onResumeApplication(app)}
                      className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 py-1.5 px-3 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Resume Application</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => onResumeApplication(app)}
                      className="bg-background border border-border hover:bg-white/5 text-gray-300 py-1.5 px-3 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <FileText className="h-3 w-3" />
                      <span>View details / pdf</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center bg-background/20">
          <div className="h-10 w-10 rounded-xl bg-gray-500/10 flex items-center justify-center mb-3">
            <Inbox className="h-5 w-5 text-gray-500" />
          </div>
          <h3 className="text-xs font-bold text-white mb-1">No applications found</h3>
          <p className="text-[10px] text-gray-500 max-w-xs">
            Start the Job Application Wizard to evaluate and optimize your first resume!
          </p>
        </div>
      )}
    </div>
  );
}
