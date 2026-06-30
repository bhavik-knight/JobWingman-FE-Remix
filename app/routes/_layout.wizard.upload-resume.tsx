import React, { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { Upload, FileText, RefreshCw, AlertTriangle, ArrowLeft, Award } from 'lucide-react';
import { useApplications } from '../hooks/useApplications';

const ConsoleStream = () => {
  const [lines, setLines] = useState<string[]>([]);
  useEffect(() => {
    const stream = [
      'SYSTEM: Initializing OCR pipeline...',
      'RAW_DATA: Read PDF stream 0x2A4F',
      'NLP: Segmenting experience paragraphs...',
      'MODEL: Invoking local Llama-3 model...',
      'MODEL: Temperature set to 0.1 for high precision...',
      'ATS: Parsing skill keywords...',
      'MATCH: Cross-referencing "React", "TypeScript", "Node.js"...',
      'ALIGN: Evaluating matching criteria...',
      'GATE: Enforcing ATS gatekeeper threshold...',
      'SYSTEM: Compiling report metadata...'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      setLines((prev) => {
        const next = [...prev, stream[idx % stream.length]];
        if (next.length > 5) next.shift();
        return next;
      });
      idx++;
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-zinc-950/80 rounded-lg p-3 font-mono text-[9px] text-emerald-400/90 border border-emerald-950/50 space-y-1 w-full max-w-sm h-28 overflow-hidden shadow-inner text-left">
      {lines.map((l, i) => (
        <div key={i} className="truncate">
          <span className="text-zinc-650 font-bold">&gt;</span> {l}
        </div>
      ))}
    </div>
  );
};

const stepsList = [
  { name: 'Ingesting Resume File', desc: 'Reading file upload payload and verifying file headers' },
  { name: 'OCR & Text Extraction', desc: 'Converting document to structured Markdown layout text' },
  { name: 'Profile Segment Parsing', desc: 'Structuring contact information, skills, and work history' },
  { name: 'Analyzing Target Requirements', desc: 'Extracting key qualifications and core skills from JD' },
  { name: 'ATS Keyword Semantic Cross-Match', desc: 'Running intersection models for domain terms alignment' },
  { name: 'AI Alignment Evaluation', desc: 'Running Ollama LLM gatekeeper audit to generate alignment rating' },
  { name: 'Synthesizing Actionable Feedback', desc: 'Generating specific resume edits and match improvements' },
];

export default function UploadResume() {
  const navigate = useNavigate();
  const { loading, wizardForm, handleRunEvaluation } = useApplications();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [simulatedStep, setSimulatedStep] = useState(0);
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

  useEffect(() => {
    if (!loading) {
      setSimulatedStep(0);
      return;
    }
    const interval = setInterval(() => {
      setSimulatedStep((prev) => {
        if (prev < stepsList.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2200);
    return () => clearInterval(interval);
  }, [loading]);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-primary/20 rounded-2xl bg-background/40 relative min-h-[420px] overflow-hidden items-stretch">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 animate-pulse pointer-events-none" />

          {/* Left Column: Cyber Scanner Graphic & Live Console Log Stream */}
          <div className="flex flex-col items-center justify-center space-y-6 z-10 border-r border-border/40 pr-0 md:pr-6">
            <div className="relative flex items-center justify-center h-28 w-28">
              {/* Radar Sweep Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/20 animate-spin [animation-duration:15s]" />
              <div className="absolute inset-2 rounded-full border border-dashed border-secondary/30 animate-spin [animation-duration:8s] [animation-direction:reverse]" />
              <div className="absolute inset-4 rounded-full border border-primary/40 animate-pulse" />
              {/* Pulse Scanner line */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-primary/10 to-transparent animate-pulse" />
              {/* Inner Core */}
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/60 shadow-lg shadow-primary-glow">
                <RefreshCw className="h-5 w-5 text-primary animate-spin" />
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm text-white font-bold tracking-wider uppercase">
                AI Alignment Scan Active
              </p>
              <p className="text-xs text-primary/80 animate-pulse">
                Evaluating against target requirements
              </p>
            </div>

            {/* Realtime updating console log stream */}
            <ConsoleStream />
          </div>

          {/* Right Column: Progressive Stepper Timeline */}
          <div className="flex flex-col justify-center space-y-4 z-10 pl-0 md:pl-6 py-4">
            {stepsList.map((step, index) => {
              const isCompleted = simulatedStep > index;
              const isActive = simulatedStep === index;
              const isPending = simulatedStep < index;

              return (
                <div
                  key={index}
                  className={`flex items-start space-x-3 transition-all duration-300 ${
                    isActive ? 'scale-[1.02] translate-x-1' : ''
                  }`}
                >
                  {/* Step status indicator icon */}
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <div className="h-4 w-4 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/30">
                        <svg className="h-2.5 w-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : isActive ? (
                      <div className="h-4 w-4 rounded-full bg-primary/20 border border-primary flex items-center justify-center animate-pulse">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                        <div className="h-1 w-1 rounded-full bg-zinc-700" />
                      </div>
                    )}
                  </div>

                  {/* Step descriptions */}
                  <div className="flex-1 min-w-0 text-left">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isCompleted
                          ? 'text-zinc-400'
                          : isActive
                            ? 'text-white drop-shadow-[0_0_8px_rgba(189,147,249,0.5)]'
                            : 'text-zinc-650'
                      }`}
                    >
                      {step.name}
                    </p>
                    <p
                      className={`text-[10px] truncate ${
                        isCompleted
                          ? 'text-zinc-500 line-through'
                          : isActive
                            ? 'text-primary/90 animate-pulse'
                            : 'text-zinc-700'
                      }`}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-background/50 hover:bg-background transition-all group relative min-h-[420px]">
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
