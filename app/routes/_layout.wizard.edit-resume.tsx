import React, { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { Edit3, ArrowRight } from 'lucide-react';
import { useApplications } from '../hooks/useApplications';

export default function EditResume() {
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
        {activeTab === 'skills' && structuredData.skills?.map((cat, catIdx) => (
          <div key={catIdx} className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-xl space-y-3">
            <input
              type="text"
              value={cat.category}
              onChange={(e) => updateSkillCat(catIdx, e.target.value)}
              className="bg-transparent text-sm font-bold text-zinc-100 border-b border-zinc-800 focus:border-primary focus:outline-none pb-1 w-full"
            />
            <div className="flex flex-wrap gap-2">
              {cat.items?.map((item, itemIdx) => (
                <input
                  key={itemIdx}
                  type="text"
                  value={item}
                  onChange={(e) => updateSkillItem(catIdx, itemIdx, e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-primary w-24"
                />
              ))}
            </div>
          </div>
        ))}

        {activeTab === 'exp' && structuredData.experience?.map((expItem, idx) => (
          <div key={idx} className="space-y-4 bg-zinc-950/40 p-4 border border-zinc-800 rounded-xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Role Title</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-primary"
                  value={expItem.role} 
                  onChange={(e) => updateExp(idx, 'role', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Company / Institution</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-primary"
                  value={expItem.company} 
                  onChange={(e) => updateExp(idx, 'company', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Impact Achievements (Raw Details)</label>
              <textarea 
                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-xs font-mono text-zinc-300 leading-relaxed focus:outline-none focus:border-primary resize-none"
                rows={4}
                value={Array.isArray(expItem.description) ? expItem.description.join('\n') : expItem.description}
                onChange={(e) => updateExp(idx, 'description', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
