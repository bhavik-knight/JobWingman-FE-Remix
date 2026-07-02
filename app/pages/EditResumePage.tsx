import React, { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { Edit3, ArrowRight } from 'lucide-react';
import { useApplications } from '../hooks/useApplications';
import SkillsEditor from '../components/SkillsEditor';
import ExperienceEditor from '../components/ExperienceEditor';

export default function EditResumePage() {
  const navigate = useNavigate();
  const { 
    selectedApp, 
    structuredData, 
    setStructuredData, 
    handleSaveResume, 
    loading 
  } = useApplications();

  const [activeTab, setActiveTab] = useState<'skills' | 'exp'>('skills');

  useEffect(() => {
    if (!selectedApp || !structuredData) {
      navigate('/wizard/job-details');
    }
  }, [selectedApp, structuredData, navigate]);

  if (!selectedApp || !structuredData) return null;

  const updateSkillCat = (catIdx: number, val: string) => {
    const updated = [...structuredData.skills];
    updated[catIdx] = { ...updated[catIdx], category: val };
    setStructuredData({ ...structuredData, skills: updated });
  };

  const updateSkillItem = (catIdx: number, itemIdx: number, val: string) => {
    const updated = [...structuredData.skills];
    const newItems = [...updated[catIdx].items];
    newItems[itemIdx] = val;
    updated[catIdx] = { ...updated[catIdx], items: newItems };
    setStructuredData({ ...structuredData, skills: updated });
  };

  const updateExp = (idx: number, field: string, val: string) => {
    const updated = [...structuredData.experience];
    if (field === 'description') {
      updated[idx] = { ...updated[idx], description: val.split('\n').filter(Boolean) };
    } else {
      updated[idx] = { ...updated[idx], [field]: val };
    }
    setStructuredData({ ...structuredData, experience: updated });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary" />
            Step 4: Tailored Resume Editor
          </h2>
          <p className="text-xs text-gray-400">Edit sections directly before compiling.</p>
        </div>
        <button
          onClick={async () => {
            await handleSaveResume();
            navigate('/wizard/preview-pdf');
          }}
          disabled={loading}
          className="bg-gradient-to-r from-primary to-secondary text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-primary-glow disabled:opacity-50"
        >
          <span>Preview PDF</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border text-xs gap-4 pb-2">
        <button 
          onClick={() => setActiveTab('skills')}
          className={`font-semibold pb-1.5 transition-all ${activeTab === 'skills' ? 'text-primary border-b-2 border-primary' : 'text-zinc-400'}`}
        >
          Skills
        </button>
        <button 
          onClick={() => setActiveTab('exp')}
          className={`font-semibold pb-1.5 transition-all ${activeTab === 'exp' ? 'text-primary border-b-2 border-primary' : 'text-zinc-400'}`}
        >
          Experience
        </button>
      </div>

      {/* Panels */}
      <div className="max-h-[400px] overflow-y-auto space-y-4 pr-1">
        {activeTab === 'skills' && (
          <SkillsEditor 
            skills={structuredData.skills} 
            onUpdateSkillCat={updateSkillCat} 
            onUpdateSkillItem={updateSkillItem} 
          />
        )}

        {activeTab === 'exp' && (
          <ExperienceEditor 
            experience={structuredData.experience} 
            onUpdateExp={updateExp} 
          />
        )}
      </div>
    </div>
  );
}
