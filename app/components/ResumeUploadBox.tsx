import React from 'react';
import { FileText } from 'lucide-react';

interface ResumeUploadBoxProps {
  resumeFile: File | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export default function ResumeUploadBox({ resumeFile, onFileUpload, disabled = false }: ResumeUploadBoxProps) {
  return (
    <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-background/50 hover:bg-background transition-all group relative min-h-[420px]">
      <input
        type="file"
        accept=".pdf,.docx,.txt"
        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
        onChange={onFileUpload}
        disabled={disabled}
      />
      <div className="flex flex-col items-center text-center space-y-3 p-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform duration-200">
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
  );
}
