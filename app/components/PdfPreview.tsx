import React from 'react';
import { Eye, FileText, Download, Lock } from 'lucide-react';
import type { Application } from '../hooks/useApplications';

interface PdfPreviewProps {
  selectedApp: Application;
  pdfCacheBuster: number;
  onApply: (bypassGate: boolean) => Promise<boolean>;
  loading: boolean;
}

export default function PdfPreview({
  selectedApp,
  pdfCacheBuster,
  onApply,
  loading
}: PdfPreviewProps) {
  const pdfUrl = `http://localhost:5000/api/applications/${selectedApp.id}/compile-pdf?cb=${pdfCacheBuster}`;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          Live PDF Preview
        </h2>
        <a 
          href={pdfUrl} 
          download 
          className="text-white hover:text-primary transition-colors flex items-center gap-1 text-xs"
        >
          <Download className="h-3.5 w-3.5" /> Download
        </a>
      </div>

      <div className="flex-grow bg-background/50 border border-border rounded-xl overflow-hidden min-h-[300px] relative">
        <iframe 
          src={pdfUrl}
          className="w-full h-full"
          title="Typst PDF compilation preview"
          style={{ border: 'none' }}
        />
      </div>

      <div className="border-t border-border pt-4 mt-auto flex space-x-3">
        {selectedApp.gatingFlag ? (
          <>
            <button 
              onClick={() => onApply(false)}
              disabled={loading}
              className="flex-grow bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold py-2 rounded-xl text-xs border border-rose-500/30 transition-all flex items-center justify-center space-x-1.5"
            >
              <Lock className="h-3.5 w-3.5 text-rose-400" />
              <span>Apply (Score Gated)</span>
            </button>
            <button 
              onClick={() => onApply(true)}
              disabled={loading}
              className="px-4 bg-background hover:bg-background/80 text-gray-300 border border-border font-semibold py-2 rounded-xl text-xs transition-colors"
            >
              Bypass Gate
            </button>
          </>
        ) : (
          <button 
            onClick={() => onApply(false)}
            disabled={loading || selectedApp.status === 'APPLIED'}
            className="flex-grow bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 disabled:opacity-50 text-white font-semibold py-2 rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-1.5"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{selectedApp.status === 'APPLIED' ? 'Submitted' : 'Submit & Apply'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
