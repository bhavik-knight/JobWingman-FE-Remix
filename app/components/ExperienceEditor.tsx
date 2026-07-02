import React from 'react';

interface Experience {
  role: string;
  company: string;
  description: string | string[];
}

interface ExperienceEditorProps {
  experience: Experience[];
  onUpdateExp: (idx: number, field: string, val: string) => void;
}

export default function ExperienceEditor({ experience, onUpdateExp }: ExperienceEditorProps) {
  return (
    <div className="space-y-4">
      {experience?.map((expItem, idx) => (
        <div key={idx} className="space-y-4 bg-zinc-950/40 p-4 border border-zinc-800 rounded-xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Role Title</label>
              <input 
                type="text" 
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-primary"
                value={expItem.role} 
                onChange={(e) => onUpdateExp(idx, 'role', e.target.value)}
                placeholder="e.g. Software Engineer"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Company / Institution</label>
              <input 
                type="text" 
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-primary"
                value={expItem.company} 
                onChange={(e) => onUpdateExp(idx, 'company', e.target.value)}
                placeholder="e.g. Acme Corp"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Impact Achievements (One per line)</label>
            <textarea 
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-xs font-mono text-zinc-300 leading-relaxed focus:outline-none focus:border-primary resize-none"
              rows={4}
              value={Array.isArray(expItem.description) ? expItem.description.join('\n') : expItem.description}
              onChange={(e) => onUpdateExp(idx, 'description', e.target.value)}
              placeholder="- Developed feature X which improved conversion by Y%"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
