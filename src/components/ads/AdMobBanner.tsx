import React, { useState } from 'react';
import { ADMOB_CONFIG } from '../../services/admob';
import { X, ExternalLink } from 'lucide-react';

interface AdMobBannerProps {
  screenName: string;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({ screenName }) => {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <aside aria-label="Advertisement" className="w-full max-w-lg mx-auto px-2 py-1 relative z-30 select-none">
      <div className="bg-slate-950/90 border border-slate-700/80 rounded px-2.5 py-1.5 flex items-center justify-between shadow-lg shadow-black/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-[9px] uppercase tracking-wider font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.5 rounded leading-none shrink-0">
            {ADMOB_CONFIG.isTestMode ? 'AdMob Test Ad' : 'Ad'}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
              Survival Tactics & Defense Bunker Gear
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {ADMOB_CONFIG.isTestMode
                ? `Unit: ${ADMOB_CONFIG.bannerAdUnitId.slice(0, 24)}... [${screenName}]`
                : 'Download high-tier gear and tactical supplies today'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <button
            onClick={() => window.open('https://developers.google.com/admob', '_blank')}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
            title="Ad Info"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setClosed(true)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
