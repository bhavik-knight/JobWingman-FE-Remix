import React, { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { Upload, AlertTriangle, ArrowLeft, Award, RefreshCw } from 'lucide-react';
import { useApplications } from '../hooks/useApplications';
import ResumeAnalysisLoader from '../components/ResumeAnalysisLoader';
import ResumeUploadBox from '../components/ResumeUploadBox';

export default function UploadResumePage() {
  const navigate = useNavigate();
  const { loading, wizardForm, handleRunEvaluation } = useApplications();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [modelProvider, setModelProvider] = useState<'gemini' | 'ollama'>('gemini');

  useEffect(() => {
    const isStep1Complete = !!(
      (wizardForm as any)?.title || wizardForm?.jobTitle || ''
    ).trim() && !!(
      (wizardForm as any)?.company || wizardForm?.company || ''
    ).trim() && !!(
      (wizardForm as any)?.rawText || wizardForm?.jobDescription || ''
    ).trim();

    if (!isStep1Complete) {
      navigate('/wizard/job-details');
    }
  }, [wizardForm, navigate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleEvaluate = async () => {
    if (!resumeFile) {
      alert('Please upload a resume file first.');
      return;
    }
    setEvaluationError(null);
    const newApp = await handleRunEvaluation(
      resumeFile,
      wizardForm.jobTitle,
      wizardForm.company,
      wizardForm.jobDescription,
      wizardForm.jobPostingDate || undefined,
      wizardForm.deadline || undefined,
      wizardForm.jobLink || undefined,
      wizardForm.referralName || undefined,
      wizardForm.referralEmail || undefined,
      modelProvider
    );
    if (newApp) {
      navigate('/wizard/align-score');
    } else {
      setEvaluationError('Evaluation failed. Please try again.');
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Step 2: Upload Resume Ingestion
        </h2>
        <p className="text-xs text-gray-400">Provide your base resume to evaluate against target requirements.</p>
      </div>

      {loading ? (
        <ResumeAnalysisLoader />
      ) : (
        <ResumeUploadBox
          resumeFile={resumeFile}
          onFileUpload={handleFileUpload}
          disabled={loading}
        />
      )}

      {evaluationError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{evaluationError}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <label htmlFor="model-selector" className="text-xs font-semibold text-zinc-300">
            Evaluation Model:
          </label>
          <select
            id="model-selector"
            value={modelProvider}
            onChange={(e) => setModelProvider(e.target.value as 'gemini' | 'ollama')}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 font-medium focus:outline-none focus:border-primary/50 transition-colors"
            disabled={loading}
          >
            <option value="gemini">Google Gemini (Default)</option>
            <option value="ollama">Local Qwen3-Coder (Ollama)</option>
          </select>
        </div>

        <div className="flex justify-between sm:justify-end gap-3 flex-grow sm:flex-grow-0">
          <button
            onClick={() => navigate('/wizard/job-details')}
            className="bg-background hover:bg-background/80 text-gray-300 border border-border font-semibold py-2 px-5 rounded-xl text-xs flex items-center gap-1.5"
            disabled={loading}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>
          <button
            onClick={handleEvaluate}
            disabled={loading || !resumeFile}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-primary-glow"
          >
            {loading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Evaluating resume...</span>
              </>
            ) : (
              <>
                <Award className="h-3.5 w-3.5" />
                <span>Evaluate Resume</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
