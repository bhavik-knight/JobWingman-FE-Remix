export const API_BASE = 'http://localhost:5000';

export interface Suggestion {
  id: string;
  regionId: string;
  regionText: string;
  type: 'ADD' | 'EXPAND' | 'CLARIFY' | string;
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
  downloadedAt?: string;
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

export const apiService = {
  async getApplications(): Promise<Application[]> {
    const res = await fetch(`${API_BASE}/api/applications`);
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
  },

  async getApplication(id: string): Promise<Application> {
    const res = await fetch(`${API_BASE}/api/applications/${id}`);
    if (!res.ok) throw new Error('Failed to fetch application details');
    return res.json();
  },

  async getFollowUps(): Promise<{ success: boolean; data: any[] }> {
    const res = await fetch(`${API_BASE}/api/applications/follow-ups`);
    if (!res.ok) throw new Error('Failed to fetch follow-ups');
    return res.json();
  },

  async runEvaluation(formData: FormData): Promise<Application> {
    const res = await fetch(`${API_BASE}/api/applications`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      if (res.status === 422) {
        const errorData = await res.json();
        throw { status: 422, data: errorData };
      }
      throw new Error('Failed to evaluate application');
    }
    return res.json();
  },

  async saveResume(resumeId: string, structuredData: StructuredResume): Promise<void> {
    const res = await fetch(`${API_BASE}/api/resumes/${resumeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredData }),
    });
    if (!res.ok) throw new Error('Failed to save resume');
  },

  async apply(applicationId: string, bypassGate: boolean): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/api/applications/${applicationId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bypassGate }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to submit application');
    }
    return res.json();
  },

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application> {
    const res = await fetch(`${API_BASE}/api/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update application');
    return res.json();
  },

  async sendEmail(applicationId: string, to: string, subject: string, body: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/api/applications/${applicationId}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to send email');
    }
    return res.json();
  },
};
