import React from 'react';
import { Mail, Send } from 'lucide-react';

interface EmailWorkspaceProps {
  selectedApp: any;
  emailSubject: string;
  setEmailSubject: (val: string) => void;
  emailBody: string;
  setEmailBody: (val: string) => void;
  onSend: () => void;
}

export default function EmailWorkspace({
  selectedApp,
  emailSubject,
  setEmailSubject,
  emailBody,
  setEmailBody,
  onSend
}: EmailWorkspaceProps) {
  if (!selectedApp) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-zinc-505 text-xs italic p-12 space-y-3">
        <div className="h-16 w-16 rounded-full bg-zinc-950 flex items-center justify-center border border-zinc-800">
          <Mail className="h-8 w-8 text-zinc-500 stroke-[1.5]" />
        </div>
        <span className="text-zinc-400 font-medium mt-2">
          Select an application from the action list to generate its outreach draft.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow space-y-5">
      <div className="border-b border-zinc-800 pb-4">
        <h3 className="text-base font-bold text-zinc-200">
          Generated Email Template Workspace
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Review, edit, and send the computed outreach draft.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-300 block">Subject Line</label>
        <input
          type="text"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 font-medium focus:outline-none focus:border-primary/50 transition-colors"
          value={emailSubject}
          onChange={(e) => setEmailSubject(e.target.value)}
        />
      </div>

      <div className="flex-grow flex flex-col space-y-2">
        <label className="text-xs font-semibold text-zinc-300 block">Message Body</label>
        <textarea
          className="w-full flex-grow bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-300 leading-relaxed resize-none focus:outline-none focus:border-primary/50 transition-colors min-h-[250px]"
          value={emailBody}
          onChange={(e) => setEmailBody(e.target.value)}
        />
      </div>

      <div className="flex justify-end pt-2 border-t border-zinc-800 mt-4">
        <button
          type="button"
          onClick={onSend}
          className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-primary-glow/20 flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          <span>Send Generated Mail 🚀</span>
        </button>
      </div>
    </div>
  );
}
