import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  AlertTriangle, 
  Send, 
  ArrowRight, 
  Calendar, 
  User, 
  Check, 
  Loader2,
  Sparkles
} from 'lucide-react';
import type { Application } from '../hooks/useApplications';
import { API_BASE } from '../hooks/useApplications';

interface FollowUpsRemindersProps {
  applications: Application[];
  onResumeApplication: (app: Application) => void;
  fetchApplications: () => Promise<any>;
}

export default function FollowUpsReminders({ 
  applications, 
  onResumeApplication,
  fetchApplications
}: FollowUpsRemindersProps) {
  const [sendingDraftId, setSendingDraftId] = useState<string | null>(null);
  const [sentDraftIds, setSentDraftIds] = useState<Record<string, boolean>>({});
  const [editingDraft, setEditingDraft] = useState<{ id: string; subject: string; body: string; toEmail: string } | null>(null);

  // 1. Follow-up Reminders: Applied applications with generated follow-up email drafts
  const followUpItems = applications.filter((app) => {
    // Show follow-up notifications if application is APPLIED and has generated email drafts
    return app.status === 'APPLIED' && app.emailDrafts && app.emailDrafts.length > 0;
  });

  // 2. Urgent Apply Reminders: Draft applications with deadlines approaching (<= 2 days) or already passed
  const deadlineItems = applications.filter((app) => {
    if (app.status !== 'DRAFT' || !app.jobDescription?.deadline) return false;
    const deadlineTime = new Date(app.jobDescription.deadline).getTime();
    const now = new Date().getTime();
    const diffDays = (deadlineTime - now) / (1000 * 60 * 60 * 24);
    return diffDays <= 2; // Approaching in 2 days or already passed
  });

  const handleSendEmail = async (draftId: string, applicationId: string) => {
    setSendingDraftId(draftId);
    try {
      // Mock API call to send email via SendGrid/SMTP
      // In the real system, you'd trigger a backend endpoint, or update draft status in DB to SENT
      const res = await fetch(`${API_BASE}/api/applications/${applicationId}/email-drafts`);
      if (res.ok) {
        // Simulate SMTP send latency
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Mark as sent in state
        setSentDraftIds(prev => ({ ...prev, [draftId]: true }));
        setEditingDraft(null);
        alert('Email sent successfully! (Simulated SendGrid delivery)');
        await fetchApplications();
      }
    } catch (err) {
      console.error('Error sending email:', err);
      alert('Failed to send email.');
    } finally {
      setSendingDraftId(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Page 3: Follow-ups & Deadlines
        </h2>
        <p className="text-xs text-gray-400">Receive alerts on pending applications and review AI follow-up drafts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Follow-up Drafts */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-300 flex items-center gap-1.5 border-b border-border pb-2">
            <Mail className="h-4 w-4 text-emerald-400" />
            7-Day Follow-up Drafts ({followUpItems.length})
          </h3>

          <div className="space-y-3">
            {followUpItems.map((app) => {
              const draft = app.emailDrafts.find(d => d.status === 'GENERATED' || d.status === 'EDITED') || app.emailDrafts[0];
              if (!draft) return null;
              
              const isSent = sentDraftIds[draft.id] || draft.status === 'SENT';
              const referralName = app.jobDescription?.referralName;
              const referralEmail = app.jobDescription?.referralEmail;

              return (
                <div key={app.id} className="bg-background border border-border rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        Follow-up: {app.jobDescription?.title}
                      </h4>
                      <p className="text-[10px] text-gray-400">{app.jobDescription?.company}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[8px] ${
                      isSent ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-primary'
                    }`}>
                      {isSent ? 'Sent' : 'Draft Ready'}
                    </span>
                  </div>

                  <div className="text-[10px] text-gray-400 space-y-1 bg-card/40 p-2 rounded border border-border/50">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-gray-500" />
                      <span>
                        Recipient: {referralName ? `${referralName} (${referralEmail || 'No Email'})` : 'Hiring Manager'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-500" />
                      <span>Applied date: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>

                  {!isSent ? (
                    <div className="flex justify-end gap-2 pt-1">
                      <button 
                        onClick={() => setEditingDraft({
                          id: draft.id,
                          subject: draft.subject,
                          body: draft.body,
                          toEmail: referralEmail || 'hiring@company.com'
                        })}
                        className="bg-background border border-border hover:bg-white/5 text-gray-300 py-1.5 px-3 rounded-lg text-[10px] font-semibold transition-colors"
                      >
                        Edit Draft
                      </button>
                      <button 
                        onClick={() => handleSendEmail(draft.id, app.id)}
                        disabled={sendingDraftId === draft.id}
                        className="bg-primary hover:bg-primary/90 text-white py-1.5 px-3 rounded-lg text-[10px] font-semibold flex items-center gap-1 shadow transition-colors"
                      >
                        {sendingDraftId === draft.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                        <span>Send follow-up</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold pt-1">
                      <Check className="h-3.5 w-3.5" />
                      <span>Follow-up sent successfully</span>
                    </div>
                  )}
                </div>
              );
            })}

            {followUpItems.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-8">
                No active follow-up drafts. (Reminder: Drafts are automatically generated 30 seconds after marking an application as Applied).
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Deadlines */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-300 flex items-center gap-1.5 border-b border-border pb-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Deadline & Apply Warnings ({deadlineItems.length})
          </h3>

          <div className="space-y-3">
            {deadlineItems.map((app) => {
              const deadlineDate = new Date(app.jobDescription.deadline!);
              const isPast = deadlineDate.getTime() < new Date().getTime();
              
              return (
                <div key={app.id} className="bg-background border border-border rounded-xl p-4 space-y-3 border-l-4 border-l-amber-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {app.jobDescription?.title}
                      </h4>
                      <p className="text-[10px] text-gray-400">{app.jobDescription?.company}</p>
                    </div>
                    <span className="text-[9px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                      {isPast ? 'Deadline Passed' : 'Approaching'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Calendar className="h-3.5 w-3.5 text-gray-500" />
                    <span>Deadline: {deadlineDate.toLocaleDateString()}</span>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button 
                      onClick={() => onResumeApplication(app)}
                      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 py-1.5 px-3 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Resume Application</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {deadlineItems.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-8">
                No approaching application deadlines.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Email Edit Modal Overlay */}
      {editingDraft && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-primary" />
              Edit Follow-up Email Template
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-medium">To Email</label>
                <input 
                  type="email"
                  value={editingDraft.toEmail}
                  onChange={(e) => setEditingDraft(prev => prev ? { ...prev, toEmail: e.target.value } : null)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-medium">Subject</label>
                <input 
                  type="text"
                  value={editingDraft.subject}
                  onChange={(e) => setEditingDraft(prev => prev ? { ...prev, subject: e.target.value } : null)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-medium">Email Content</label>
                <textarea 
                  rows={8}
                  value={editingDraft.body}
                  onChange={(e) => setEditingDraft(prev => prev ? { ...prev, body: e.target.value } : null)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary resize-none font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setEditingDraft(null)}
                className="bg-background border border-border hover:bg-white/5 text-gray-300 py-1.5 px-4 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  const draftApp = applications.find(a => a.emailDrafts.some(d => d.id === editingDraft.id));
                  if (draftApp) {
                    handleSendEmail(editingDraft.id, draftApp.id);
                  }
                }}
                className="bg-primary hover:bg-primary/95 text-white py-1.5 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow shadow-primary-glow"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send (via SendGrid)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
