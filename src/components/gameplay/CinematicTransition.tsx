import React, { useState, useEffect } from 'react';
import { ShieldAlert, Crosshair, Skull } from 'lucide-react';
import { Mission } from '../../types/game';

interface CinematicTransitionProps {
  mission: Mission;
  onComplete: () => void;
}

const TACTICAL_TIPS = [
  'Aim for headshots to trigger critical 2x damage against heavy infected.',
  'Keep distance from toxic Acid Spitters — their corrosive bile bypasses armor.',
  'The SPAS-12 shotgun deals catastrophic spread damage against clustered runner packs.',
  'Use military frag grenades to quickly clear swarm chokepoints and boss escorts.',
  'Tactical reload whenever your magazine is low during quiet moments between waves.',
];

export const CinematicTransition: React.FC<CinematicTransitionProps> = ({
  mission,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [tip] = useState(() => TACTICAL_TIPS[Math.floor(Math.random() * TACTICAL_TIPS.length)]);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 1200; // 1.2s smooth cinematic deployment sequence

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const currentProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, 150);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6 select-none animate-fadeIn overflow-hidden">
      {/* Background with Dark Ruined City Atmosphere & Scanlines */}
      <div className="absolute inset-0 z-0 opacity-40 scale-105 pointer-events-none">
        <img
          src="/src/assets/images/game_city_background_1790842445467.jpg"
          alt="Deploying to Last City"
          className="w-full h-full object-cover filter brightness-50 contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 military-scanline opacity-60" />
      </div>

      {/* Top Sector Deployment Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-red-950/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-500 shadow-lg shadow-red-950/80">
            <Crosshair className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              DEPLOYING SURVIVOR UNIT
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-white uppercase tracking-wider">
              {mission.sector}
            </h2>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 px-3 py-1 rounded text-right">
          <span className="text-[10px] font-mono text-slate-400 uppercase">THREAT LEVEL</span>
          <div className="text-xs font-mono font-bold text-red-400">{mission.difficulty}</div>
        </div>
      </div>

      {/* Center Cinematic Mission Briefing */}
      <div className="relative z-10 max-w-xl mx-auto my-auto text-center px-4">
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-500/40 rounded-full px-3 py-1 mb-3">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs font-mono text-red-300 font-bold uppercase">MISSION DIRECTIVE</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-heading font-black uppercase text-white tracking-wide drop-shadow-md mb-2">
          {mission.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
          {mission.description}
        </p>

        {/* Objective Pill */}
        <div className="bg-slate-950/90 border border-red-500/30 rounded-xl p-3 inline-flex items-center gap-3 shadow-xl">
          <Skull className="w-5 h-5 text-red-400" />
          <div className="text-left font-mono">
            <div className="text-[10px] text-slate-400 uppercase">TACTICAL OBJECTIVE</div>
            <div className="text-sm font-bold text-white">Eliminate {mission.targetKills} Infected Hostiles</div>
          </div>
        </div>
      </div>

      {/* Bottom Loading Progress & Tactical Tip */}
      <div className="relative z-10 max-w-2xl mx-auto w-full pt-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
          <span className="uppercase tracking-wider text-red-400 font-bold">ENTERING COMBAT ZONE...</span>
          <span className="tabular-nums font-bold text-white">{progress}%</span>
        </div>

        {/* Tactical Loading Progress Bar */}
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-red-500 transition-all duration-75 shadow-[0_0_15px_rgba(239,68,68,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Survival Tip */}
        <p className="text-xs font-mono text-slate-400 text-center mt-3 truncate">
          <strong className="text-amber-400">SURVIVOR TIP:</strong> {tip}
        </p>
      </div>
    </div>
  );
};
