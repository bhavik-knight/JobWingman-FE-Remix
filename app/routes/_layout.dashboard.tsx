import React, { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { useApplications, API_BASE } from '../hooks/useApplications';
import { Briefcase, FileText, ArrowRight, Download } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { applications, fetchApplications, loadApplication } = useApplications();
  
  const [activeTab, setActiveTab] = useState<'apps' | 'resumes'>('apps');
  const [appFilter, setAppFilter] = useState<'all' | 'draft' | 'applied'>('all');
  const [resumeFilter, setResumeFilter] = useState<'uploaded' | 'draft' | 'saved'>('uploaded');

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleResumeWizard = async (appId: string) => {
    await loadApplication(appId);
    navigate('/wizard/job-details');
  };

  const filteredApps = applications.filter(app => {
    if (appFilter === 'draft') return app.status === 'DRAFT';
    if (appFilter === 'applied') return app.status === 'APPLIED';
    return true;
  });

  const filteredResumes = applications.filter(app => {
    if (!app.resume) return false;
    if (resumeFilter === 'draft') return app.status === 'DRAFT';
    if (resumeFilter === 'saved') return !!app.downloadedAt;
    // 'uploaded' includes all resumes parsed
    return true;
  });

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Dashboard</h2>
          <p className="text-xs text-gray-400">Manage and track your tailored job alignment profiles.</p>
        </div>
      </div>

      {/* Master Tabs */}
      <div className="flex border-b border-border text-sm gap-6 pb-3">
        <button
          onClick={() => setActiveTab('apps')}
          className={`font-semibold pb-2 transition-all flex items-center gap-2 ${
            activeTab === 'apps' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Applications ({applications.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('resumes')}
          className={`font-semibold pb-2 transition-all flex items-center gap-2 ${
            activeTab === 'resumes' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Resumes ({applications.filter(a => a.resume).length})</span>
        </button>
      </div>

      {/* Filter Options */}
      {activeTab === 'apps' && (
        <div className="flex gap-2">
          {(['all', 'draft', 'applied'] as const).map(f => (
            <button
              key={f}
              onClick={() => setAppFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                appFilter === f 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-card text-gray-400 border border-border hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'resumes' && (
        <div className="flex gap-2">
          {(['uploaded', 'draft', 'saved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setResumeFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                resumeFilter === f 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-card text-gray-400 border border-border hover:text-white'
              }`}
            >
              {f === 'saved' ? 'Saved/Downloaded' : f}
            </button>
          ))}
        </div>
      )}

      {/* Grid view */}
      {activeTab === 'apps' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map(app => (
            <div key={app.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col space-y-4 hover:border-primary/40 transition-all relative overflow-hidden group shadow-lg">
              <div className="absolute top-0 right-0 p-3">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                  app.status === 'APPLIED' 
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

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Match Score</span>
                  <span className={`text-base font-extrabold ${app.matchScore >= 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
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
                onClick={() => handleResumeWizard(app.id)}
                className="w-full bg-background border border-border hover:bg-white/5 text-gray-300 hover:text-white font-semibold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <span>{app.status === 'APPLIED' ? 'View Details' : 'Resume Setup ⚡'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {filteredApps.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 text-xs bg-card border border-border rounded-2xl">
              No applications found matching the selected state filter.
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map(app => (
            <div key={app.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col space-y-4 hover:border-primary/40 transition-all relative overflow-hidden group shadow-lg">
              <div className="absolute top-0 right-0 p-3">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
                  {resumeFilter === 'saved' ? 'Saved' : app.status === 'DRAFT' ? 'Draft' : 'Uploaded'}
                </span>
              </div>
              <div className="space-y-1 pr-16">
                <h3 className="font-bold text-white group-hover:text-primary transition-colors text-base truncate">
                  {app.resume?.structuredData?.name || 'Resume'}
                </h3>
                <p className="text-xs text-gray-400 truncate">Target: {app.jobDescription?.title} at {app.jobDescription?.company}</p>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Origin Path</span>
                  <span className="text-xs text-gray-300 font-semibold truncate max-w-[120px]">
                    {app.resume?.filePath ? app.resume.filePath.split('/').pop() : 'Parsed Markdown'}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Updated</span>
                  <span className="text-xs text-gray-300 font-medium">
                    {new Date(app.resume?.updatedAt || app.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleResumeWizard(app.id)}
                  className="flex-1 bg-background border border-border hover:bg-white/5 text-gray-300 hover:text-white font-semibold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>Edit Resume</span>
                </button>
                <a
                  href={`${API_BASE}/api/applications/${app.id}/compile-pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 bg-primary hover:bg-primary/90 text-white rounded-xl flex items-center justify-center transition"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
          {filteredResumes.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 text-xs bg-card border border-border rounded-2xl">
              No resumes found matching the selected category filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
