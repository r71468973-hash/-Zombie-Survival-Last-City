import React from 'react';
import { Mission, PlayerStats } from '../../types/game';
import { Crosshair, ShieldAlert, Coins, Zap, CheckCircle2, Lock, ArrowRight, X } from 'lucide-react';
import { sound } from '../../services/sound';
import { AdMobBanner } from '../ads/AdMobBanner';

interface MissionsModalProps {
  isOpen: boolean;
  missions: Mission[];
  activeMissionId: string;
  playerStats: PlayerStats;
  onSelectMission: (missionId: string) => void;
  onDeploy: (missionId: string) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  isOpen,
  missions,
  activeMissionId,
  playerStats,
  onSelectMission,
  onDeploy,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 select-none animate-fadeIn">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-500">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">
              OPERATIONS DISPATCH
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-white uppercase">
              CAMPAIGN SECTORS
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

      {/* Main Missions List */}
      <div className="max-w-4xl mx-auto w-full flex-1 overflow-y-auto py-4 space-y-3">
        {missions.map((mission) => {
          const isSelected = mission.id === activeMissionId;
          const isLocked = !mission.unlocked && !mission.completed;

          return (
            <div
              key={mission.id}
              className={`p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-slate-900/90 border-red-500 shadow-lg shadow-red-950/40'
                  : isLocked
                  ? 'bg-slate-950/60 border-slate-900 opacity-60'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                      {mission.sector}
                    </span>
                    <span className={`text-[10px] font-heading font-bold px-1.5 py-0.5 rounded ${
                      mission.difficulty === 'EASY'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                        : mission.difficulty === 'MEDIUM'
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                        : 'bg-red-950/60 text-red-400 border border-red-500/30'
                    }`}>
                      {mission.difficulty}
                    </span>
                    {mission.completed && (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> SECURED
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-bold text-lg text-white">
                    {mission.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {mission.description}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs">
                    <div className="flex items-center gap-1 text-slate-300">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      <span>Target: <strong className="text-white">{mission.targetKills} Infected</strong></span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400 font-mono font-semibold">
                      <Coins className="w-3.5 h-3.5" />
                      <span>+{mission.rewardCoins}</span>
                    </div>

                    <div className="flex items-center gap-1 text-sky-400 font-mono font-semibold">
                      <Zap className="w-3.5 h-3.5" />
                      <span>+{mission.rewardXp} XP</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  {isLocked ? (
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-500 rounded-lg text-xs font-mono">
                      <Lock className="w-3.5 h-3.5" />
                      <span>LOCKED</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          sound.playClick();
                          onSelectMission(mission.id);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-heading font-bold uppercase transition-colors ${
                          isSelected
                            ? 'bg-slate-800 text-red-400 border border-red-500/40'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>

                      <button
                        onClick={() => {
                          sound.playClick();
                          onDeploy(mission.id);
                        }}
                        className="px-5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-lg text-xs font-heading font-bold uppercase flex items-center justify-center gap-1.5 shadow-md shadow-red-950 active:scale-95 transition-all"
                      >
                        <span>Deploy</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AdMob Banner at bottom */}
      <div className="max-w-4xl mx-auto w-full pt-2">
        <AdMobBanner screenName="Operations Missions" />
      </div>
    </div>
  );
};
