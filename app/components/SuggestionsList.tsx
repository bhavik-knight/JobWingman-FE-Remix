import React from 'react';

export interface Suggestion {
  id: string;
  type: 'ADD' | 'REMOVE' | 'MODIFY' | string;
  regionId: string;
  content: string;
  rationale: string;
}

interface SuggestionsListProps {
  suggestions?: Suggestion[];
}

export default function SuggestionsList({ suggestions = [] }: SuggestionsListProps) {
  return (
    <div className="space-y-2 border-t border-border pt-4">
      <h3 className="text-xs font-bold text-gray-350">AI Alignment Suggestions ({suggestions.length})</h3>
      <div className="max-h-[600px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {suggestions.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No suggestions generated. Your resume aligns perfectly!</p>
        ) : (
          suggestions.map((sug) => (
            <div key={sug.id} className="p-3 bg-background/40 border border-border rounded-xl space-y-1.5 hover:border-primary/30 hover:bg-background/60 transition-all duration-200">
              <div className="flex justify-between items-center">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                  sug.type === 'ADD' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                }`}>
                  {sug.type}
                </span>
                <span className="text-[10px] text-gray-500">Section: {sug.regionId.replace('sec_', '')}</span>
              </div>
              <p className="text-xs text-white font-medium">{sug.content}</p>
              <p className="text-[10px] text-gray-400 leading-normal">{sug.rationale}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
