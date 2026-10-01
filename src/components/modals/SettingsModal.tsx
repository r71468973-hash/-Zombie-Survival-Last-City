import React from 'react';
import { GameSettings } from '../../types/game';
import { Settings, Volume2, VolumeX, Music, Smartphone, Monitor, ShieldAlert, X, RotateCcw } from 'lucide-react';
import { sound } from '../../services/sound';
import { ADMOB_CONFIG } from '../../services/admob';
import { AdMobBanner } from '../ads/AdMobBanner';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 select-none animate-fadeIn">
      {/* Header */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-500/50 flex items-center justify-center text-sky-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
              SYSTEM CONFIGURATION
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-white uppercase">
              GAME SETTINGS
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

      {/* Settings Options Body */}
      <div className="max-w-3xl mx-auto w-full flex-1 overflow-y-auto py-4 space-y-4">
        {/* Sound FX & Music */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            Audio Engine
          </h3>

          {/* Sound FX Toggle & Volume */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-heading font-bold text-sm text-white">Sound Effects</div>
              <div className="text-xs text-slate-400">Weapon gunfire, zombie audio and combat impacts</div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ soundVolume: val });
                  sound.setConfig(settings.soundEnabled, settings.musicEnabled, val);
                }}
                className="w-28 accent-red-500 cursor-pointer"
              />

              <button
                onClick={() => {
                  sound.playClick();
                  const nextState = !settings.soundEnabled;
                  onUpdateSettings({ soundEnabled: nextState });
                  sound.setConfig(nextState, settings.musicEnabled, settings.soundVolume);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-colors ${
                  settings.soundEnabled
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-900 border border-slate-700 text-slate-500'
                }`}
              >
                {settings.soundEnabled ? 'ON' : 'MUTED'}
              </button>
            </div>
          </div>

          {/* Music Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-900">
            <div>
              <div className="font-heading font-bold text-sm text-white">Ambient Music</div>
              <div className="text-xs text-slate-400">Atmospheric tension drones and combat soundtrack</div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                const nextState = !settings.musicEnabled;
                onUpdateSettings({ musicEnabled: nextState });
                sound.setConfig(settings.soundEnabled, nextState, settings.soundVolume);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-colors ${
                settings.musicEnabled
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-900 border border-slate-700 text-slate-500'
              }`}
            >
              {settings.musicEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>

        {/* Controls & Sensitivity */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400" />
            Controls & Gameplay
          </h3>

          {/* Virtual Joystick Sensitivity */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-heading font-bold text-sm text-white">Joystick Sensitivity</div>
              <div className="text-xs text-slate-400">Adjust responsiveness of movement trackpad</div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="10"
                value={settings.sensitivity}
                onChange={(e) => {
                  onUpdateSettings({ sensitivity: parseInt(e.target.value) });
                }}
                className="w-28 accent-amber-500 cursor-pointer"
              />
              <span className="font-mono font-bold text-xs text-amber-400 w-6 text-right">
                {settings.sensitivity}x
              </span>
            </div>
          </div>

          {/* Auto-Fire Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-900">
            <div>
              <div className="font-heading font-bold text-sm text-white">Mobile Auto-Fire</div>
              <div className="text-xs text-slate-400">Automatically shoots when target is in line of sight</div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings({ autoFire: !settings.autoFire });
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-colors ${
                settings.autoFire
                  ? 'bg-amber-950/60 border border-amber-500/40 text-amber-400'
                  : 'bg-slate-900 border border-slate-700 text-slate-500'
              }`}
            >
              {settings.autoFire ? 'ON' : 'MANUAL'}
            </button>
          </div>
        </div>

        {/* Graphics Performance */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
          <h3 className="font-heading font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Monitor className="w-4 h-4 text-sky-400" />
            Display & Graphics
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-heading font-bold text-sm text-white">Rendering Quality</div>
              <div className="text-xs text-slate-400">Particle effects, blood decals and flashlight reflections</div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
              {(['low', 'medium', 'ultra'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    sound.playClick();
                    onUpdateSettings({ graphics: q });
                  }}
                  className={`px-3 py-1 rounded text-xs font-heading font-bold uppercase transition-colors ${
                    settings.graphics === q
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AdMob Configuration Notice */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h4 className="font-heading font-bold text-sm text-white uppercase">
              Google Mobile Ads (AdMob) Integration
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            AdMob SDK architecture is active. Non-intrusive Banner Ads appear on menus and rewarded ads offer extra coins/revives. No ads interrupt active gunplay.
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded p-2 text-[11px] font-mono text-slate-400 space-y-0.5">
            <div><strong>Environment:</strong> {ADMOB_CONFIG.isTestMode ? 'Google Android Test Ad Mode' : 'Production Mode'}</div>
            <div><strong>Banner ID:</strong> {ADMOB_CONFIG.bannerAdUnitId}</div>
            <div><strong>Rewarded ID:</strong> {ADMOB_CONFIG.rewardedAdUnitId}</div>
          </div>
        </div>

        {/* Reset Progress */}
        <div className="pt-2">
          <button
            onClick={() => {
              if (window.confirm('Reset all game progress, weapons and inventory back to default?')) {
                onResetProgress();
              }
            }}
            className="w-full py-2.5 px-4 bg-red-950/30 hover:bg-red-950/60 text-red-400 border border-red-900/50 rounded-xl text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Survivor Progress</span>
          </button>
        </div>
      </div>

      {/* AdMob Banner at bottom */}
      <div className="max-w-3xl mx-auto w-full pt-2">
        <AdMobBanner screenName="Game Settings" />
      </div>
    </div>
  );
};
