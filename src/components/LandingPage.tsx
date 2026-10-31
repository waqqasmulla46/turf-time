import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, User, Sparkles, AlertCircle, CheckCircle2, ArrowRight, PlusCircle, History } from 'lucide-react';
import type { TurfSession } from '../types/turf';
import { getSession, saveSession, isValidCode, sanitizeCodeInput, getAllSavedCodes } from '../utils/storage';

interface LandingPageProps {
  onCodeLoaded: (session: TurfSession) => void;
  initialCode?: string;
}

type ViewMode = 'enter' | 'create';

export const LandingPage: React.FC<LandingPageProps> = ({ onCodeLoaded, initialCode = '' }) => {
  const [mode, setMode] = useState<ViewMode>('enter');
  
  // Enter Code State
  const [enterCode, setEnterCode] = useState(initialCode);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Create Code State
  const [createName, setCreateName] = useState('');
  const [createCode, setCreateCode] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleEnterCodeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    const trimmed = enterCode.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a 6-character code.');
      return;
    }

    const session = getSession(trimmed);
    if (session) {
      onCodeLoaded(session);
    } else {
      setErrorMessage('Code not found. Please create one.');
    }
  };

  const handleCreateCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const trimmedName = createName.trim();
    const sanitizedCode = sanitizeCodeInput(createCode.trim());

    if (!trimmedName) {
      setCreateError('Please enter your name.');
      return;
    }

    if (sanitizedCode.length !== 6) {
      setCreateError('Code must be strictly 6 characters long.');
      return;
    }

    if (!isValidCode(sanitizedCode)) {
      setCreateError('Code allows uppercase letters, numbers, and special characters.');
      return;
    }

    // Check if code already exists
    const existing = getSession(sanitizedCode);
    if (existing) {
      setCreateError('This code is already taken. Please choose a different code.');
      return;
    }

    // Create new profile matching specified schema
    const newSession: TurfSession = {
      code: sanitizedCode,
      creatorName: trimmedName,
      totalMoney: 1200, // default turf cost
      qrCodeImage: null,
      players: [
        { id: 1, name: trimmedName, hasPaid: false }
      ]
    };

    saveSession(newSession);

    // Switch back to "Enter Code" view with the code pre-filled
    setEnterCode(sanitizedCode);
    setSuccessNotice(`Profile created for "${trimmedName}" with code ${sanitizedCode}!`);
    setCreateName('');
    setCreateCode('');
    setMode('enter');
  };

  const handleSeedDemo = () => {
    const demoSession: TurfSession = {
      code: 'AB12!X',
      creatorName: 'Waqqas',
      totalMoney: 1200,
      qrCodeImage: null,
      players: [
        { id: 1, name: 'Player 1', hasPaid: true },
        { id: 2, name: 'Player 2', hasPaid: false },
        { id: 3, name: 'Player 3', hasPaid: false },
        { id: 4, name: 'Player 4', hasPaid: true },
        { id: 5, name: 'Player 5', hasPaid: false },
        { id: 6, name: 'Player 6', hasPaid: true },
      ]
    };
    saveSession(demoSession);
    setEnterCode('AB12!X');
    setSuccessNotice('Demo profile "AB12!X" loaded into local storage!');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-400/5 rounded-full blur-2xl pointer-events-none" />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md mx-auto z-10"
      >
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-emerald-500/30 shadow-neon mb-4">
            <svg className="w-9 h-9 text-emerald-400" viewBox="0 0 100 100" fill="none">
              <rect x="10" y="10" width="80" height="80" rx="8" stroke="currentColor" strokeWidth="6" fill="#064e3b" fillOpacity="0.4"/>
              <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="5"/>
              <circle cx="50" cy="50" r="16" stroke="currentColor" strokeWidth="5"/>
              <circle cx="50" cy="50" r="4" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            TURF <span className="text-emerald-400">TIME</span>
          </h1>
          <p className="text-xs uppercase tracking-widest text-zinc-400 mt-1 font-medium">
            Weekly Football Turf Payment Tracker
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-800/80 backdrop-blur-xl relative">
          {/* Success Banner */}
          {successNotice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-300 text-xs font-medium"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successNotice}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {mode === 'enter' ? (
              /* VIEW 1: ENTER CODE */
              <motion.form
                key="enter-view"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleEnterCodeSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                    ENTER CODE
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <KeyRound className="w-5 h-5 text-emerald-400/80" />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={enterCode}
                      onChange={(e) => {
                        setEnterCode(sanitizeCodeInput(e.target.value));
                        setErrorMessage(null);
                      }}
                      placeholder="e.g. AB12!X"
                      className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/90 border border-zinc-700/80 rounded-2xl text-center text-lg font-mono font-bold tracking-widest text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-inner"
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1.5 px-1">
                    <span className="text-[11px] text-zinc-500">6-character unique session key</span>
                    <span className="text-[11px] font-mono text-zinc-500">{enterCode.length}/6</span>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center gap-2.5 text-red-300 text-xs font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm tracking-wider uppercase text-zinc-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] transition-all duration-200 shadow-neon hover:shadow-neon-strong flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>SUBMIT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Saved Matches Memory on this Device */}
                {getAllSavedCodes().length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-2 font-medium">
                      <History className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Previously Saved Matches:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {getAllSavedCodes().map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setEnterCode(code);
                            const session = getSession(code);
                            if (session) {
                              onCodeLoaded(session);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-700/80 hover:border-emerald-500/70 text-xs font-mono font-bold text-zinc-200 hover:text-emerald-300 transition cursor-pointer shadow-sm"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Secondary Action: Create Code */}
                <div className="pt-2 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessNotice(null);
                      setMode('create');
                    }}
                    className="w-full py-3 px-4 rounded-2xl font-semibold text-xs tracking-wider uppercase text-zinc-300 bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-700/60 hover:border-emerald-500/50 hover:text-white transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    <span>CREATE CODE</span>
                  </button>
                </div>
              </motion.form>
            ) : (
              /* VIEW 2: CREATE CODE */
              <motion.form
                key="create-view"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleCreateCodeSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                    ENTER NAME
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <User className="w-5 h-5 text-emerald-400/80" />
                    </div>
                    <input
                      type="text"
                      value={createName}
                      onChange={(e) => {
                        setCreateName(e.target.value);
                        setCreateError(null);
                      }}
                      placeholder="e.g. Waqqas"
                      className="w-full pl-11 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-2xl text-white font-medium placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-inner"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                    ENTER CODE
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <KeyRound className="w-5 h-5 text-emerald-400/80" />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={createCode}
                      onChange={(e) => {
                        setCreateCode(sanitizeCodeInput(e.target.value));
                        setCreateError(null);
                      }}
                      placeholder="e.g. AB12!X"
                      className="w-full pl-11 pr-4 py-3 bg-zinc-900/90 border border-zinc-700/80 rounded-2xl text-center text-lg font-mono font-bold tracking-widest text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-inner"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1.5 px-1">
                    <span className="text-[11px] text-zinc-400">Strictly 6 chars (A-Z, 0-9, symbols)</span>
                    <span className={`text-[11px] font-mono font-bold ${createCode.length === 6 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                      {createCode.length}/6
                    </span>
                  </div>
                </div>

                {/* Create Error Banner */}
                {createError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center gap-2.5 text-red-300 text-xs font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{createError}</span>
                  </motion.div>
                )}

                {/* Create Action */}
                <button
                  type="submit"
                  disabled={createCode.length !== 6 || !createName.trim()}
                  className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm tracking-wider uppercase text-zinc-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 shadow-neon hover:shadow-neon-strong flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>CREATE</span>
                </button>

                {/* Back to Enter Code view */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setCreateError(null);
                      setMode('enter');
                    }}
                    className="text-xs text-zinc-400 hover:text-emerald-400 transition font-medium underline underline-offset-4 cursor-pointer"
                  >
                    Back to Enter Code
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Demo Helper */}
        <div className="mt-6 text-center">
          <button
            onClick={handleSeedDemo}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1 px-3 rounded-full hover:bg-zinc-900/60 border border-transparent hover:border-zinc-800 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Load Quick Demo (AB12!X)</span>
          </button>
        </div>

        {/* Footer Credit */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-500 font-medium tracking-wide">
            Made with <span className="text-red-500">❤️</span> by <span className="text-zinc-400 font-semibold">Waqqas Mulla</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
