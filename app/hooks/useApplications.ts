import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:5000';

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
  };
  suggestions?: Suggestion[];
}

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfCacheBuster, setPdfCacheBuster] = useState(Date.now());
  const [structuredData, setStructuredData] = useState<StructuredResume>({
    name: '',
    email: '',
    phone: '',
    summary: [],
    skills: [],
    experience: [],
    education: [],
    volunteer: [],
    projects: []
  });

  const [gatingError, setGatingError] = useState<{
    matchScore: number;
    suggestions: any[];
    error: string;
  } | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/applications`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
        return data;
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
    return [];
  }, []);

  const loadApplication = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/applications/${id}`);
      if (res.ok) {
        const app = await res.json();
        setSelectedApp(app);
        if (app.resume && app.resume.structuredData) {
          const sd = app.resume.structuredData;
          setStructuredData({
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
          });
        }
        setPdfCacheBuster(Date.now());
      }
    } catch (err) {
      console.error('Failed to load application details:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRunEvaluation = async (
    file: File,
    jobTitle: string,
    company: string,
    jobDescription: string
  ) => {
    setLoading(true);
    setGatingError(null);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('title', jobTitle || 'Position');
    formData.append('company', company || 'Company');
    formData.append('jobDescriptionText', jobDescription);
    formData.append('email', 'guest@jobwingman.local');

    try {
      // Post directly to Remix action gateway at root "/"
      const res = await fetch("/", {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const newApp = await res.json();
        const updatedApps = await fetchApplications();
        await loadApplication(newApp.id);
        return true;
      } else if (res.status === 422) {
        const errData = await res.json();
        setGatingError({
          matchScore: errData.matchScore || 0,
          suggestions: errData.suggestions || [],
          error: errData.error || 'Match score below 70%'
        });
      } else {
        const errData = await res.json();
        alert(`Failed to evaluate application: ${errData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error during alignment evaluation:', err);
      alert('Network error connecting to Remix action gateway.');
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleSaveResume = async () => {
    if (!selectedApp || !selectedApp.resume) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/resumes/${selectedApp.resume.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ structuredData })
      });
      if (res.ok) {
        setPdfCacheBuster(Date.now());
        await loadApplication(selectedApp.id);
      } else {
        alert('Failed to save resume structured JSON data.');
      }
    } catch (err) {
      console.error('Error saving structured resume:', err);
    } finally {
      setLoading(false);
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

    setStructuredData(updated);

    try {
      const res = await fetch(`${API_BASE}/api/resumes/${selectedApp.resume.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ structuredData: updated })
      });
      if (res.ok) {
        setSelectedApp({
          ...selectedApp,
          suggestions: selectedApp.suggestions?.map(s => s.id === sug.id ? { ...s, resolved: true } : s)
        });
        setPdfCacheBuster(Date.now());
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

  return {
    applications,
    selectedApp,
    loading,
    structuredData,
    setStructuredData,
    pdfCacheBuster,
    setPdfCacheBuster,
    fetchApplications,
    loadApplication,
    handleRunEvaluation,
    handleSaveResume,
    handleCommitSuggestion,
    handleApply,
    gatingError,
    setGatingError
  };
}
