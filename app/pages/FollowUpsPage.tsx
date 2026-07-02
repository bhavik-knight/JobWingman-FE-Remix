import React, { useEffect, useState } from 'react';
import { useApplications } from '../hooks/useApplications';
import { Mail, Inbox } from 'lucide-react';
import { apiService } from '../services/api';
import FollowUpListItem from '../components/FollowUpListItem';
import EmailWorkspace from '../components/EmailWorkspace';

export default function FollowUpsPage() {
  const { handleSendEmail } = useApplications();
  const [apps, setApps] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getFollowUps()
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
              <FollowUpListItem
                key={app.id}
                app={app}
                isSelected={selectedApp?.id === app.id}
                onSelect={() => handleSelectApp(app)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Column: Dynamic Email Template Generation Canvas */}
      <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between min-h-[480px] shadow-xl shadow-black/40">
        <EmailWorkspace
          selectedApp={selectedApp}
          emailSubject={emailSubject}
          setEmailSubject={setEmailSubject}
          emailBody={emailBody}
          setEmailBody={setEmailBody}
          onSend={() =>
            handleSendEmail(selectedApp.id, 'receiver@example.com', emailSubject, emailBody)
          }
        />
      </div>
    </div>
  );
}
