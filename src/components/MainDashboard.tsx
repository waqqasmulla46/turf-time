import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Check, 
  QrCode, 
  Users, 
  IndianRupee, 
  Sparkles, 
  Copy, 
  CheckCheck,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { TurfSession } from '../types/turf';
import { formatCurrency, calculatePerPerson, compressImageToBase64 } from '../utils/storage';
import { SlideOutMenu } from './SlideOutMenu';

interface MainDashboardProps {
  session: TurfSession;
  onUpdateSession: (updated: TurfSession) => void;
  onLogout: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  session,
  onUpdateSession,
  onLogout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [quickAddName, setQuickAddName] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Per Person Calculation: Total Money / players.length (0 if no players)
  const perPersonAmount = calculatePerPerson(session.totalMoney, session.players.length);
  const formattedPP = formatCurrency(perPersonAmount);

  // Stats
  const paidCount = session.players.filter(p => p.hasPaid).length;
  const totalCount = session.players.length;
  const allPaid = totalCount > 0 && paidCount === totalCount;

  // Trigger celebration confetti when all players are paid
  useEffect(() => {
    if (allPaid) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#10b981', '#34d399', '#ffffff']
      });
    }
  }, [allPaid]);

  // Toggle player payment status
  const handleTogglePayment = (playerId: number) => {
    const updatedPlayers = session.players.map(p => {
      if (p.id === playerId) {
        return { ...p, hasPaid: !p.hasPaid };
      }
      return p;
    });

    onUpdateSession({
      ...session,
      players: updatedPlayers
    });
  };

  // QR Code Image Upload with automatic compression for safe localStorage storage
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP, etc.)');
      return;
    }

    try {
      const base64Data = await compressImageToBase64(file);
      onUpdateSession({
        ...session,
        qrCodeImage: base64Data
      });
    } catch (err) {
      console.error('Failed to compress/read image:', err);
      alert('Failed to process image. Please try another image.');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(session.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickAddName.trim();
    if (!trimmed) return;

    const nextId = session.players.length > 0 
      ? Math.max(...session.players.map(p => p.id)) + 1 
      : 1;

    onUpdateSession({
      ...session,
      players: [...session.players, { id: nextId, name: trimmed, hasPaid: false }]
    });

    setQuickAddName('');
    setShowQuickAdd(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-start p-3 sm:p-6 pb-20 relative">
      {/* Subtle background ambient lights */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Responsive App Container */}
      <div className="w-full max-w-lg mx-auto flex flex-col gap-5 z-10">
        
        {/* HEADER NAVIGATION */}
        <header className="glass-panel rounded-2xl px-4 py-3.5 flex items-center justify-between border border-zinc-800 shadow-lg">
          {/* Top Left: Creator Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-[1.5px] shadow-neon">
              <div className="w-full h-full bg-zinc-900 rounded-[10px] flex items-center justify-center font-bold text-emerald-400 text-sm">
                {session.creatorName ? session.creatorName.charAt(0).toUpperCase() : 'T'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-400 font-medium">Hi,</span>
                <span className="text-base font-extrabold text-white tracking-tight">
                  {session.creatorName}
                </span>
              </div>
              {/* Code Badge */}
              <button
                onClick={handleCopyCode}
                title="Click to copy code"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400/90 hover:text-emerald-300 transition-colors"
              >
                <span>Code: {session.code}</span>
                {copiedCode ? (
                  <CheckCheck className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 opacity-70 hover:opacity-100" />
                )}
              </button>
            </div>
          </div>

          {/* Top Right: Hamburger Menu Icon (3 vertical lines) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              className="w-10 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-emerald-500/60 text-zinc-200 hover:text-emerald-400 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md cursor-pointer"
            >
              {/* 3 vertical lines hamburger icon */}
              <div className="flex items-center justify-center gap-1">
                <span className="w-1 h-5 bg-current rounded-full" />
                <span className="w-1 h-5 bg-current rounded-full" />
                <span className="w-1 h-5 bg-current rounded-full" />
              </div>
            </button>
          </div>
        </header>

        {/* METRICS & QUICK SUMMARY */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel rounded-2xl p-3.5 border border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Turf</span>
              <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {formatCurrency(session.totalMoney)}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              Cost of booking
            </div>
          </div>

          <div className="glass-panel-glow rounded-2xl p-3.5 border border-emerald-500/30 flex flex-col justify-between bg-zinc-900/60">
            <div className="flex items-center justify-between text-emerald-300">
              <span className="text-xs font-bold uppercase tracking-wider">Per Person (PP)</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
              {formattedPP}
            </div>
            <div className="text-[11px] text-emerald-400/70 mt-0.5">
              {session.players.length > 0 ? `Split across ${session.players.length} players` : '0 players in list'}
            </div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        {totalCount > 0 && (
          <div className="glass-panel rounded-2xl p-3 border border-zinc-800/80">
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
              <span className="text-zinc-400">Payment Collection Progress</span>
              <span className={allPaid ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>
                {paidCount} of {totalCount} Paid ({Math.round((paidCount / totalCount) * 100)}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden p-0.5">
              <motion.div
                initial={false}
                animate={{ width: `${(paidCount / totalCount) * 100}%` }}
                transition={{ duration: 0.3 }}
                className={`h-full rounded-full ${
                  allPaid ? 'bg-gradient-to-r from-emerald-500 to-green-400 shadow-neon' : 'bg-emerald-500'
                }`}
              />
            </div>
          </div>
        )}

        {/* QR CODE SECTION (Center Top) */}
        <section className="glass-panel rounded-3xl p-5 border border-zinc-800 shadow-xl flex flex-col items-center text-center">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="relative mb-4 group">
            {session.qrCodeImage ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/40 p-2 bg-zinc-950/90 shadow-neon max-w-[200px] max-h-[200px] flex items-center justify-center">
                <img
                  src={session.qrCodeImage}
                  alt="Turf Payment QR Code"
                  className="w-44 h-44 object-contain rounded-xl"
                />
              </div>
            ) : (
              /* Placeholder box saying "No QR Code Added" */
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-44 h-44 rounded-2xl border-2 border-dashed border-zinc-700 hover:border-emerald-500/60 bg-zinc-900/60 hover:bg-zinc-900 flex flex-col items-center justify-center p-4 transition-all duration-200 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 group-hover:bg-emerald-500/15 group-hover:text-emerald-400 text-zinc-400 flex items-center justify-center mb-2.5 transition">
                  <QrCode className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 group-hover:text-white transition">
                  No QR Code Added
                </span>
                <span className="text-[11px] text-zinc-500 mt-1">
                  Click to upload
                </span>
              </div>
            )}
          </div>

          {/* CHANGE QR CODE button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/60 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>CHANGE QR CODE</span>
          </button>
        </section>

        {/* PLAYER'S LIST SECTION (Center Bottom) */}
        <section className="glass-panel rounded-3xl p-5 border border-zinc-800 shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                PLAYER'S LIST
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                {session.players.length}
              </span>
            </div>

            <button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:scale-105 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showQuickAdd ? 'Cancel' : 'Quick Add'}</span>
            </button>
          </div>

          {/* Quick Add Player Input Drawer inside list */}
          <AnimatePresence>
            {showQuickAdd && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleQuickAdd}
                className="mb-4 overflow-hidden"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quickAddName}
                    onChange={(e) => setQuickAddName(e.target.value)}
                    placeholder="Player name..."
                    className="flex-1 px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!quickAddName.trim()}
                    className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Dynamic List Rendering */}
          {session.players.length === 0 ? (
            /* Empty State */
            <div className="py-10 px-4 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
              <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2.5" />
              <p className="text-sm font-semibold text-zinc-300">No Players Added Yet</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                Click "Quick Add" above or open the top-right menu to add players to this match.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {session.players.map((player) => {
                const isPaid = player.hasPaid;
                return (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${
                      isPaid
                        ? 'bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_15px_-4px_rgba(34,197,94,0.15)]'
                        : 'bg-zinc-900/80 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    {/* Left: Player's Name */}
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isPaid 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={`text-sm font-semibold truncate transition-colors ${
                        isPaid ? 'text-emerald-300 line-through opacity-85' : 'text-zinc-100'
                      }`}>
                        {player.name}
                      </span>
                    </div>

                    {/* Center: The "PP" (Per Person) Amount */}
                    <div className="px-2 shrink-0">
                      <span className={`text-xs sm:text-sm font-mono font-bold px-2.5 py-1 rounded-lg transition-colors ${
                        isPaid
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/50'
                      }`}>
                        {formattedPP}
                      </span>
                    </div>

                    {/* Right: Checkbox toggling hasPaid */}
                    <div className="shrink-0 pl-1">
                      <button
                        type="button"
                        onClick={() => handleTogglePayment(player.id)}
                        title={isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                        aria-label={`Toggle payment for ${player.name}`}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
                          isPaid
                            ? 'bg-emerald-500 border-emerald-400 text-zinc-950 shadow-neon'
                            : 'bg-zinc-800/80 border-zinc-700 hover:border-emerald-500/70 text-transparent'
                        }`}
                      >
                        <Check className={`w-4 h-4 stroke-[3] transition-transform ${isPaid ? 'scale-100 text-zinc-950' : 'scale-0'}`} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer Credit */}
        <footer className="py-4 text-center">
          <p className="text-xs text-zinc-500 font-medium tracking-wide">
            Made with <span className="text-red-500">❤️</span> by <span className="text-zinc-400 font-semibold">Waqqas Mulla</span>
          </p>
        </footer>

      </div>

      {/* Slide-Out Menu Drawer */}
      <SlideOutMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        session={session}
        onUpdateSession={onUpdateSession}
        onLogout={onLogout}
      />
    </div>
  );
};
