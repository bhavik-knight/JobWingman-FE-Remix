import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Upload,
  Award,
  Edit3,
  Eye,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Calendar,
  Link,
  User,
  Mail,
  FileText,
  AlertTriangle,
  RefreshCw,
  Download,
  Save,
  Check
} from 'lucide-react';
import type { Application, StructuredResume, Suggestion } from '../hooks/useApplications';
import { API_BASE } from '../hooks/useApplications';
import AlignmentEditor from './AlignmentEditor';
import PdfPreview from './PdfPreview';

interface JobApplicationWizardProps {
  selectedApp: Application | null;
  loading: boolean;
  structuredData: StructuredResume | null;
  setStructuredData: React.Dispatch<React.SetStateAction<StructuredResume>>;
  pdfCacheBuster: number;
  setPdfCacheBuster: React.Dispatch<React.SetStateAction<number>>;
  handleRunEvaluation: (
    file: File,
    jobTitle: string,
    company: string,
    jobDescription: string,
    jobPostingDate?: string,
    deadline?: string,
    jobLink?: string,
    referralName?: string,
    referralEmail?: string
  ) => Promise<any>;
  handleSaveResume: () => Promise<void>;
  handleCommitSuggestion: (sug: Suggestion) => Promise<void>;
  handleApply: (bypassGate: boolean) => Promise<boolean>;
  handleUpdateApplication: (id: string, updates: any) => Promise<any>;
  onWizardComplete: () => void;
  onSelectApp: (id: string) => Promise<void>;
}

export default function JobApplicationWizard({
  selectedApp,
  loading,
  structuredData,
  setStructuredData,
  pdfCacheBuster,
  setPdfCacheBuster,
  handleRunEvaluation,
  handleSaveResume,
  handleCommitSuggestion,
  handleApply,
  handleUpdateApplication,
  onWizardComplete,
  onSelectApp
}: JobApplicationWizardProps) {
  // Step State
  const [step, setStep] = useState<number>(1);

  // Form Fields
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobPostingDate, setJobPostingDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [jobLink, setJobLink] = useState('');
  const [referralName, setReferralName] = useState('');
  const [referralEmail, setReferralEmail] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Modal State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState('Parsing resume contents...');

  useEffect(() => {
    if (!loading) return;
    const phrases = [
      'Ingesting resume file...',
      'Extracting profile metadata...',
      'Comparing with job description...',
      'Auditing skills match...',
      'Running AI-alignment check...',
      'Generating suggestions checklist...',
      'Calculating match score...',
    ];
    let idx = 0;
    setLoadingText(phrases[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % phrases.length;
      setLoadingText(phrases[idx]);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  // Sync state if selectedApp changes (e.g. resuming an application)
  useEffect(() => {
    if (selectedApp) {
      setJobTitle(selectedApp.jobDescription?.title || '');
      setCompany(selectedApp.jobDescription?.company || '');
      setJobDescription(selectedApp.jobDescription?.rawText || '');
      setJobPostingDate(
        selectedApp.jobDescription?.postingDate
          ? new Date(selectedApp.jobDescription.postingDate).toISOString().split('T')[0]
          : ''
      );
      setDeadline(
        selectedApp.jobDescription?.deadline
          ? new Date(selectedApp.jobDescription.deadline).toISOString().split('T')[0]
          : ''
      );
      setJobLink(selectedApp.jobDescription?.url || '');
      setReferralName(selectedApp.jobDescription?.referralName || '');
      setReferralEmail(selectedApp.jobDescription?.referralEmail || '');

      // Auto-advance step if we are loading an existing evaluated application
      if (step < 3) {
        setStep(3);
      }
    } else {
      // Clear forms for new wizard
      setJobTitle('');
      setCompany('');
      setJobDescription('');
      setJobPostingDate('');
      setDeadline('');
      setJobLink('');
      setReferralName('');
      setReferralEmail('');
      setResumeFile(null);
      setStep(1);
    }
  }, [selectedApp]);

  // Handle Form Steps
  const validateStep1 = () => {
    if (!jobTitle.trim()) return 'Job Title is required';
    if (!company.trim()) return 'Company Name is required';
    if (!jobDescription.trim()) return 'Job Description is required';
    return null;
  };

  const handleNextStep1 = () => {
    const err = validateStep1();
    if (err) {
      alert(err);
      return;
    }
    setStep(2);
  };

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
      jobTitle,
      company,
      jobDescription,
      jobPostingDate || undefined,
      deadline || undefined,
      jobLink || undefined,
      referralName || undefined,
      referralEmail || undefined
    );
    if (newApp) {
      setStep(3);
    } else {
      setEvaluationError('Evaluation failed. Please try again.');
    }
  };

  const handleAppliedConfirm = async (applied: boolean) => {
    if (!selectedApp) return;
    if (applied) {
      // Perform the transition to APPLIED, triggering the background job check
      await handleApply(true);
    } else {
      // Save as DRAFT in the database
      await handleUpdateApplication(selectedApp.id, { status: 'DRAFT' });
    }
    setShowApplyModal(false);
    onWizardComplete();
  };

  const handleDownload = async () => {
    if (!selectedApp) return;

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

  // Steps UI Renderers
  const renderStepIndicator = () => {
    const steps = [
      { id: 1, label: 'Job Details', icon: Briefcase },
      { id: 2, label: 'Upload Resume', icon: Upload },
      { id: 3, label: 'Align Score', icon: Award },
      { id: 4, label: 'Edit Resume', icon: Edit3 },
      { id: 5, label: 'Preview PDF', icon: Eye },
    ];

    return (
      <div className="w-full bg-card border border-border rounded-2xl p-4 flex justify-between items-center relative overflow-hidden backdrop-blur-md mb-6">
        <div className="flex w-full items-center justify-between z-10">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center space-y-1 flex-1">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-all ${isActive
                        ? 'bg-primary border-primary text-white shadow-md shadow-primary-glow'
                        : isCompleted
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : 'bg-background border-border text-gray-500'
                      }`}
                  >
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className={`text-[10px] font-medium hidden sm:block ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-[1px] flex-grow mx-2 hidden sm:block ${step > s.id ? 'bg-emerald-500/40' : 'bg-border'}`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col h-full space-y-6">
      {renderStepIndicator()}

      <div className="flex-grow">
        {/* STEP 1: Job Details */}
        {step === 1 && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Step 1: Target Job Specification
              </h2>
              <p className="text-xs text-gray-400">Enter the requirements for the job you want to target.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Job Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Company *</label>
                  <input
                    type="text"
                    placeholder="e.g. Google"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Job Description *</label>
                <textarea
                  rows={12}
                  placeholder="Paste the core requirements, skill lists, and roles..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary transition-colors resize-y min-h-[300px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border pt-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-500" />
                    Posting Date
                  </label>
                  <input
                    type="date"
                    value={jobPostingDate}
                    onChange={(e) => setJobPostingDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-500" />
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Link className="h-3.5 w-3.5 text-gray-500" />
                    Job Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://company.com/careers/123"
                    value={jobLink}
                    onChange={(e) => setJobLink(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="bg-background/40 p-4 border border-border rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary" />
                  Referral Contact (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-400">Referral Name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={referralName}
                      onChange={(e) => setReferralName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-400">Referral Email</label>
                    <input
                      type="email"
                      placeholder="jane.doe@company.com"
                      value={referralEmail}
                      onChange={(e) => setReferralEmail(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button
                onClick={handleNextStep1}
                className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-primary-glow"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Resume Upload */}
        {step === 2 && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Step 2: Upload Resume Ingestion
              </h2>
              <p className="text-xs text-gray-400">Provide your base resume to evaluate against target requirements.</p>
            </div>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center border border-primary/20 rounded-2xl bg-background/40 relative min-h-[220px] overflow-hidden space-y-5">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 animate-pulse" />

                {/* Radar/Alignment Scanner Graphic */}
                <div className="relative flex items-center justify-center h-16 w-16">
                  {/* Outer breathing ring */}
                  <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-75" />
                  {/* Middle rotating ring */}
                  <div className="absolute h-12 w-12 rounded-full border border-dashed border-secondary/50 animate-spin" />
                  {/* Inner pulse */}
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary-glow animate-pulse">
                    <RefreshCw className="h-4 w-4 text-white animate-spin [animation-duration:3s]" />
                  </div>
                </div>

                <div className="text-center z-10 space-y-1.5 px-4">
                  <p className="text-xs text-white font-bold tracking-wide">
                    Analyzing Resume Alignment
                  </p>
                  <p className="text-[10px] text-gray-400 max-w-xs mx-auto animate-pulse min-h-[14px]">
                    {loadingText}
                  </p>
                </div>

                {/* Progress bar simulation */}
                <div className="w-48 h-1 bg-border rounded-full overflow-hidden relative">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary absolute top-0 left-0 rounded-full w-full">
                    <div className="shimmer-progress" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-background/50 hover:bg-background transition-all group relative min-h-[220px]">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
                <div className="flex flex-col items-center text-center space-y-3 p-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-white font-semibold">
                      {resumeFile ? resumeFile.name : 'Drag & Drop or Click to Select File'}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">Supports PDF, DOCX, or plain text resumes</p>
                  </div>
                </div>
              </div>
            )}

            {evaluationError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>{evaluationError}</span>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-border">
              <button
                onClick={() => setStep(1)}
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
        )}

        {/* STEP 3: Evaluation Results */}
        {step === 3 && selectedApp && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Step 3: Resume Evaluation Score
                </h2>
                <p className="text-xs text-gray-400">Your layout alignment score generated by Ollama.</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${selectedApp.status === 'APPLIED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                {selectedApp.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Score Indicator */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-background/50 border border-border rounded-2xl relative min-h-[160px]">
                <div className={`relative h-24 w-24 rounded-full border-4 flex flex-col items-center justify-center ${selectedApp.matchScore >= 70 ? 'border-emerald-500/30' : 'border-amber-500/30'
                  }`}>
                  <span className={`text-2xl font-bold ${selectedApp.matchScore >= 70 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                    {selectedApp.matchScore.toFixed(0)}%
                  </span>
                  <span className="text-[9px] text-gray-500">Match score</span>
                </div>
                {selectedApp.gatingFlag && (
                  <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-2">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Gating is active (Score {"< 70%"})</span>
                  </div>
                )}
              </div>

              {/* Analysis Text */}
              <div className="md:col-span-8 space-y-3">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-gray-300">Auditing Summary</h3>
                  <p className="text-xs text-gray-400 leading-relaxed bg-background/20 p-3 rounded-xl border border-border/50">
                    Your resume has been parsed and reviewed. A match score of {selectedApp.matchScore.toFixed(1)}% indicates the keyword alignment. See the recommendations on the next step to optimize details.
                  </p>
                </div>

                <div className="flex gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">Suggestions:</span>
                    <span className="text-white font-bold ml-1">{selectedApp.suggestions?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Job Title:</span>
                    <span className="text-white font-bold ml-1">{selectedApp.jobDescription?.title}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* List of Suggestions */}
            <div className="space-y-2 border-t border-border pt-4">
              <h3 className="text-xs font-bold text-gray-300">Suggested Action Edits ({selectedApp.suggestions?.length || 0})</h3>
              <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                {selectedApp.suggestions?.map((sug) => (
                  <div key={sug.id} className="p-3 bg-background/40 border border-border rounded-xl space-y-1.5 hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${sug.type === 'ADD' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                        }`}>
                        {sug.type}
                      </span>
                      <span className="text-[10px] text-gray-500">Section: {sug.regionId.replace('sec_', '')}</span>
                    </div>
                    <p className="text-xs text-white font-medium">{sug.content}</p>
                    <p className="text-[10px] text-gray-400">{sug.rationale}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button
                onClick={() => setStep(4)}
                className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-primary-glow"
              >
                <span>Continue: Edit Resume</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Structured Resume Editor */}
        {step === 4 && selectedApp && structuredData && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-primary" />
                  Step 4: Tailored Resume Editor
                </h2>
                <p className="text-xs text-gray-400">Edit sections and apply AI suggestions directly before compiling.</p>
              </div>
              <button
                onClick={async () => {
                  await handleSaveResume();
                  setStep(5);
                }}
                className="bg-gradient-to-r from-primary to-secondary text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-primary-glow"
              >
                <span>Preview PDF</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="h-[460px] overflow-hidden">
              <AlignmentEditor
                selectedApp={selectedApp}
                structuredData={structuredData}
                setStructuredData={setStructuredData}
                onSave={async () => {
                  await handleSaveResume();
                  alert('Resume changes saved and compiled successfully.');
                }}
                onCommitSuggestion={handleCommitSuggestion}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* STEP 5: Typst Preview & Action */}
        {step === 5 && selectedApp && (
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
                  onClick={() => setStep(4)}
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
                  onClick={() => setShowApplyModal(true)}
                  className="bg-background border border-border hover:bg-white/5 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center gap-1"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Application</span>
                </button>
              </div>
            </div>

            <div className="h-[480px]">
              <PdfPreview
                selectedApp={selectedApp}
                pdfCacheBuster={pdfCacheBuster}
                onApply={handleApply}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>

      {/* Post-Download / Save Confirmation Modal */}
      {showApplyModal && selectedApp && (
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
