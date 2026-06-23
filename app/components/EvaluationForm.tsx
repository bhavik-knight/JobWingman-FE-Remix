import React, { useState } from 'react';
import { Upload, FileText, Play, RefreshCw } from 'lucide-react';

interface EvaluationFormProps {
  loading: boolean;
  onSubmit: (file: File, jobTitle: string, company: string, jobDescription: string) => Promise<boolean>;
}

export default function EvaluationForm({ loading, onSubmit }: EvaluationFormProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      alert('Please upload a resume PDF/DOCX file.');
      return;
    }
    if (!jobDescription) {
      alert('Please enter a job description.');
      return;
    }
    const success = await onSubmit(resumeFile, jobTitle, company, jobDescription);
    if (success) {
      setJobTitle('');
      setCompany('');
      setJobDescription('');
      setResumeFile(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
        <Upload className="h-4 w-4 text-primary" />
        New Evaluation
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input 
            type="text" 
            placeholder="Job Title"
            value={jobTitle} 
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <input 
            type="text" 
            placeholder="Company"
            value={company} 
            onChange={(e) => setCompany(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <textarea 
            rows={3}
            placeholder="Job description details..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>
        <div>
          <label className="flex flex-col items-center justify-center border border-dashed border-border hover:border-primary/50 rounded-lg py-4 cursor-pointer bg-background/50 hover:bg-background transition-all group">
            <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFileUpload} />
            <FileText className="h-5 w-5 text-gray-500 group-hover:text-primary mb-1 transition-colors" />
            <span className="text-[10px] text-gray-300 font-medium">
              {resumeFile ? resumeFile.name : "Select Resume file"}
            </span>
          </label>
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-xs transition-all shadow-md shadow-primary-glow flex items-center justify-center space-x-1"
        >
          {loading ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Play className="h-3 w-3" />
              <span>Run Match Evaluation</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
