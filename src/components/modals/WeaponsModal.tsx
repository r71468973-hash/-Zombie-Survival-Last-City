import React, { useState } from 'react';
import { PlayerStats, Weapon, WeaponId } from '../../types/game';
import { Wrench, Shield, Crosshair, Zap, Coins, Check, ArrowUpRight, X, Lock } from 'lucide-react';
import { sound } from '../../services/sound';
import { AdMobBanner } from '../ads/AdMobBanner';

interface WeaponsModalProps {
  isOpen: boolean;
  weapons: Weapon[];
  playerStats: PlayerStats;
  onEquipWeapon: (id: WeaponId) => void;
  onUpgradeWeapon: (id: WeaponId) => void;
  onUnlockWeapon: (id: WeaponId) => void;
  onClose: () => void;
}

export const WeaponsModal: React.FC<WeaponsModalProps> = ({
  isOpen,
  weapons,
  playerStats,
  onEquipWeapon,
  onUpgradeWeapon,
  onUnlockWeapon,
  onClose,
}) => {
  const [selectedWeaponId, setSelectedWeaponId] = useState<WeaponId>(playerStats.selectedWeaponId);

  if (!isOpen) return null;

  const currentWeapon = weapons.find((w) => w.id === selectedWeaponId) || weapons[0];
  const upgradeCost = Math.round(350 * Math.pow(1.6, currentWeapon.level - 1));
  const canAffordUpgrade = playerStats.coins >= upgradeCost && currentWeapon.level < 5;
  const canAffordUnlock = playerStats.coins >= currentWeapon.cost;
  const isEquipped = playerStats.selectedWeaponId === currentWeapon.id;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 select-none animate-fadeIn">
      {/* Top Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-500">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">
              SURVIVAL ARSENAL
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-white uppercase">
              WEAPONS WORKBENCH
            </h2>
          </div>
        </div>

        {/* Player Currency in Armory */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-amber-500/40 px-3 py-1 rounded-lg">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-amber-300 text-sm">
              {playerStats.coins.toLocaleString()}
            </span>
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
      </div>

      {/* Main Armory Content */}
      <div className="max-w-5xl mx-auto w-full flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 py-4 overflow-y-auto">
        {/* Left Column: Weapon Selection List */}
        <div className="md:col-span-5 space-y-2">
          {weapons.map((w) => {
            const isSelected = w.id === selectedWeaponId;
            const isCurrentlyEquipped = playerStats.selectedWeaponId === w.id;

            return (
              <button
                key={w.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedWeaponId(w.id);
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-slate-900/90 border-red-500 shadow-md shadow-red-950/40'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    w.unlocked ? 'bg-slate-900 text-red-400' : 'bg-slate-950 text-slate-600'
                  }`}>
                    {w.unlocked ? <Crosshair className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-white">{w.name}</span>
                      {isCurrentlyEquipped && (
                        <span className="text-[9px] font-mono bg-red-600 text-white px-1 py-0.2 rounded font-bold">
                          EQUIPPED
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {w.category} · LVL {w.level}
                    </span>
                  </div>
                </div>

                {!w.unlocked && (
                  <div className="flex items-center gap-1 text-xs font-mono text-amber-400">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{w.cost}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Column: Weapon Showcase & Upgrades */}
        <div className="md:col-span-7 flex flex-col justify-between bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
          {/* Backdrop Armory Art */}
          <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
            <img
              src="/src/assets/images/game_armory_showcase_1790842484961.jpg"
              alt="Armory"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          </div>

          <div className="relative z-10">
            {/* Weapon Title & Specs Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-red-400 uppercase font-semibold">
                  {currentWeapon.category}
                </span>
                <h3 className="text-2xl font-heading font-black text-white">
                  {currentWeapon.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-md">
                  {currentWeapon.description}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400">TIER LEVEL</span>
                <div className="text-xl font-heading font-black text-amber-400">
                  LEVEL {currentWeapon.level} / 5
                </div>
              </div>
            </div>

            {/* Performance Stat Meters */}
            <div className="space-y-3 my-5">
              {/* Damage */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">STOPPING DAMAGE</span>
                  <span className="text-red-400 font-bold">{currentWeapon.damage} DPS</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${Math.min(100, (currentWeapon.damage / 160) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Fire Rate */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">FIRE RATE</span>
                  <span className="text-amber-400 font-bold">{Math.round(1000 / currentWeapon.fireRateMs)} RPM</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${Math.min(100, (1000 / currentWeapon.fireRateMs) * 10)}%` }}
                  />
                </div>
              </div>

              {/* Mag Capacity */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">MAGAZINE CAPACITY</span>
                  <span className="text-sky-400 font-bold">{currentWeapon.magCapacity} Rounds</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-sky-500"
                    style={{ width: `${Math.min(100, (currentWeapon.magCapacity / 30) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Reload Speed */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-300">RELOAD DURATION</span>
                  <span className="text-emerald-400 font-bold">{(currentWeapon.reloadTimeMs / 1000).toFixed(1)}s</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${Math.max(20, 100 - (currentWeapon.reloadTimeMs / 2600) * 70)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Unlock, Upgrade, Equip */}
          <div className="relative z-10 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            {!currentWeapon.unlocked ? (
              <button
                onClick={() => {
                  sound.playPickup();
                  onUnlockWeapon(currentWeapon.id);
                }}
                disabled={!canAffordUnlock}
                className={`w-full py-3 rounded-xl font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-sm transition-all ${
                  canAffordUnlock
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-950 active:scale-95'
                    : 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800'
                }`}
              >
                <Coins className="w-4 h-4" />
                <span>Unlock Weapon for {currentWeapon.cost} Coins</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    sound.playClick();
                    onUpgradeWeapon(currentWeapon.id);
                  }}
                  disabled={!canAffordUpgrade}
                  className={`flex-1 py-3 px-4 rounded-xl font-heading font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                    canAffordUpgrade
                      ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/50 shadow-md active:scale-95'
                      : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>
                    {currentWeapon.level >= 5 ? 'MAX LEVEL' : `UPGRADE — ${upgradeCost} COINS`}
                  </span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    onEquipWeapon(currentWeapon.id);
                  }}
                  disabled={isEquipped}
                  className={`flex-1 py-3 px-4 rounded-xl font-heading font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                    isEquipped
                      ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-400 cursor-default'
                      : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-red-950 active:scale-95'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isEquipped ? 'Active Weapon' : 'Equip Weapon'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* AdMob Banner */}
      <div className="max-w-5xl mx-auto w-full pt-2">
        <AdMobBanner screenName="Armory Workbench" />
      </div>
    </div>
  );
};
