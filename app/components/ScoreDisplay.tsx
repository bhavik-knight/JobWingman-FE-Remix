import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ScoreDisplayProps {
  matchScore: number;
  gatingFlag: boolean;
}

export default function ScoreDisplay({ matchScore, gatingFlag }: ScoreDisplayProps) {
  const isHighMatch = matchScore >= 70;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-background/50 border border-border rounded-2xl relative min-h-[160px] shadow-inner">
      <div className={`relative h-24 w-24 rounded-full border-4 flex flex-col items-center justify-center transition-all ${
        isHighMatch ? 'border-emerald-500/30' : 'border-amber-500/30'
      }`}>
        <span className={`text-2xl font-bold ${isHighMatch ? 'text-emerald-400' : 'text-amber-400'}`}>
          {matchScore.toFixed(0)}%
        </span>
        <span className="text-[9px] text-gray-500">Match score</span>
      </div>
      {gatingFlag && (
        <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-2 animate-pulse">
          <AlertTriangle className="h-3 w-3" />
          <span>Gating is active (Score {"< 70%"})</span>
        </div>
      )}
    </div>
  );
}
