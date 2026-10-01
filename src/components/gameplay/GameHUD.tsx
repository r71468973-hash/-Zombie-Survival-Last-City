import React from 'react';
import { Mission, Weapon, WeaponId } from '../../types/game';
import { Heart, Shield, Pause, Flame, Crosshair, Bomb, Plus, RotateCw } from 'lucide-react';
import { sound } from '../../services/sound';

interface GameHUDProps {
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  currentWeapon: Weapon;
  allWeapons: Weapon[];
  currentMag: number;
  reserveAmmo: number;
  isReloading: boolean;
  reloadProgress: number;
  mission: Mission;
  killCount: number;
  score: number;
  coinsEarned: number;
  grenadesCount: number;
  medkitsCount: number;
  onPause: () => void;
  onReload: () => void;
  onSwitchWeapon: (id: WeaponId) => void;
  onUseGrenade: () => void;
  onUseMedkit: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  health,
  maxHealth,
  armor,
  maxArmor,
  currentWeapon,
  allWeapons,
  currentMag,
  reserveAmmo,
  isReloading,
  reloadProgress,
  mission,
  killCount,
  score,
  coinsEarned,
  grenadesCount,
  medkitsCount,
  onPause,
  onReload,
  onSwitchWeapon,
  onUseGrenade,
  onUseMedkit,
}) => {
  const healthPercent = Math.max(0, Math.min(100, Math.round((health / maxHealth) * 100)));
  const armorPercent = Math.max(0, Math.min(100, Math.round((armor / maxArmor) * 100)));
  const objectivePercent = Math.min(100, Math.round((killCount / mission.targetKills) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 sm:p-4 select-none">
      {/* TOP HUD BAR */}
      <div className="flex items-start justify-between gap-2 pointer-events-auto">
        {/* Left: Health & Armor Indicators */}
        <div className="flex flex-col gap-1.5 bg-slate-950/85 border border-slate-800/80 rounded-xl p-2.5 backdrop-blur-md shadow-lg w-52 sm:w-64">
          {/* Health Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono mb-0.5">
              <span className="flex items-center gap-1 text-red-400 font-bold">
                <Heart className="w-3.5 h-3.5 fill-red-500/40 text-red-500" />
                VITALITY
              </span>
              <span className="text-white font-bold tabular-nums">
                {Math.ceil(health)} / {maxHealth}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-200 ${
                  healthPercent < 30
                    ? 'bg-red-600 animate-pulse'
                    : healthPercent < 60
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${healthPercent}%` }}
              />
            </div>
          </div>

          {/* Armor Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono mb-0.5">
              <span className="flex items-center gap-1 text-sky-400 font-bold">
                <Shield className="w-3.5 h-3.5 fill-sky-500/40 text-sky-400" />
                KEVLAR
              </span>
              <span className="text-white font-bold tabular-nums">
                {Math.ceil(armor)} / {maxArmor}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-sky-400 transition-all duration-200"
                style={{ width: `${armorPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Mission Objective Tracker */}
        <div className="hidden sm:flex flex-col items-center bg-slate-950/85 border border-slate-800/80 rounded-xl px-4 py-2 backdrop-blur-md shadow-lg max-w-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
            MISSION DIRECTIVE
          </span>
          <div className="text-xs font-heading font-bold text-white text-center mt-0.5 truncate max-w-[200px]">
            {mission.title}
          </div>
          <div className="flex items-center gap-2 mt-1 w-full">
            <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-red-500 transition-all duration-200"
                style={{ width: `${objectivePercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-red-400 tabular-nums">
              {killCount}/{mission.targetKills}
            </span>
          </div>
        </div>

        {/* Right: Score, Coins & Pause Button */}
        <div className="flex items-center gap-2">
          {/* Run Score & Coins */}
          <div className="bg-slate-950/85 border border-slate-800/80 rounded-xl px-3 py-1.5 backdrop-blur-md shadow-lg flex flex-col items-end">
            <span className="text-[10px] font-mono text-slate-400">SCORE</span>
            <span className="text-sm font-mono font-bold text-amber-300 tabular-nums">
              {score.toLocaleString()}
            </span>
            <div className="text-[10px] font-mono text-emerald-400 font-semibold">
              +{coinsEarned} Coins
            </div>
          </div>

          {/* Pause Button */}
          <button
            onClick={() => {
              sound.playClick();
              onPause();
            }}
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 hover:text-white shadow-lg transition-colors active:scale-95"
            title="Pause Game"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MOBILE MINI DIRECTIVE BADGE (Visible only on small phones) */}
      <div className="sm:hidden flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 backdrop-blur-sm self-center pointer-events-auto">
        <span className="text-[10px] font-mono text-amber-400 font-bold mr-2">
          KILLS:
        </span>
        <span className="text-xs font-mono font-bold text-red-400">
          {killCount} / {mission.targetKills}
        </span>
      </div>

      {/* BOTTOM RIGHT: WEAPON STATUS & AMMO COUNTER */}
      <div className="flex items-end justify-between gap-4 pointer-events-auto">
        {/* Left side utility buttons: Quick Medkit & Grenade */}
        <div className="flex flex-col gap-2 pointer-events-auto mb-20 sm:mb-4">
          {/* Quick Medkit */}
          <button
            onClick={() => {
              sound.playClick();
              onUseMedkit();
            }}
            disabled={medkitsCount <= 0 || health >= maxHealth}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-md shadow-lg transition-all active:scale-95 ${
              medkitsCount > 0 && health < maxHealth
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/90'
                : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <Plus className="w-5 h-5 text-emerald-400" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-mono uppercase leading-none font-bold">MEDKIT</span>
              <span className="text-xs font-mono font-bold leading-none mt-0.5">x{medkitsCount}</span>
            </div>
          </button>

          {/* Quick Frag Grenade */}
          <button
            onClick={() => {
              sound.playClick();
              onUseGrenade();
            }}
            disabled={grenadesCount <= 0}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-md shadow-lg transition-all active:scale-95 ${
              grenadesCount > 0
                ? 'bg-red-950/80 border-red-500/50 text-red-300 hover:bg-red-900/90'
                : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <Bomb className="w-5 h-5 text-red-400" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-mono uppercase leading-none font-bold">GRENADE</span>
              <span className="text-xs font-mono font-bold leading-none mt-0.5">x{grenadesCount}</span>
            </div>
          </button>
        </div>

        {/* Right side: Ammo Card & Weapon Switchers */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          {/* Quick Weapon Switch Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 rounded-xl p-1 backdrop-blur-md shadow-md">
            {allWeapons.map((wpn) => {
              const isSelected = wpn.id === currentWeapon.id;
              if (!wpn.unlocked) return null;
              return (
                <button
                  key={wpn.id}
                  onClick={() => {
                    sound.playClick();
                    onSwitchWeapon(wpn.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-heading font-bold uppercase transition-all ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {wpn.id}
                </button>
              );
            })}
          </div>

          {/* Ammo & Reload Display Card */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 backdrop-blur-md shadow-xl flex items-center gap-4 min-w-[170px] justify-between">
            <div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 uppercase">
                <span>{currentWeapon.category}</span>
              </div>
              <div className="text-sm font-heading font-bold text-white truncate max-w-[110px]">
                {currentWeapon.name}
              </div>
            </div>

            <div className="text-right">
              {isReloading ? (
                <div className="flex items-center gap-1 text-amber-400 font-mono text-xs font-bold animate-pulse">
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>RELOADING</span>
                </div>
              ) : (
                <div className="font-mono">
                  <span className={`text-2xl font-black ${currentMag <= 3 ? 'text-red-500 animate-bounce' : 'text-white'}`}>
                    {currentMag}
                  </span>
                  <span className="text-xs text-slate-400 font-bold"> / {reserveAmmo}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
