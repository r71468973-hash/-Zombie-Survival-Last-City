import React from 'react';
import { Play, RotateCcw, Home, Settings, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../../services/sound';

interface PauseModalProps {
  isOpen: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResume: () => void;
  onRestart: () => void;
  onQuitToMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  soundEnabled,
  onToggleSound,
  onResume,
  onRestart,
  onQuitToMenu,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-950 border-2 border-red-600/60 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
        <div className="text-center mb-6">
          <span className="text-xs font-mono uppercase tracking-widest text-red-500 font-bold">
            TACTICAL SUSPENSION
          </span>
          <h2 className="text-3xl font-heading font-black uppercase text-white mt-1">
            GAME PAUSED
          </h2>
          <div className="w-12 h-1 bg-red-600 mx-auto mt-2 rounded-full" />
        </div>

        <div className="flex flex-col gap-3">
          {/* Resume */}
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-amber-500 text-white rounded-xl font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 active:scale-95 transition-all"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Resume Combat</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl font-heading font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Audio: Enabled</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span>Audio: Muted</span>
              </>
            )}
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl font-heading font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Restart Sector</span>
          </button>

          {/* Quit to Home */}
          <button
            onClick={() => {
              sound.playClick();
              onQuitToMenu();
            }}
            className="w-full py-3 px-4 bg-slate-900/60 hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-slate-800 rounded-xl font-heading font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Safehouse</span>
          </button>
        </div>
      </div>
    </div>
  );
};
