import React from 'react';
import { Trophy, Coins, Zap, ArrowRight, Award, CheckCircle2 } from 'lucide-react';
import { sound } from '../../services/sound';

interface MissionCompleteModalProps {
  isOpen: boolean;
  kills: number;
  score: number;
  coinsEarned: number;
  xpEarned: number;
  accuracy: number;
  missionTitle: string;
  onContinue: () => void;
  onWatchRewardedAd: () => void;
}

export const MissionCompleteModal: React.FC<MissionCompleteModalProps> = ({
  isOpen,
  kills,
  score,
  coinsEarned,
  xpEarned,
  accuracy,
  missionTitle,
  onContinue,
  onWatchRewardedAd,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="w-full max-w-md bg-slate-950 border-2 border-amber-500/80 shadow-[0_0_70px_rgba(245,158,11,0.35)] rounded-2xl p-6 text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Victory Icon Trophy */}
        <div className="flex justify-center mb-3">
          <div className="w-18 h-18 rounded-2xl bg-amber-950/70 border-2 border-amber-500 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950/60 p-3">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2.5 py-0.5 rounded-full mb-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
          <span>SECTOR CLEARED</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-heading font-black uppercase text-white tracking-wide">
          MISSION COMPLETE
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
          {missionTitle}
        </p>

        {/* Mission Stats Breakdown */}
        <div className="grid grid-cols-2 gap-2.5 my-5 bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-left">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">ZOMBIES DEFEATED</span>
            <span className="text-lg font-mono font-bold text-white tabular-nums">
              {kills} Kills
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">ACCURACY RATING</span>
            <span className="text-lg font-mono font-bold text-sky-400 tabular-nums">
              {accuracy}%
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

        {/* AdMob Rewarded Bonus Button */}
        <div className="mb-4">
          <button
            onClick={() => {
              sound.playClick();
              onWatchRewardedAd();
            }}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600/50 hover:to-amber-500/40 border border-amber-500/50 rounded-xl text-amber-300 font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Watch AdMob Video for 2x Coins (+{coinsEarned || 250})</span>
          </button>
        </div>

        {/* Primary CONTINUE Button */}
        <button
          onClick={() => {
            sound.playClick();
            onContinue();
          }}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-heading font-black text-base uppercase tracking-wider rounded-xl shadow-lg shadow-amber-950/60 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>CONTINUE</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
