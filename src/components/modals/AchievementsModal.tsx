import React from 'react';
import { Achievement } from '../../types/game';
import { Trophy, Coins, Gem, Check, X, Award } from 'lucide-react';
import { sound } from '../../services/sound';
import { AdMobBanner } from '../ads/AdMobBanner';

interface AchievementsModalProps {
  isOpen: boolean;
  achievements: Achievement[];
  onClaim: (achievementId: string) => void;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  achievements,
  onClaim,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 select-none animate-fadeIn">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-950/80 border border-yellow-500/50 flex items-center justify-center text-yellow-500">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-yellow-400 font-bold uppercase tracking-wider">
              SURVIVOR REPUTATION
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-white uppercase">
              HONOR & ACHIEVEMENTS
            </h2>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* List */}
      <div className="max-w-4xl mx-auto w-full flex-1 overflow-y-auto py-4 space-y-3">
        {achievements.map((ach) => {
          const progressPct = Math.min(100, Math.round((ach.current / ach.target) * 100));
          const canClaim = ach.completed && !ach.claimed;

          return (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                ach.claimed
                  ? 'bg-slate-950/60 border-slate-900 opacity-60'
                  : canClaim
                  ? 'bg-yellow-950/20 border-yellow-500/60 shadow-lg shadow-yellow-950/30'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-base text-white">
                    {ach.title}
                  </h3>
                  {ach.claimed && (
                    <span className="text-[10px] font-mono text-emerald-400 uppercase border border-emerald-500/30 px-1 rounded">
                      CLAIMED
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-0.5">
                  {ach.description}
                </p>

                {/* Progress bar */}
                <div className="flex items-center gap-2 mt-2 max-w-sm">
                  <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                    {ach.current} / {ach.target}
                  </span>
                </div>
              </div>

              {/* Reward & Claim Button */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Coins className="w-3.5 h-3.5" /> +{ach.rewardCoins}
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400 font-bold">
                    <Gem className="w-3.5 h-3.5" /> +{ach.rewardGems}
                  </span>
                </div>

                <button
                  onClick={() => {
                    sound.playPickup();
                    onClaim(ach.id);
                  }}
                  disabled={!canClaim}
                  className={`px-4 py-2 rounded-lg text-xs font-heading font-bold uppercase transition-all ${
                    ach.claimed
                      ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-default'
                      : canClaim
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-amber-950/50 hover:brightness-110 active:scale-95'
                      : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  {ach.claimed ? 'Claimed' : canClaim ? 'Claim Award' : 'In Progress'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AdMob Banner at bottom */}
      <div className="max-w-4xl mx-auto w-full pt-2">
        <AdMobBanner screenName="Achievements Screen" />
      </div>
    </div>
  );
};
