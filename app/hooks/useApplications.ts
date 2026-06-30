import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  setApplications,
  setSelectedApp,
  setLoading,
  setPdfCacheBuster,
  setStructuredData,
  setGatingError,
  setWizardForm,
  setResumeFile,
} from '../store';

export const API_BASE = 'http://localhost:5000';

export interface Suggestion {
  id: string;
  regionId: string;
  regionText: string;
  type: 'ADD' | 'EXPAND' | 'CLARIFY';
  content: string;
  rationale: string;
  resolved: boolean;
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string[];
}

export interface Education {
  school: string;
  degree?: string;
  year?: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ProjectItem {
  title: string;
  context?: string;
  bullets: string[];
}

export interface StructuredResume {
  name: string;
  email: string;
  phone: string;
  summary: string[];
  skills: SkillCategory[];
  experience: Experience[];
  education: Education[];
  volunteer: Experience[];
  projects: ProjectItem[];
}

export interface Application {
  id: string;
  createdAt: string;
  status: 'DRAFT' | 'APPLIED';
  matchScore: number;
  gatingFlag: boolean;
  optInAutoSend: boolean;
  resume?: {
    id: string;
    filePath: string;
    parsedText: string;
    structuredData: StructuredResume;
  };
  jobDescription?: {
    title: string;
    company: string;
    rawText: string;
    postingDate?: string;
    deadline?: string;
    url?: string;
    referralName?: string;
    referralEmail?: string;
  };
  suggestions?: Suggestion[];
}

export function useApplications() {
  const dispatch = useDispatch();
  const {
    applications,
    selectedApp,
    loading,
    pdfCacheBuster,
    structuredData,
    gatingError,
    wizardForm,
    resumeFileBase64,
    resumeFileName
  } = useSelector((state: RootState) => state.app);

  const setStructuredDataLocal = useCallback((data: StructuredResume | ((prev: StructuredResume) => StructuredResume)) => {
    if (typeof data === 'function') {
      dispatch(setStructuredData(data(structuredData)));
    } else {
      dispatch(setStructuredData(data));
    }
  }, [dispatch, structuredData]);

  const setPdfCacheBusterLocal = useCallback((val: number | ((prev: number) => number)) => {
    if (typeof val === 'function') {
      dispatch(setPdfCacheBuster(val(pdfCacheBuster)));
    } else {
      dispatch(setPdfCacheBuster(val));
    }
  }, [dispatch, pdfCacheBuster]);

  const setGatingErrorLocal = useCallback((val: any) => {
    dispatch(setGatingError(val));
  }, [dispatch]);

  const setWizardFormLocal = useCallback((val: any) => {
    dispatch(setWizardForm(val));
  }, [dispatch]);

  const setResumeFileLocal = useCallback((val: any) => {
    dispatch(setResumeFile(val));
  }, [dispatch]);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/applications`);
      if (res.ok) {
        const data = await res.json();
        dispatch(setApplications(data));
        return data;
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
    return [];
  }, [dispatch]);

  const loadApplication = useCallback(async (id: string) => {
    dispatch(setLoading(true));
    try {
      const res = await fetch(`${API_BASE}/api/applications/${id}`);
      if (res.ok) {
        const app = await res.json();
        dispatch(setSelectedApp(app));
        if (app.resume && app.resume.structuredData) {
          const sd = app.resume.structuredData;
          dispatch(setStructuredData({
            name: sd.name || '',
            email: sd.email || '',
            phone: sd.phone || '',
            summary: Array.isArray(sd.summary) ? sd.summary : (sd.summary ? [sd.summary] : []),
            skills: Array.isArray(sd.skills) ? (
              sd.skills.length > 0 && typeof sd.skills[0] === 'object'
                ? sd.skills
                : [{ category: 'Technical Skills', items: sd.skills }]
            ) : [],
            experience: (sd.experience || []).map((exp: any) => ({
              company: exp.company || '',
              role: exp.role || '',
              duration: exp.duration || '',
              description: Array.isArray(exp.description) ? exp.description : (exp.description ? [exp.description] : [])
            })),
            education: sd.education || [],
            volunteer: (sd.volunteer || []).map((vol: any) => ({
              company: vol.company || '',
              role: vol.role || '',
              duration: vol.duration || '',
              description: Array.isArray(vol.description) ? vol.description : (vol.description ? [vol.description] : [])
            })),
            projects: (sd.projects || []).map((proj: any) => ({
              title: proj.title || '',
              context: proj.context || '',
              bullets: Array.isArray(proj.bullets) ? proj.bullets : (proj.bullets ? [proj.bullets] : [])
            }))
          }));
        }
        dispatch(setPdfCacheBuster(Date.now()));
        
        // Auto populate wizard form from selected app
        dispatch(setWizardForm({
          jobTitle: app.jobDescription?.title || '',
          company: app.jobDescription?.company || '',
          jobDescription: app.jobDescription?.rawText || '',
          jobPostingDate: app.jobDescription?.postingDate ? new Date(app.jobDescription.postingDate).toISOString().split('T')[0] : '',
          deadline: app.jobDescription?.deadline ? new Date(app.jobDescription.deadline).toISOString().split('T')[0] : '',
          jobLink: app.jobDescription?.url || '',
          referralName: app.jobDescription?.referralName || '',
          referralEmail: app.jobDescription?.referralEmail || ''
        }));
      }
    } catch (err) {
      console.error('Failed to load application details:', err);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const handleRunEvaluation = async (
    file: File,
    jobTitle?: string,
    company?: string,
    jobDescription?: string,
    jobPostingDate?: string,
    deadline?: string,
    jobLink?: string,
    referralName?: string,
    referralEmail?: string
  ) => {
    dispatch(setLoading(true));
    dispatch(setGatingError(null));
    const formData = new FormData();
    formData.append('resume', file);

    const finalTitle = jobTitle || (wizardForm as any).title || (wizardForm as any).jobTitle || 'Position';
    const finalCompany = company || (wizardForm as any).company || 'Company';
    const finalDesc = jobDescription || (wizardForm as any).rawText || (wizardForm as any).jobDescription || '';
    const finalPostingDate = jobPostingDate || (wizardForm as any).postingDate || (wizardForm as any).jobPostingDate || '';
    const finalDeadline = deadline || (wizardForm as any).deadline || '';
    const finalJobLink = jobLink || (wizardForm as any).url || (wizardForm as any).jobLink || '';

    formData.append('title', finalTitle);
    formData.append('company', finalCompany);
    formData.append('jobDescriptionText', finalDesc);
    formData.append('email', 'guest@jobwingman.local');
    if (finalPostingDate) formData.append('jobPostingDate', finalPostingDate);
    if (finalDeadline) formData.append('deadline', finalDeadline);
    if (finalJobLink) formData.append('jobLink', finalJobLink);
    if (referralName) formData.append('referralName', referralName);
    if (referralEmail) formData.append('referralEmail', referralEmail);

    try {
      const res = await fetch(`http://localhost:5000/api/applications`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const newApp = await res.json();
        await fetchApplications();
        await loadApplication(newApp.id);
        return newApp;
      } else if (res.status === 422) {
        const errData = await res.json();
        dispatch(setGatingError({
          matchScore: errData.matchScore || 0,
          suggestions: errData.suggestions || [],
          error: errData.error || 'Match score below 70%'
        }));
      } else {
        const errData = await res.json();
        alert(`Failed to evaluate application: ${errData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error during alignment evaluation:', err);
      alert('Network error connecting to Remix action gateway.');
    } finally {
      dispatch(setLoading(false));
    }
    return null;
  };

  const handleSaveResume = async () => {
    if (!selectedApp || !selectedApp.resume) return;
    dispatch(setLoading(true));
    try {
      const res = await fetch(`${API_BASE}/api/resumes/${selectedApp.resume.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ structuredData })
      });
      if (res.ok) {
        dispatch(setPdfCacheBuster(Date.now()));
        await loadApplication(selectedApp.id);
      } else {
        alert('Failed to save resume structured JSON data.');
      }
    } catch (err) {
      console.error('Error saving structured resume:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCommitSuggestion = async (sug: Suggestion) => {
    if (!selectedApp || !selectedApp.resume) return;

    let updated = { ...structuredData };
    if (sug.type === 'ADD') {
      const skillsToAdd = sug.content
        .replace(/add/i, '')
        .replace(/to the list/i, '')
        .replace(/Frameworks/i, '')
        .replace(/libraries/i, '')
        .replace(/\./g, '')
        .split(/,/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (skillsToAdd.length > 0) {
        const updatedSkills = [...updated.skills];
        let techSkillsCat = updatedSkills.find(cat => cat.category.toLowerCase().includes('skill'));
        if (!techSkillsCat) {
          techSkillsCat = { category: 'Technical Skills', items: [] };
          updatedSkills.push(techSkillsCat);
        }
        
        const newItems = [...techSkillsCat.items];
        skillsToAdd.forEach(s => {
          if (!newItems.includes(s)) {
            newItems.push(s);
          }
        });
        
        const idx = updatedSkills.indexOf(techSkillsCat);
        updatedSkills[idx] = { ...techSkillsCat, items: newItems };
        updated.skills = updatedSkills;
      }
    } else if (sug.type === 'EXPAND' || sug.type === 'CLARIFY') {
      if (updated.experience.length > 0) {
        updated.experience[0].description = [
          ...updated.experience[0].description,
          `(Aligned Update): ${sug.content}`
        ];
      } else {
        updated.summary = [
          ...updated.summary,
          sug.content
        ];
      }
    }

    dispatch(setStructuredData(updated));

    try {
      const res = await fetch(`${API_BASE}/api/resumes/${selectedApp.resume.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ structuredData: updated })
      });
      if (res.ok) {
        dispatch(setSelectedApp({
          ...selectedApp,
          suggestions: selectedApp.suggestions?.map(s => s.id === sug.id ? { ...s, resolved: true } : s)
        }));
        dispatch(setPdfCacheBuster(Date.now()));
      }
    } catch (err) {
      console.error('Error committing suggestion:', err);
    }
  };

  const handleApply = async (bypassGate: boolean) => {
    if (!selectedApp) return false;
    try {
      const res = await fetch(`${API_BASE}/api/applications/${selectedApp.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bypassGate })
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        await loadApplication(selectedApp.id);
        await fetchApplications();
        return true;
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to submit application.');
      }
    } catch (err) {
      console.error('Error marking as applied:', err);
    }
    return false;
  };

  const handleUpdateApplication = async (id: string, updates: { status?: string; appliedAt?: string; downloadedAt?: string }) => {
    dispatch(setLoading(true));
    try {
      const res = await fetch(`${API_BASE}/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updatedApp = await res.json();
        if (selectedApp && selectedApp.id === id) {
          dispatch(setSelectedApp(updatedApp));
        }
        await fetchApplications();
        return updatedApp;
      }
    } catch (err) {
      console.error('Error updating application:', err);
    } finally {
      dispatch(setLoading(false));
    }
    return null;
  };

  const handleSendEmail = async (applicationId: string, to: string, subject: string, body: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/applications/${applicationId}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, body }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch email over local network channels.');
      }

      alert("Success! Follow-up email left your local machine successfully.");
      return true;
    } catch (error: any) {
      console.error("Frontend email trigger crashed:", error);
      alert(`Mail Error: ${error.message}`);
      return false;
    }
  };

  const handleSaveJobDetails = (values: any) => {
    dispatch(setWizardForm(values));
  };

  return {
    applications,
    selectedApp,
    loading,
    structuredData,
    setStructuredData: setStructuredDataLocal,
    pdfCacheBuster,
    setPdfCacheBuster: setPdfCacheBusterLocal,
    fetchApplications,
    loadApplication,
    handleRunEvaluation,
    handleSaveResume,
    handleCommitSuggestion,
    handleApply,
    handleUpdateApplication,
    handleSendEmail,
    handleSaveJobDetails,
    gatingError,
    setGatingError: setGatingErrorLocal,
    wizardForm,
    setWizardForm: setWizardFormLocal,
    resumeFileBase64,
    resumeFileName,
    setResumeFile: setResumeFileLocal
  };
}
