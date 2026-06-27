import React, { useEffect, useState } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { ActionFunctionArgs, json } from '@remix-run/node';
import { useApplications } from '../hooks/useApplications';
import DashboardHeader from '../components/DashboardHeader';
import JobApplicationWizard from '../components/JobApplicationWizard';
import DashboardHistory from '../components/DashboardHistory';
import FollowUpsReminders from '../components/FollowUpsReminders';
import { Sparkles, Briefcase, Bell } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [
    { title: "JobWingman — AI Job Application Assistant" },
    { name: "description", content: "Optimize resume alignment to job descriptions and automate follow-ups." }
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const apiUrl = process.env.INTERNAL_API_URL || 'http://localhost:5000/api/applications';
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    return json(data, { status: response.status });
  } catch (err: any) {
    console.error('Error in Remix Action:', err);
    return json({ error: err.message || 'Gateway communication failure' }, { status: 500 });
  }
}

export default function Index() {
  const {
    applications,
    selectedApp,
    loading,
    structuredData,
    setStructuredData,
    pdfCacheBuster,
    setPdfCacheBuster,
    fetchApplications,
    loadApplication,
    handleRunEvaluation,
    handleSaveResume,
    handleCommitSuggestion,
    handleApply,
    handleUpdateApplication,
    gatingError,
    setGatingError
  } = useApplications();

  const [currentPage, setCurrentPage] = useState<'wizard' | 'dashboard' | 'reminders'>('wizard');

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleResumeApplication = async (app: any) => {
    await loadApplication(app.id);
    setCurrentPage('wizard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative p-4 md:p-8 flex flex-col items-center">
      {/* Background radial glow */}
      <div className="glow-bg top-[-100px] left-[-100px]"></div>
      <div className="glow-bg bottom-[-100px] right-[-100px] opacity-40"></div>

      <div className="w-full max-w-7xl flex flex-col flex-grow">
        <DashboardHeader />

        {/* Top Page Sub-navigation Tabs */}
        <div className="flex bg-card border border-border p-1.5 rounded-2xl mb-8 max-w-md self-center w-full z-10 shadow-lg relative">
          <button
            onClick={() => setCurrentPage('wizard')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentPage === 'wizard' 
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary-glow' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Wizard</span>
          </button>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentPage === 'dashboard' 
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary-glow' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentPage('reminders')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentPage === 'reminders' 
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary-glow' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Follow-ups</span>
          </button>
        </div>

        <main className="w-full z-10 flex-grow">
          {currentPage === 'wizard' && (
            <JobApplicationWizard 
              selectedApp={selectedApp}
              loading={loading}
              structuredData={structuredData}
              setStructuredData={setStructuredData}
              pdfCacheBuster={pdfCacheBuster}
              setPdfCacheBuster={setPdfCacheBuster}
              handleRunEvaluation={handleRunEvaluation}
              handleSaveResume={handleSaveResume}
              handleCommitSuggestion={handleCommitSuggestion}
              handleApply={handleApply}
              handleUpdateApplication={handleUpdateApplication}
              onWizardComplete={() => setCurrentPage('dashboard')}
              onSelectApp={loadApplication}
            />
          )}

          {currentPage === 'dashboard' && (
            <DashboardHistory 
              applications={applications}
              onResumeApplication={handleResumeApplication}
            />
          )}

          {currentPage === 'reminders' && (
            <FollowUpsReminders 
              applications={applications}
              onResumeApplication={handleResumeApplication}
              fetchApplications={fetchApplications}
            />
          )}
        </main>
      </div>
    </div>
  );
}
