import React, { useEffect, useState } from 'react';
import { useApplications } from '../hooks/useApplications';
import { Mail, Clock, Send, AlertTriangle, ChevronRight, Inbox } from 'lucide-react';

export default function FollowUpsRoute() {
  const { handleSendEmail } = useApplications();
  const [apps, setApps] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/applications/follow-ups')
      .then(res => res.json())
      .then(res => { 
        if (res.success && res.data.length > 0) {
          setApps(res.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectApp = (app: any) => {
    setSelectedApp(app);
    if (app.status === 'APPLIED') {
      setEmailSubject(`Following Up: Application Inquiry - ${app.title}`);
      setEmailBody(`Hi Hiring Team at ${app.company},\n\nI hope you are having a productive week.\n\nI am writing to briefly follow up on the application I submitted last week for the ${app.title} role. I remain incredibly enthusiastic about your team's mission and wanted to check if you have an updated timeline for the next steps in the review process.\n\nThank you for your time!\n\nBest regards,\nBhavik Bhagat`);
    } else {
      setEmailSubject(`Urgent Submission: ${app.title}`);
      setEmailBody(`Dear ${app.company} Recruiting Team,\n\nI am reaching out to finalize my application for the ${app.title} position ahead of tonight's deadline.\n\nPlease find my updated materials attached.\n\nBest profile regards,\nBhavik Bhagat`);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-6">
        <div className="flex items-center justify-center p-12 text-zinc-400 gap-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <div className="loading loading-spinner text-primary h-6 w-6"></div>
          <span className="text-sm font-medium">Loading scheduled pipeline metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[80vh]">
      {/* Left Column: Action Required Sidebar List */}
      <div className="lg:col-span-4 space-y-4 flex flex-col">
        <div className="space-y-1">
          <h2 className="text-lg font-extrabold text-zinc-100 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Action Required
          </h2>
          <p className="text-xs text-zinc-400">
            Select an application to generate its email workflow:
          </p>
        </div>

        <div className="space-y-3 flex-grow overflow-y-auto max-h-[70vh] pr-1">
          {apps.length === 0 ? (
            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-center space-y-3 flex flex-col items-center">
              <Inbox className="h-8 w-8 text-zinc-500" />
              <span className="text-xs text-zinc-500 italic">No applications requiring immediate follow-up.</span>
            </div>
          ) : (
            apps.map(app => (
              <button
                key={app.id}
                type="button"
                onClick={() => handleSelectApp(app)}
                className={`w-full text-left p-4 border rounded-2xl transition-all duration-200 flex flex-col gap-2 hover:border-zinc-700 hover:shadow-lg ${
                  selectedApp?.id === app.id
                    ? 'bg-primary/10 border-primary shadow-md shadow-primary-glow/10'
                    : 'bg-zinc-900 border-zinc-800'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      app.status === 'APPLIED'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {app.status === 'APPLIED' ? 'Applied 7d Ago' : 'Deadline Today'}
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">{app.company}</span>
                </div>
                <div className="flex justify-between items-center mt-1 w-full gap-2">
                  <h4 className="text-sm font-bold text-zinc-200 truncate">{app.title}</h4>
                  <ChevronRight
                    className={`h-4 w-4 text-zinc-500 flex-shrink-0 transition-transform ${
                      selectedApp?.id === app.id ? 'translate-x-1 text-primary' : ''
                    }`}
                  />
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Dynamic Email Template Generation Canvas */}
      <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between min-h-[480px] shadow-xl shadow-black/40">
        {selectedApp ? (
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
                onClick={() =>
                  handleSendEmail(selectedApp.id, 'receiver@example.com', emailSubject, emailBody)
                }
                className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-primary-glow/20 flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>Send Generated Mail 🚀</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-zinc-500 text-xs italic p-12 space-y-3">
            <div className="h-16 w-16 rounded-full bg-zinc-950 flex items-center justify-center border border-zinc-800">
              <Mail className="h-8 w-8 text-zinc-500 stroke-[1.5]" />
            </div>
            <span className="text-zinc-400 font-medium mt-2">
              Select an application from the action list to generate its outreach draft.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
