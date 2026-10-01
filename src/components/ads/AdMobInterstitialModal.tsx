import React, { useState, useEffect } from 'react';
import { ADMOB_CONFIG } from '../../services/admob';
import { X, Award, ShieldAlert } from 'lucide-react';
import { sound } from '../../services/sound';

interface AdMobInterstitialModalProps {
  isOpen: boolean;
  isRewarded?: boolean;
  rewardText?: string;
  onClose: (rewardGranted: boolean) => void;
}

export const AdMobInterstitialModal: React.FC<AdMobInterstitialModalProps> = ({
  isOpen,
  isRewarded = false,
  rewardText = '+250 Coins & Full Medkit Supply',
  onClose,
}) => {
  const [countdown, setCountdown] = useState(isRewarded ? 5 : 3);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(isRewarded ? 5 : 3);
      setCanSkip(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isRewarded]);

  if (!isOpen) return null;

  const handleFinish = (reward: boolean) => {
    sound.playClick();
    if (reward && isRewarded) {
      sound.playPickup();
    }
    onClose(reward);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 select-none animate-fadeIn">
      {/* Top Test Ad Status Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
            Google AdMob {isRewarded ? 'Rewarded Video' : 'Interstitial'} Test
          </span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Unit: {isRewarded ? ADMOB_CONFIG.rewardedAdUnitId : ADMOB_CONFIG.interstitialAdUnitId}
          </span>
        </div>

        {canSkip ? (
          <button
            onClick={() => handleFinish(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold uppercase tracking-wider border border-slate-600 transition-colors"
          >
            <span>Close</span>
            <X className="w-4 h-4" />
          </button>
        ) : (
          <span className="text-xs font-mono text-amber-400 font-bold bg-slate-900 border border-slate-700 px-2.5 py-1 rounded">
            Reward in {countdown}s
          </span>
        )}
      </div>

      {/* Ad Showcase Body */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-red-600/20 border-2 border-amber-500/50 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-amber-950/40">
          {isRewarded ? (
            <Award className="w-10 h-10 text-amber-400 animate-pulse" />
          ) : (
            <ShieldAlert className="w-10 h-10 text-red-400" />
          )}
        </div>

        <h3 className="text-xl font-bold font-heading text-white mb-2 uppercase tracking-wide">
          {isRewarded ? 'Supply Drop Sponsor' : 'Last City Emergency Broadcast'}
        </h3>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          {isRewarded
            ? 'Military reinforcement supplies have been authorized for your outpost.'
            : 'Prepare your squad for infected night waves. Upgrade weapons at the armory.'}
        </p>

        {isRewarded && (
          <div className="bg-emerald-950/40 border border-emerald-500/40 px-4 py-2.5 rounded-lg mb-6 w-full flex items-center justify-center gap-2">
            <span className="text-xs uppercase text-emerald-400 font-semibold tracking-wider">Reward:</span>
            <span className="text-sm font-bold text-emerald-300">{rewardText}</span>
          </div>
        )}

        <div className="text-[11px] text-slate-500 bg-slate-900/80 border border-slate-800 rounded p-2.5 text-left w-full font-mono">
          <div className="text-amber-400 font-bold mb-1">AdMob Integration Notice:</div>
          <div>Development environment is utilizing Google Mobile Ads Android test credentials.</div>
          <div>In release APK, production keys from admob.ts will inject real video creatives.</div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
        <span className="text-xs text-slate-500">AdMob SDK v23.0.0 Architecture</span>
        <button
          disabled={!canSkip}
          onClick={() => handleFinish(true)}
          className={`px-6 py-2.5 rounded font-heading font-bold uppercase tracking-wider text-sm transition-all ${
            canSkip
              ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/30'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {canSkip ? (isRewarded ? 'Claim Supply Drop' : 'Continue Game') : `Wait (${countdown})`}
        </button>
      </div>
    </div>
  );
};
