import React, { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { Eye, ArrowLeft, Download, Save, CheckCircle } from 'lucide-react';
import { useApplications, API_BASE } from '../hooks/useApplications';
import PdfPreview from '../components/PdfPreview';

export default function PreviewPdf() {
  const navigate = useNavigate();
  const { 
    selectedApp, 
    pdfCacheBuster, 
    setPdfCacheBuster,
    loadApplication,
    handleApply, 
    handleUpdateApplication, 
    loading 
  } = useApplications();
  
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    if (!selectedApp) {
      navigate('/wizard/job-details');
    }
  }, [selectedApp, navigate]);

  if (!selectedApp) return null;

  const handleDownload = async () => {
    // Set downloaded timestamp
    await handleUpdateApplication(selectedApp.id, { downloadedAt: new Date().toISOString() });

    // Open compile URL in new tab to trigger browser download
    const pdfUrl = `${API_BASE}/api/applications/${selectedApp.id}/compile-pdf?cb=${pdfCacheBuster}`;
    window.open(pdfUrl, '_blank');

    // Show the Apply Prompt Modal
    setTimeout(() => {
      setShowApplyModal(true);
    }, 1000);
  };

  const handleAppliedConfirm = async (applied: boolean) => {
    if (applied) {
      // Perform the transition to APPLIED, triggering the background job check
      await handleApply(true);
    } else {
      // Save as DRAFT in the database
      await handleUpdateApplication(selectedApp.id, { status: 'DRAFT' });
    }
    setShowApplyModal(false);
    navigate('/dashboard');
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Step 5: ATS Friendly Resume PDF
          </h2>
          <p className="text-xs text-gray-400">Download your compiled resume PDF and track the application status.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate('/wizard/edit-resume')}
            className="bg-background hover:bg-background/80 text-gray-300 border border-border font-semibold py-2 px-4 rounded-xl text-xs flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Editor</span>
          </button>
          <button
            onClick={handleDownload}
            className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-primary-glow"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={async () => {
              await handleUpdateApplication(selectedApp.id, { status: 'DRAFT' });
              navigate('/dashboard');
            }}
            className="bg-background border border-border hover:bg-white/5 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center gap-1"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Application</span>
          </button>
        </div>
      </div>

      <div className="w-full min-h-[75vh]">
        <PdfPreview
          selectedApp={selectedApp}
          pdfCacheBuster={pdfCacheBuster}
          onApply={handleApply}
          loading={loading}
        />
      </div>

      {/* Post-Download / Save Confirmation Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative overflow-hidden">
            <div className="glow-bg top-[-50px] right-[-50px] opacity-40"></div>

            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30 mx-auto">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-white">Application State Update</h3>
              <p className="text-xs text-gray-400">
                You have successfully tailored and previewed your resume for <strong>{selectedApp.jobDescription?.title}</strong> at <strong>{selectedApp.jobDescription?.company}</strong>.
              </p>
              <p className="text-xs text-primary font-medium mt-2">
                Have you already applied for this job?
              </p>
            </div>

            <div className="flex flex-col space-y-2 pt-2">
              <button
                onClick={() => handleAppliedConfirm(true)}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Yes, I have applied!</span>
              </button>
              <button
                onClick={() => handleAppliedConfirm(false)}
                className="w-full bg-background hover:bg-background/80 text-gray-300 border border-border font-semibold py-2.5 rounded-xl text-xs transition-colors"
              >
                No, save as draft for later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
