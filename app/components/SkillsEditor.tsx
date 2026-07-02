import React from 'react';

interface Skill {
  category: string;
  items: string[];
}

interface SkillsEditorProps {
  skills: Skill[];
  onUpdateSkillCat: (catIdx: number, val: string) => void;
  onUpdateSkillItem: (catIdx: number, itemIdx: number, val: string) => void;
}

export default function SkillsEditor({ skills, onUpdateSkillCat, onUpdateSkillItem }: SkillsEditorProps) {
  return (
    <div className="space-y-4">
      {skills?.map((cat, catIdx) => (
        <div key={catIdx} className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-xl space-y-3">
          <input
            type="text"
            value={cat.category}
            onChange={(e) => onUpdateSkillCat(catIdx, e.target.value)}
            className="bg-transparent text-sm font-bold text-zinc-100 border-b border-zinc-800 focus:border-primary focus:outline-none pb-1 w-full"
            placeholder="Skill Category Title"
          />
          <div className="flex flex-wrap gap-2">
            {cat.items?.map((item, itemIdx) => (
              <input
                key={itemIdx}
                type="text"
                value={item}
                onChange={(e) => onUpdateSkillItem(catIdx, itemIdx, e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-primary w-28"
                placeholder="Skill name"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
