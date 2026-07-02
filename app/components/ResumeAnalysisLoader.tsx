import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import ConsoleStream from './ConsoleStream';

const stepsList = [
  { name: 'Ingesting Resume File', desc: 'Reading file upload payload and verifying file headers' },
  { name: 'OCR & Text Extraction', desc: 'Converting document to structured Markdown layout text' },
  { name: 'Profile Segment Parsing', desc: 'Structuring contact information, skills, and work history' },
  { name: 'Analyzing Target Requirements', desc: 'Extracting key qualifications and core skills from JD' },
  { name: 'ATS Keyword Semantic Cross-Match', desc: 'Running intersection models for domain terms alignment' },
  { name: 'AI Alignment Evaluation', desc: 'Running Ollama LLM gatekeeper audit to generate alignment rating' },
  { name: 'Synthesizing Actionable Feedback', desc: 'Generating specific resume edits and match improvements' },
];

export default function ResumeAnalysisLoader() {
  const [simulatedStep, setSimulatedStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedStep((prev) => {
        if (prev < stepsList.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
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
  );
}
