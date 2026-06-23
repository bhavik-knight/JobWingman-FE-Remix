import React, { useEffect, useState } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { ActionFunctionArgs, json } from '@remix-run/node';
import { useApplications } from '../hooks/useApplications';
import DashboardHeader from '../components/DashboardHeader';
import EvaluationForm from '../components/EvaluationForm';
import PipelineList from '../components/PipelineList';
import AlignmentEditor from '../components/AlignmentEditor';
import PdfPreview from '../components/PdfPreview';
import EmailDraftModal from '../components/EmailDraftModal';
import { Mail, CheckCircle, Clock } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [
    { title: "JobWingman — AI Job Application Assistant" },
    { name: "description", content: "Optimize resume alignment to job descriptions and automate follow-ups." }
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const response = await fetch('http://localhost:5000/api/applications', {
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
    fetchApplications,
    loadApplication,
    handleRunEvaluation,
    handleSaveResume,
    handleCommitSuggestion,
    handleApply,
    gatingError,
    setGatingError
  } = useApplications();

  const [showDraftsModal, setShowDraftsModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <div className="min-h-screen bg-background text-foreground relative p-4 md:p-8 flex flex-col items-center">
      {/* Background radial glow */}
      <div className="glow-bg top-[-100px] left-[-100px]"></div>
      <div className="glow-bg bottom-[-100px] right-[-100px] opacity-40"></div>

      <div className="w-full max-w-7xl flex flex-col flex-grow">
        <DashboardHeader />

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-grow">
          {/* Left Panel: Inputs and List */}
          <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
            {gatingError && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 space-y-3 relative overflow-hidden backdrop-blur-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-amber-400">Match score is too low</h3>
                    <p className="text-[11px] text-gray-400 mt-1">{gatingError.error}</p>
                  </div>
                  <button 
                    onClick={() => setGatingError(null)}
                    className="text-gray-400 hover:text-white text-xs font-semibold px-2 py-0.5 rounded border border-border hover:bg-white/5"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Resume Match Score:</span>
                  <span className="text-sm font-bold text-amber-400">{gatingError.matchScore.toFixed(1)}%</span>
                  <span className="text-[10px] text-gray-500">(Required: {">= 70%"})</span>
                </div>
                {gatingError.suggestions && gatingError.suggestions.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <span className="text-[11px] font-semibold text-white">Suggestions to improve:</span>
                    <ul className="list-disc list-inside space-y-1 text-[10px] text-gray-300">
                      {gatingError.suggestions.map((sug: any, i: number) => (
                        <li key={i} className="leading-relaxed">
                          <strong className="text-amber-400/90">{sug.type}:</strong> {sug.content}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <EvaluationForm 
              loading={loading}
              onSubmit={handleRunEvaluation}
            />

            <PipelineList 
              applications={applications}
              selectedApp={selectedApp}
              onSelect={loadApplication}
            />
          </div>

          {/* Right Panel: Editor and Preview */}
          <div className="lg:col-span-8 h-full">
            {selectedApp ? (
              <div className="space-y-6 h-full flex flex-col">
                {/* Meta details banner */}
                <div className="bg-card border border-border p-4 rounded-2xl flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      {selectedApp.jobDescription?.title}
                    </h2>
                    <p className="text-xs text-gray-400">
                      {selectedApp.jobDescription?.company}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {selectedApp.status === 'APPLIED' && (
                      <button 
                        onClick={() => setShowDraftsModal(true)}
                        className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span>Follow-up Mail & Scheduler</span>
                      </button>
                    )}

                    <div className="flex items-center space-x-1.5 text-xs">
                      <span className="text-gray-500">Status:</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                        selectedApp.status === 'APPLIED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {selectedApp.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Split layout for alignment editor and PDF preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                  <AlignmentEditor 
                    selectedApp={selectedApp}
                    structuredData={structuredData}
                    setStructuredData={setStructuredData}
                    onSave={handleSaveResume}
                    onCommitSuggestion={handleCommitSuggestion}
                    loading={loading}
                  />

                  <PdfPreview 
                    selectedApp={selectedApp}
                    pdfCacheBuster={pdfCacheBuster}
                    onApply={handleApply}
                    loading={loading}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[450px] border border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-card/20 backdrop-blur-sm">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary/10 to-secondary/10 flex items-center justify-center mb-4 border border-primary/20">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">Select an Application</h3>
                <p className="text-xs text-gray-500 max-w-sm">
                  Choose an existing job application from the pipeline list or upload a new resume and job description to align.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {showDraftsModal && selectedApp && (
        <EmailDraftModal 
          selectedApp={selectedApp}
          onClose={() => setShowDraftsModal(false)}
        />
      )}
    </div>
  );
}
