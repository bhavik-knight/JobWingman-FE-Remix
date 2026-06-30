import React, { useEffect } from 'react';
import { Outlet, NavLink } from '@remix-run/react';
import { Sparkles, Briefcase, Bell } from 'lucide-react';
import DashboardHeader from '../components/DashboardHeader';
import { useDispatch } from 'react-redux';
import { setApplications } from '../store';
import { API_BASE } from '../hooks/useApplications';

export default function AppLayout() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch apps on mount
    fetch(`${API_BASE}/api/applications`)
      .then(res => res.json())
      .then(data => {
        dispatch(setApplications(data));
      })
      .catch(err => console.error(err));
  }, [dispatch]);

  const isBrowser = typeof window !== "undefined";

  return (
    <div className="min-h-screen bg-background text-foreground relative p-4 md:p-8 flex flex-col">
      <div className="glow-bg top-[-100px] left-[-100px]"></div>
      <div className="glow-bg bottom-[-100px] right-[-100px] opacity-40"></div>

      <div className="w-full max-w-full mx-auto px-4 py-6 flex flex-col flex-grow">
        <DashboardHeader />
        
        <div className="flex flex-grow mt-8 gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="flex flex-col gap-2 bg-card border border-border p-4 rounded-2xl shadow-lg relative z-10">
              <NavLink
                to="/wizard"
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                    isActive || (isBrowser && window.location.pathname.startsWith('/wizard'))
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary-glow'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Sparkles className="h-5 w-5" />
                <span>Wizard</span>
              </NavLink>
              
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                    isActive || (isBrowser && window.location.pathname.startsWith('/dashboard'))
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary-glow'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Briefcase className="h-5 w-5" />
                <span>Dashboard</span>
              </NavLink>
              
              <NavLink
                to="/follow-ups"
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                    isActive || (isBrowser && window.location.pathname.startsWith('/follow-ups'))
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary-glow'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Bell className="h-5 w-5" />
                <span>Follow-ups</span>
              </NavLink>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-grow min-w-0 z-10 w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
