import React from 'react';
import { Shield } from 'lucide-react';
import { Link } from '@remix-run/react';

export default function DashboardHeader() {
  return (
    <header className="flex justify-between items-center pb-6 border-b border-border mb-8 z-10 w-full">
      <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-90 transition-opacity cursor-pointer">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary-glow">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            JobWingman
            <span className="text-[10px] uppercase font-bold tracking-widest bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">
              Remix TS MVP
            </span>
          </h1>
          <p className="text-xs text-gray-400">ML Alignment & Lifecycle Automation</p>
        </div>
      </Link>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-card border border-border px-3 py-1.5 rounded-lg text-xs text-gray-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Local Ollama + Typst Active</span>
        </div>
      </div>
    </header>
  );
}
