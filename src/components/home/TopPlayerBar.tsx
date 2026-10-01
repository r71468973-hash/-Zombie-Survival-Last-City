import React from 'react';
import { PlayerStats } from '../../types/game';
import { Shield, Heart, Coins, Gem, Volume2, VolumeX, Settings } from 'lucide-react';
import { sound } from '../../services/sound';

interface TopPlayerBarProps {
  player: PlayerStats;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
}

export const TopPlayerBar: React.FC<TopPlayerBarProps> = ({
  player,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
}) => {
  const xpPercent = Math.min(100, Math.round((player.xp / player.xpToNextLevel) * 100));

  return (
    <header className="w-full bg-gradient-to-b from-slate-950/95 via-slate-900/90 to-transparent pt-2 pb-3 px-3 sm:px-6 relative z-30 select-none border-b border-slate-800/60">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Player Profile & Level */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-red-600 to-amber-600 p-0.5 shadow-md shadow-red-950/60 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[6px] flex flex-col items-center justify-center">
                <span className="text-[10px] text-amber-400 font-bold uppercase leading-none">LVL</span>
                <span className="text-base sm:text-lg font-heading font-black text-white leading-none mt-0.5">
                  {player.level}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm sm:text-base text-slate-100 tracking-wide truncate">
                SURVIVOR S-07
              </span>
              <span className="text-[10px] uppercase font-semibold text-red-400 border border-red-500/30 px-1 py-0.2 rounded bg-red-950/30">
                ACTIVE
              </span>
            </div>

            {/* XP progress bar */}
            <div className="flex items-center gap-1.5 w-24 sm:w-36 mt-0.5">
              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                {xpPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Center: Health & Armor stats */}
        <div className="hidden md:flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-red-500 fill-red-500/30" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 leading-none">VITALITY</span>
              <span className="text-xs font-mono font-bold text-red-400 tabular-nums">
                {player.health}/{player.maxHealth}
              </span>
            </div>
          </div>

          <div className="w-px h-6 bg-slate-800" />

          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-sky-400 fill-sky-400/30" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 leading-none">ARMOR</span>
              <span className="text-xs font-mono font-bold text-sky-400 tabular-nums">
                {player.armor}/{player.maxArmor}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Currencies & Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Coins */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-amber-500/40 rounded-lg px-2 sm:px-2.5 py-1 shadow-sm">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span className="font-mono font-bold text-xs sm:text-sm text-amber-300 tabular-nums">
              {player.coins.toLocaleString()}
            </span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-cyan-500/40 rounded-lg px-2 sm:px-2.5 py-1 shadow-sm">
            <Gem className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            <span className="font-mono font-bold text-xs sm:text-sm text-cyan-300 tabular-nums">
              {player.gems}
            </span>
          </div>

          {/* Audio toggle button */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            className="p-1.5 sm:p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
            title={soundEnabled ? 'Mute Game Audio' : 'Unmute Game Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Settings button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="p-1.5 sm:p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
            title="Game Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
