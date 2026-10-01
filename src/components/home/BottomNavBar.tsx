import React from 'react';
import { ScreenType } from '../../types/game';
import { Crosshair, ShieldCheck, Backpack, Trophy, Compass, Wrench } from 'lucide-react';
import { sound } from '../../services/sound';

interface BottomNavBarProps {
  currentScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
  unclaimedAchievementsCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentScreen,
  onSelectScreen,
  unclaimedAchievementsCount,
}) => {
  const tabs = [
    {
      id: 'HOME' as ScreenType,
      label: 'Home',
      icon: Compass,
    },
    {
      id: 'MISSIONS' as ScreenType,
      label: 'Missions',
      icon: Crosshair,
    },
    {
      id: 'WEAPONS' as ScreenType,
      label: 'Weapons',
      icon: Wrench,
    },
    {
      id: 'INVENTORY' as ScreenType,
      label: 'Inventory',
      icon: Backpack,
    },
    {
      id: 'ACHIEVEMENTS' as ScreenType,
      label: 'Trophies',
      icon: Trophy,
      badge: unclaimedAchievementsCount > 0 ? unclaimedAchievementsCount : undefined,
    },
  ];

  return (
    <nav className="w-full bg-slate-950/95 border-t border-slate-800/90 px-2 py-1.5 backdrop-blur-md relative z-30 select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                onSelectScreen(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 relative rounded-lg transition-all ${
                isActive
                  ? 'text-red-400 bg-red-950/30 border border-red-500/40 shadow-sm shadow-red-900/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white font-mono font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-heading font-semibold mt-1 tracking-wider uppercase ${isActive ? 'text-red-400' : 'text-slate-400'}`}>
                {tab.label}
              </span>

              {isActive && (
                <span className="absolute -bottom-1 w-6 h-0.5 bg-red-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
