import React from 'react';
import { ChevronRight } from 'lucide-react';

interface FollowUpApp {
  id: string;
  title: string;
  company: string;
  status: string;
}

interface FollowUpListItemProps {
  app: FollowUpApp;
  isSelected: boolean;
  onSelect: () => void;
}

export default function FollowUpListItem({ app, isSelected, onSelect }: FollowUpListItemProps) {
  const isApplied = app.status === 'APPLIED';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-4 border rounded-2xl transition-all duration-200 flex flex-col gap-2 hover:border-zinc-700 hover:shadow-lg ${
        isSelected
          ? 'bg-primary/10 border-primary shadow-md shadow-primary-glow/10'
          : 'bg-zinc-900 border-zinc-800'
      }`}
    >
      <div className="flex justify-between items-center w-full">
        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
            isApplied
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}
        >
          {isApplied ? 'Applied 7d Ago' : 'Deadline Today'}
        </span>
        <span className="text-xs text-zinc-400 font-semibold">{app.company}</span>
      </div>
      <div className="flex justify-between items-center mt-1 w-full gap-2">
        <h4 className="text-sm font-bold text-zinc-200 truncate">{app.title}</h4>
        <ChevronRight
          className={`h-4 w-4 text-zinc-500 flex-shrink-0 transition-transform ${
            isSelected ? 'translate-x-1 text-primary' : ''
          }`}
        />
      </div>
    </button>
  );
}
