import React from 'react';
import { PlayerStats, Weapon, Mission, ScreenType } from '../../types/game';
import { Play, Crosshair, Wrench, Backpack, Trophy, Settings, ShieldAlert, ChevronRight, Zap } from 'lucide-react';
import { sound } from '../../services/sound';
import { AdMobBanner } from '../ads/AdMobBanner';

interface HomeFrontProps {
  player: PlayerStats;
  equippedWeapon: Weapon;
  activeMission: Mission;
  onPlayGame: () => void;
  onNavigate: (screen: ScreenType) => void;
  onOpenSettings: () => void;
}

export const HomeFront: React.FC<HomeFrontProps> = ({
  player,
  equippedWeapon,
  activeMission,
  onPlayGame,
  onNavigate,
  onOpenSettings,
}) => {
  return (
    <div className="relative w-full flex-1 flex flex-col justify-between overflow-hidden select-none bg-slate-950">
      {/* Background Layer 1: Dark Cinematic Post-Apocalyptic Ruined City */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/src/assets/images/game_city_background_1790842445467.jpg"
          alt="Post-Apocalyptic Last City"
          className="w-full h-full object-cover object-center scale-105 animate-pulse duration-[10000ms] filter brightness-[0.7] contrast-125"
          referrerPolicy="no-referrer"
        />
        {/* Dark Vignette & Atmospheric Fog Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-transparent to-slate-950/90" />
        <div className="absolute inset-0 military-scanline opacity-40 pointer-events-none" />
      </div>

      {/* Background Layer 2: Survivor Character Hero Art Silhouette / Stance on Right */}
      <div className="absolute bottom-0 right-[-10%] sm:right-0 md:right-[5%] lg:right-[15%] w-[320px] sm:w-[420px] md:w-[480px] h-[75%] sm:h-[85%] z-10 pointer-events-none opacity-85 sm:opacity-95">
        <div className="relative w-full h-full">
          <img
            src="/src/assets/images/game_survivor_hero_1790842459435.jpg"
            alt="Zombie Survival Hero"
            className="w-full h-full object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
            referrerPolicy="no-referrer"
          />
          {/* Subtle gradient feather at base */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>
      </div>

      {/* Floating Tactical Embers / Warning Atmosphere */}
      <div className="absolute top-12 left-6 z-10 pointer-events-none hidden sm:block">
        <div className="flex items-center gap-2 bg-red-950/60 border border-red-500/40 rounded px-2.5 py-1 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-[11px] font-mono text-red-300 font-bold uppercase tracking-wider">
            BIO-HAZARD DETECTED · SECTOR 4 LOCKDOWN
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-20 flex-1 flex flex-col justify-between p-4 sm:p-6 max-w-6xl mx-auto w-full">
        {/* Game Title & Branding */}
        <div className="pt-2 sm:pt-4 max-w-xl">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="w-1.5 h-6 bg-red-600 rounded-sm" />
            <span className="text-xs sm:text-sm font-mono tracking-widest text-red-500 uppercase font-bold">
              POST-APOCALYPTIC TACTICAL SHOOTER
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display uppercase tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] leading-none">
            ZOMBIE SURVIVAL
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-4xl md:text-5xl font-heading font-black tracking-wider text-red-500 uppercase drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]">
              LAST CITY
            </span>
            <span className="text-[10px] sm:text-xs font-mono bg-slate-900/80 text-slate-300 border border-slate-700 px-2 py-0.5 rounded uppercase">
              v1.0.4 PROD
            </span>
          </div>
        </div>

        {/* Center / Action Area: Big PLAY GAME Button & Current Mission Brief */}
        <div className="my-auto py-6 max-w-md w-full">
          {/* Mission Deployment Status Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 mb-5 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono font-bold text-red-400 uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Active Deployment
              </span>
              <span className="text-[10px] font-heading font-bold text-amber-400 bg-amber-950/50 border border-amber-500/30 px-1.5 py-0.5 rounded">
                {activeMission.difficulty}
              </span>
            </div>

            <h3 className="font-heading font-bold text-base text-slate-100 truncate">
              {activeMission.title}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-1 mb-2">
              {activeMission.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400">
                Objective: <span className="text-white font-semibold">Eliminate {activeMission.targetKills} Hostiles</span>
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate('MISSIONS');
                }}
                className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold flex items-center gap-0.5 uppercase tracking-wider"
              >
                Change Sector <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* LARGE "PLAY GAME" CENTER BUTTON */}
          <button
            onClick={() => {
              sound.playClick();
              onPlayGame();
            }}
            className="group relative w-full tactical-btn bg-gradient-to-r from-red-600 via-red-500 to-amber-600 hover:from-red-500 hover:to-amber-500 p-0.5 rounded shadow-[0_0_35px_rgba(239,68,68,0.5)] active:scale-[0.98] transition-all duration-200"
          >
            <div className="w-full py-4 sm:py-5 px-6 bg-gradient-to-r from-red-950/80 via-red-900/60 to-slate-950/80 rounded flex items-center justify-center gap-4 border border-red-400/40">
              <div className="w-12 h-12 rounded-full bg-red-600 group-hover:bg-red-500 flex items-center justify-center shadow-lg shadow-red-950 transition-colors">
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-mono text-red-300 tracking-widest uppercase font-semibold">
                  SURVIVAL COMBAT
                </span>
                <span className="text-2xl sm:text-3xl font-heading font-black tracking-widest text-white uppercase group-hover:text-amber-200 transition-colors">
                  PLAY GAME
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Bottom Panel: Equipped Weapon Status & Quick Action Buttons */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
          {/* Equipped Weapon Card */}
          <div className="bg-slate-950/85 border border-slate-800 rounded-xl p-3 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-red-400">
                <Crosshair className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">EQUIPPED WEAPON</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 px-1 rounded">
                    LVL {equippedWeapon.level}
                  </span>
                </div>
                <h4 className="font-heading font-bold text-white text-sm">
                  {equippedWeapon.name}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                  <span>DMG: {equippedWeapon.damage}</span>
                  <span>·</span>
                  <span>CAP: {equippedWeapon.magCapacity}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onNavigate('WEAPONS');
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded border border-slate-600 transition-colors uppercase tracking-wider"
            >
              Armory
            </button>
          </div>

          {/* Quick Screen Buttons Grid */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('MISSIONS');
              }}
              className="flex flex-col items-center justify-center p-2.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-xl transition-colors group"
            >
              <Crosshair className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-heading font-bold text-slate-300 uppercase">Missions</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onNavigate('INVENTORY');
              }}
              className="flex flex-col items-center justify-center p-2.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-xl transition-colors group"
            >
              <Backpack className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-heading font-bold text-slate-300 uppercase">Inventory</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onNavigate('ACHIEVEMENTS');
              }}
              className="flex flex-col items-center justify-center p-2.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-xl transition-colors group"
            >
              <Trophy className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-heading font-bold text-slate-300 uppercase">Awards</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenSettings();
              }}
              className="flex flex-col items-center justify-center p-2.5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-xl transition-colors group"
            >
              <Settings className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-heading font-bold text-slate-300 uppercase">Settings</span>
            </button>
          </div>
        </div>

        {/* AdMob Banner at Bottom */}
        <AdMobBanner screenName="Home Front" />
      </div>
    </div>
  );
};
