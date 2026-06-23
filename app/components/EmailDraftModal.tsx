import React, { useState, useEffect } from 'react';
import { Mail, Clock, Send, ToggleLeft, ToggleRight, X, RefreshCw } from 'lucide-react';
import type { Application } from '../hooks/useApplications';

const API_BASE = 'http://localhost:5000';

interface EmailDraftModalProps {
  selectedApp: Application;
  onClose: () => void;
}

export default function EmailDraftModal({ selectedApp, onClose }: EmailDraftModalProps) {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [optInAutoSend, setOptInAutoSend] = useState(selectedApp.optInAutoSend);
  const [loading, setLoading] = useState(false);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/applications/${selectedApp.id}/email-drafts`);
      if (res.ok) {
        setDrafts(await res.json());
      }
    } catch (err) {
      console.error('Failed to load email drafts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [selectedApp.id]);

  const handleToggleAutoSend = async () => {
    const nextVal = !optInAutoSend;
    setOptInAutoSend(nextVal);
    if (drafts.length > 0) {
      try {
        await fetch(`${API_BASE}/api/email-drafts/${drafts[0].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ optInAutoSend: nextVal })
        });
      } catch (err) {
        console.error('Failed to update email opt-in:', err);
      }
    }
  };

  const handleApproveDraft = async (draftId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/email-drafts/${draftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' })
      });
      if (res.ok) {
        await fetchDrafts();
      }
    } catch (err) {
      console.error('Failed to approve email draft:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-xl rounded-2xl p-6 shadow-2xl relative flex flex-col space-y-4 max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-white">Email Drafts & Scheduler</h2>
        </div>

        {/* Auto Send Toggle */}
        <div className="flex justify-between items-center p-3 bg-background/50 border border-border rounded-xl">
          <div>
            <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-secondary" />
              Day-10 Automated Follow-Up
            </h3>
            <p className="text-[10px] text-gray-400">Send approved emails automatically if no response is logged.</p>
          </div>
          <button onClick={handleToggleAutoSend} className="text-primary hover:opacity-90">
            {optInAutoSend ? (
              <ToggleRight className="h-8 w-8 text-primary" />
            ) : (
              <ToggleLeft className="h-8 w-8 text-gray-600" />
            )}
          </button>
        </div>

        {/* Draft List */}
        <div className="flex-grow overflow-y-auto space-y-3 max-h-[300px] pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : drafts.map((draft) => (
            <div key={draft.id} className="p-4 bg-background/30 border border-border rounded-xl space-y-2 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
                  Status: {draft.status}
                </span>
                {draft.status === 'GENERATED' && (
                  <button 
                    onClick={() => handleApproveDraft(draft.id)}
                    className="text-white hover:text-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-500/30 transition-all flex items-center gap-1"
                  >
                    <Send className="h-2.5 w-2.5" /> Approve for Auto-Send
                  </button>
                )}
              </div>
              <h4 className="text-xs font-semibold text-white">Subject: {draft.subject}</h4>
              <p className="text-[10px] text-gray-300 whitespace-pre-wrap bg-background/50 p-2.5 rounded-lg border border-border/50">
                {draft.body}
              </p>
            </div>
          ))}
          {!loading && drafts.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-12">
              No follow-up drafts generated yet. Standard scheduler enqueues a Day-7 task upon marking application as applied.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
