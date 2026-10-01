import React from 'react';
import { Skull, Coins, Zap, RotateCcw, Home, Award, ShieldAlert } from 'lucide-react';
import { sound } from '../../services/sound';

interface GameOverModalProps {
  isOpen: boolean;
  kills: number;
  score: number;
  coinsEarned: number;
  xpEarned: number;
  accuracy: number;
  onRestart: () => void;
  onQuitToMenu: () => void;
  onWatchRewardedAd: () => void;
  canRevive?: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  kills,
  score,
  coinsEarned,
  xpEarned,
  accuracy,
  onRestart,
  onQuitToMenu,
  onWatchRewardedAd,
  canRevive = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="w-full max-w-md bg-slate-950 border-2 border-red-600/90 shadow-[0_0_70px_rgba(239,68,68,0.45)] rounded-2xl p-6 text-center relative overflow-hidden">
        {/* Blood vignette backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 to-transparent pointer-events-none" />

        {/* Skull Icon */}
        <div className="flex justify-center mb-3">
          <div className="w-18 h-18 rounded-2xl bg-red-950/80 border-2 border-red-600 flex items-center justify-center text-red-500 shadow-xl shadow-red-950 p-3">
            <Skull className="w-10 h-10 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest font-bold text-red-500 bg-red-950/40 border border-red-500/30 px-2.5 py-0.5 rounded-full mb-1">
          <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
          <span>SURVIVOR DOWN</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-white tracking-wide">
          MISSION FAILED
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          VITAL SIGNS TERMINATED · RETREAT & REGROUP
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-5 bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-left">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">ZOMBIES DEFEATED</span>
            <span className="text-lg font-mono font-bold text-white tabular-nums">
              {kills} Kills
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">SURVIVAL SCORE</span>
            <span className="text-lg font-mono font-bold text-sky-400 tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">COINS EARNED</span>
            <span className="text-lg font-mono font-bold text-amber-400 flex items-center gap-1 tabular-nums">
              <Coins className="w-4 h-4" /> +{coinsEarned}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">XP EARNED</span>
            <span className="text-lg font-mono font-bold text-emerald-400 flex items-center gap-1 tabular-nums">
              <Zap className="w-4 h-4" /> +{xpEarned} XP
            </span>
          </div>
        </div>

        {/* AdMob Revive Button */}
        {canRevive && (
          <div className="mb-4">
            <button
              onClick={() => {
                sound.playClick();
                onWatchRewardedAd();
              }}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600/50 hover:to-amber-500/40 border border-amber-500/50 rounded-xl text-amber-300 font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Watch Ad to Revive with 100% Health</span>
            </button>
          </div>
        )}

        {/* Action Buttons: RETRY and EXIT TO HOME */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-amber-500 text-white font-heading font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-red-950 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RETRY</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onQuitToMenu();
            }}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl font-heading font-semibold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>EXIT TO HOME</span>
          </button>
        </div>
      </div>
    </div>
  );
};
