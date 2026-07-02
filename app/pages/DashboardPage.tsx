import React, { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { useApplications } from '../hooks/useApplications';
import { Briefcase, FileText } from 'lucide-react';
import ApplicationCard from '../components/ApplicationCard';
import ResumeCard from '../components/ResumeCard';

export default function DashboardPage() {
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
            <ApplicationCard 
              key={app.id} 
              app={app} 
              onSelect={handleResumeWizard} 
            />
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
            <ResumeCard 
              key={app.id} 
              app={app} 
              onEdit={handleResumeWizard} 
              resumeFilter={resumeFilter} 
            />
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
