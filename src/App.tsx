import React, { useState, useEffect } from 'react';
import type { TurfSession } from './types/turf';
import { getSession, saveSession, getActiveSessionCode, setActiveSessionCode } from './utils/storage';
import { LandingPage } from './components/LandingPage';
import { MainDashboard } from './components/MainDashboard';

export const App: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<TurfSession | null>(null);
  const [lastCode, setLastCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load active session on initial mount
  useEffect(() => {
    const activeCode = getActiveSessionCode();
    if (activeCode) {
      const savedSession = getSession(activeCode);
      if (savedSession) {
        setCurrentSession(savedSession);
        setLastCode(activeCode);
      }
    }
    setIsLoading(false);
  }, []);

  // Synchronize across tabs or background storage updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (currentSession && e.key === `turf_session_${currentSession.code}`) {
        const refreshed = getSession(currentSession.code);
        if (refreshed) {
          setCurrentSession(refreshed);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentSession]);

  const handleCodeLoaded = (session: TurfSession) => {
    setCurrentSession(session);
    setLastCode(session.code);
    setActiveSessionCode(session.code);
  };

  const handleUpdateSession = (updated: TurfSession) => {
    setCurrentSession(updated);
    saveSession(updated);
  };

  const handleLogout = () => {
    setActiveSessionCode(null);
    setCurrentSession(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-emerald-400">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      {currentSession ? (
        <MainDashboard
          session={currentSession}
          onUpdateSession={handleUpdateSession}
          onLogout={handleLogout}
        />
      ) : (
        <LandingPage
          onCodeLoaded={handleCodeLoaded}
          initialCode={lastCode}
        />
      )}
    </main>
  );
};

export default App;
