import React, { useState, useEffect } from 'react';

export default function ConsoleStream() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const stream = [
      'SYSTEM: Initializing OCR pipeline...',
      'RAW_DATA: Read PDF stream 0x2A4F',
      'NLP: Segmenting experience paragraphs...',
      'MODEL: Invoking local Llama-3 model...',
      'MODEL: Temperature set to 0.1 for high precision...',
      'ATS: Parsing skill keywords...',
      'MATCH: Cross-referencing "React", "TypeScript", "Node.js"...',
      'ALIGN: Evaluating matching criteria...',
      'GATE: Enforcing ATS gatekeeper threshold...',
      'SYSTEM: Compiling report metadata...'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      setLines((prev) => {
        const next = [...prev, stream[idx % stream.length]];
        if (next.length > 5) next.shift();
        return next;
      });
      idx++;
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-zinc-950/80 rounded-lg p-3 font-mono text-[9px] text-emerald-400/90 border border-emerald-950/50 space-y-1 w-full max-w-sm h-28 overflow-hidden shadow-inner text-left animate-pulse">
      {lines.map((l, i) => (
        <div key={i} className="truncate">
          <span className="text-zinc-650 font-bold">&gt;</span> {l}
        </div>
      ))}
    </div>
  );
}
