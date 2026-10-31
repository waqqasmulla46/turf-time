import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  UserPlus, 
  UserMinus, 
  IndianRupee, 
  QrCode, 
  Trash2, 
  Upload, 
  LogOut, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';
import type { TurfSession, Player } from '../types/turf';
import { compressImageToBase64 } from '../utils/storage';

interface SlideOutMenuProps {
  isOpen: boolean;
  onClose: () => void;
  session: TurfSession;
  onUpdateSession: (updated: TurfSession) => void;
  onLogout: () => void;
}

type ActiveSection = null | 'add_player' | 'remove_player' | 'total_money' | 'qr_code';

export const SlideOutMenu: React.FC<SlideOutMenuProps> = ({
  isOpen,
  onClose,
  session,
  onUpdateSession,
  onLogout
}) => {
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [addPlayerError, setAddPlayerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Player Handler
  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPlayerName.trim();
    if (!trimmed) {
      setAddPlayerError('Player name cannot be empty');
      return;
    }

    // Check duplicate name
    if (session.players.some(p => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setAddPlayerError('A player with this name already exists');
      return;
    }

    const nextId = session.players.length > 0 
      ? Math.max(...session.players.map(p => p.id)) + 1 
      : 1;

    const newPlayer: Player = {
      id: nextId,
      name: trimmed,
      hasPaid: false,
    };

    onUpdateSession({
      ...session,
      players: [...session.players, newPlayer],
    });

    setNewPlayerName('');
    setAddPlayerError(null);
  };

  // Remove Player Handler
  const handleRemovePlayer = (id: number) => {
    onUpdateSession({
      ...session,
      players: session.players.filter(p => p.id !== id),
    });
  };

  // Total Money Change Handler
  const handleTotalMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const updatedCost = isNaN(val) || val < 0 ? 0 : val;
    onUpdateSession({
      ...session,
      totalMoney: updatedCost,
    });
  };

  // QR Code Image Upload Handler with compression
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        qrCodeImage: base64Data,
      });
    } catch (err) {
      console.error('Failed to compress image:', err);
      alert('Failed to process image. Please try another image.');
    }
  };

  const handleRemoveQrCode = () => {
    onUpdateSession({
      ...session,
      qrCodeImage: null,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
          />

          {/* Drawer content sliding from right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-full max-w-sm h-full bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col z-10 overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90 backdrop-blur-md">
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">SETTINGS & ACTIONS</h2>
                <p className="text-xs text-zinc-400">Turf Code: <span className="font-mono text-emerald-400 font-bold">{session.code}</span></p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {/* SECTION: ADD PLAYER */}
              <div className="border border-zinc-800 rounded-2xl bg-zinc-950/50 overflow-hidden">
                <button
                  onClick={() => setActiveSection(activeSection === 'add_player' ? null : 'add_player')}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-800/40 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-zinc-100">ADD PLAYER</span>
                      <p className="text-[11px] text-zinc-400">Add a new player to this turf match</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-zinc-400 transition-transform ${activeSection === 'add_player' ? 'rotate-90' : ''}`} />
                </button>

                <AnimatePresence>
                  {activeSection === 'add_player' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 pt-1 border-t border-zinc-800/60"
                    >
                      <form onSubmit={handleAddPlayer} className="space-y-3 mt-2">
                        <div>
                          <input
                            type="text"
                            value={newPlayerName}
                            onChange={(e) => {
                              setNewPlayerName(e.target.value);
                              setAddPlayerError(null);
                            }}
                            placeholder="Enter player name..."
                            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            autoFocus
                          />
                          {addPlayerError && (
                            <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{addPlayerError}</span>
                            </p>
                          )}
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 px-3 bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition duration-150 active:scale-95 shadow-neon cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>CONFIRM ADD PLAYER</span>
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SECTION: REMOVE PLAYER */}
              <div className="border border-zinc-800 rounded-2xl bg-zinc-950/50 overflow-hidden">
                <button
                  onClick={() => setActiveSection(activeSection === 'remove_player' ? null : 'remove_player')}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-800/40 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                      <UserMinus className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-zinc-100">REMOVE PLAYER</span>
                      <p className="text-[11px] text-zinc-400">{session.players.length} players currently in list</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-zinc-400 transition-transform ${activeSection === 'remove_player' ? 'rotate-90' : ''}`} />
                </button>

                <AnimatePresence>
                  {activeSection === 'remove_player' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 pt-1 border-t border-zinc-800/60 max-h-60 overflow-y-auto"
                    >
                      {session.players.length === 0 ? (
                        <p className="text-xs text-zinc-500 italic py-3 text-center">No players to remove.</p>
                      ) : (
                        <div className="space-y-2 mt-2">
                          {session.players.map((player) => (
                            <div
                              key={player.id}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80"
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <span className="text-xs font-medium text-zinc-200 truncate">{player.name}</span>
                                {player.hasPaid && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                                    PAID
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemovePlayer(player.id)}
                                title={`Remove ${player.name}`}
                                className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 flex items-center justify-center transition active:scale-95 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SECTION: TOTAL MONEY */}
              <div className="border border-zinc-800 rounded-2xl bg-zinc-950/50 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-zinc-100">TOTAL MONEY</span>
                    <p className="text-[11px] text-zinc-400">Update total turf booking cost</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400 font-bold">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={session.totalMoney === 0 ? '' : session.totalMoney}
                    onChange={handleTotalMoneyChange}
                    placeholder="Enter total turf cost (e.g. 1500)"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-base font-bold text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  Changing this instantly updates the Per Person (PP) calculation for all players.
                </p>
              </div>

              {/* SECTION: ADD / CHANGE QR CODE */}
              <div className="border border-zinc-800 rounded-2xl bg-zinc-950/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-zinc-100">PAYMENT QR CODE</span>
                      <p className="text-[11px] text-zinc-400">
                        {session.qrCodeImage ? 'QR Code uploaded' : 'No QR Code uploaded yet'}
                      </p>
                    </div>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700 hover:border-emerald-500/50 font-semibold text-xs uppercase tracking-wider rounded-xl transition duration-150 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{session.qrCodeImage ? 'CHANGE QR CODE' : 'ADD QR CODE'}</span>
                  </button>

                  {session.qrCodeImage && (
                    <button
                      type="button"
                      onClick={handleRemoveQrCode}
                      className="w-full py-2 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove QR Code</span>
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Drawer Footer - Switch / Logout session */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-950/80">
              <button
                onClick={onLogout}
                className="w-full py-2.5 px-3 text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-transparent hover:border-zinc-700 rounded-xl transition text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Switch / Exit Code ({session.code})</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
