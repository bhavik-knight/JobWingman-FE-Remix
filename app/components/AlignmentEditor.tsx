import React, { useState } from 'react';
import { Sparkles, Save, Check, RefreshCw } from 'lucide-react';
import type { Application, Suggestion, StructuredResume } from '../hooks/useApplications';

interface AlignmentEditorProps {
  selectedApp: Application;
  structuredData: StructuredResume;
  setStructuredData: React.Dispatch<React.SetStateAction<StructuredResume>>;
  onSave: () => Promise<void>;
  onCommitSuggestion: (sug: Suggestion) => Promise<void>;
  loading: boolean;
}

export default function AlignmentEditor({
  selectedApp,
  structuredData,
  setStructuredData,
  onSave,
  onCommitSuggestion,
  loading
}: AlignmentEditorProps) {
  const [activeTab, setActiveTab] = useState<'skills' | 'exp' | 'sug'>('sug');

  // Helper helpers
  // Helper helpers
  const handleSkillChange = (catIdx: number, val: string) => {
    const updated = [...structuredData.skills];
    updated[catIdx] = { ...updated[catIdx], category: val };
    setStructuredData({ ...structuredData, skills: updated });
  };

  const handleAddSkillCategory = () => {
    setStructuredData({
      ...structuredData,
      skills: [...structuredData.skills, { category: 'New Category', items: ['New Skill'] }]
    });
  };

  const handleRemoveSkillCategory = (catIdx: number) => {
    setStructuredData({
      ...structuredData,
      skills: structuredData.skills.filter((_, i) => i !== catIdx)
    });
  };

  const handleSkillItemChange = (catIdx: number, itemIdx: number, val: string) => {
    const updated = [...structuredData.skills];
    const newItems = [...updated[catIdx].items];
    newItems[itemIdx] = val;
    updated[catIdx] = { ...updated[catIdx], items: newItems };
    setStructuredData({ ...structuredData, skills: updated });
  };

  const handleAddSkillItem = (catIdx: number) => {
    const updated = [...structuredData.skills];
    const newItems = [...updated[catIdx].items, 'New Skill'];
    updated[catIdx] = { ...updated[catIdx], items: newItems };
    setStructuredData({ ...structuredData, skills: updated });
  };

  const handleRemoveSkillItem = (catIdx: number, itemIdx: number) => {
    const updated = [...structuredData.skills];
    const newItems = updated[catIdx].items.filter((_, i) => i !== itemIdx);
    updated[catIdx] = { ...updated[catIdx], items: newItems };
    setStructuredData({ ...structuredData, skills: updated });
  };

  const handleExpChange = (idx: number, field: string, val: string) => {
    const updated = [...structuredData.experience];
    if (field === 'description') {
      updated[idx] = { ...updated[idx], description: val.split('\n').filter(Boolean) };
    } else {
      updated[idx] = { ...updated[idx], [field]: val };
    }
    setStructuredData({ ...structuredData, experience: updated });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col h-full space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-border text-xs">
        <button 
          onClick={() => setActiveTab('sug')}
          className={`pb-2 px-3 font-medium flex items-center space-x-1.5 transition-colors ${
            activeTab === 'sug' ? 'border-b-2 border-primary text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Suggestions</span>
        </button>
        <button 
          onClick={() => setActiveTab('skills')}
          className={`pb-2 px-3 font-medium transition-colors ${
            activeTab === 'skills' ? 'border-b-2 border-primary text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Skills
        </button>
        <button 
          onClick={() => setActiveTab('exp')}
          className={`pb-2 px-3 font-medium transition-colors ${
            activeTab === 'exp' ? 'border-b-2 border-primary text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Experience
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-grow overflow-y-auto space-y-3 pr-1 max-h-[350px]">
        {activeTab === 'sug' && (
          <div className="space-y-2.5">
            {selectedApp.suggestions?.map((sug) => (
              <div 
                key={sug.id} 
                className={`p-3 rounded-xl border transition-all ${
                  sug.resolved 
                    ? 'border-emerald-500/20 bg-emerald-500/5 opacity-60' 
                    : 'border-border bg-background/50 hover:border-primary/30'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                    sug.type === 'ADD' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                  }`}>
                    {sug.type}
                  </span>
                  {sug.resolved ? (
                    <span className="text-emerald-400 flex items-center text-[10px] font-medium gap-1">
                      <Check className="h-3 w-3" /> Committed
                    </span>
                  ) : (
                    <button 
                      onClick={() => onCommitSuggestion(sug)}
                      className="text-white hover:text-primary bg-primary/20 hover:bg-primary/30 px-2 py-0.5 rounded text-[9px] font-semibold border border-primary/30 transition-all flex items-center gap-1"
                    >
                      <Sparkles className="h-2.5 w-2.5" /> Accept Suggestion
                    </button>
                  )}
                </div>
                <p className="text-xs text-white mt-1.5 font-medium">{sug.content}</p>
                <p className="text-[10px] text-gray-400 mt-1">{sug.rationale}</p>
              </div>
            ))}
            {(!selectedApp.suggestions || selectedApp.suggestions.length === 0) && (
              <p className="text-xs text-gray-500 text-center py-6">No suggestions found.</p>
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-4">
            <label className="text-xs text-gray-400 font-medium">Core Skills</label>
            {structuredData.skills && structuredData.skills.length > 0 && typeof structuredData.skills[0] === 'object' ? (
              // Nested Skill Categories rendering
              structuredData.skills.map((catObj: any, catIdx: number) => (
                <div key={catIdx} className="space-y-2 border border-border p-3 rounded-xl bg-background/50">
                  <div className="flex justify-between items-center">
                    <input
                      type="text"
                      value={catObj.category}
                      onChange={(e) => handleSkillChange(catIdx, e.target.value)}
                      className="bg-transparent text-xs font-bold text-white focus:outline-none w-full"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSkillCategory(catIdx)}
                      className="text-gray-500 hover:text-rose-400 text-xs font-bold px-1"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {catObj.items.map((item: string, itemIdx: number) => (
                      <div key={itemIdx} className="flex items-center space-x-1 bg-background border border-border px-2 py-0.5 rounded-lg">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleSkillItemChange(catIdx, itemIdx, e.target.value)}
                          className="bg-transparent text-[11px] text-white focus:outline-none w-14 focus:w-20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSkillItem(catIdx, itemIdx)}
                          className="text-gray-500 hover:text-rose-400 text-xs font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddSkillItem(catIdx)}
                      className="text-[10px] font-medium text-primary hover:text-white transition-colors"
                    >
                      + Add Item
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Fallback Flat List rendering
              <div className="flex flex-wrap gap-2">
                {(structuredData.skills as any[]).map((skill: any, idx: number) => (
                  <div key={idx} className="flex items-center space-x-1 bg-background border border-border px-2.5 py-1 rounded-lg">
                    <input 
                      type="text" 
                      value={typeof skill === 'string' ? skill : (skill?.category || '')} 
                      onChange={(e) => {
                        const updated = [...structuredData.skills] as any[];
                        updated[idx] = e.target.value;
                        setStructuredData({ ...structuredData, skills: updated });
                      }}
                      className="bg-transparent text-xs text-white focus:outline-none w-16 focus:w-24 transition-all"
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        const updated = structuredData.skills.filter((_, i) => i !== idx);
                        setStructuredData({ ...structuredData, skills: updated });
                      }} 
                      className="text-gray-500 hover:text-rose-400 text-xs font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button 
              type="button" 
              onClick={handleAddSkillCategory}
              className="text-[10px] font-medium text-primary hover:text-white transition-colors mt-2"
            >
              + Add Category
            </button>
          </div>
        )}

        {activeTab === 'exp' && (
          <div className="space-y-3">
            {structuredData.experience.map((exp, idx) => (
              <div key={idx} className="p-3 bg-background/50 border border-border rounded-xl space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => handleExpChange(idx, 'company', e.target.value)}
                    className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-primary"
                  />
                  <input 
                    type="text" 
                    placeholder="Role"
                    value={exp.role}
                    onChange={(e) => handleExpChange(idx, 'role', e.target.value)}
                    className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <textarea 
                  rows={3}
                  placeholder="Responsibilities & bullet points (one per line)..."
                  value={Array.isArray(exp.description) ? exp.description.join('\n') : exp.description}
                  onChange={(e) => handleExpChange(idx, 'description', e.target.value)}
                  className="w-full bg-background border border-border rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4 mt-auto">
        <button 
          onClick={onSave}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/95 text-white font-medium py-2 rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-md shadow-primary-glow"
        >
          {loading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          <span>Save structured edits & compile</span>
        </button>
      </div>
    </div>
  );
}
