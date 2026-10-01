/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Achievement,
  GameSettings,
  InventoryItem,
  Mission,
  PlayerStats,
  ScreenType,
  Weapon,
  WeaponId,
} from './types/game';
import {
  GameStorage,
  INITIAL_ACHIEVEMENTS,
  INITIAL_INVENTORY,
  INITIAL_MISSIONS,
  INITIAL_PLAYER,
  INITIAL_SETTINGS,
  INITIAL_WEAPONS,
} from './services/storage';
import { sound } from './services/sound';
import { adMobService } from './services/admob';
import { TopPlayerBar } from './components/home/TopPlayerBar';
import { BottomNavBar } from './components/home/BottomNavBar';
import { HomeFront } from './components/home/HomeFront';
import { GameCanvas } from './components/gameplay/GameCanvas';
import { MissionsModal } from './components/modals/MissionsModal';
import { WeaponsModal } from './components/modals/WeaponsModal';
import { InventoryModal } from './components/modals/InventoryModal';
import { AchievementsModal } from './components/modals/AchievementsModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { AdMobInterstitialModal } from './components/ads/AdMobInterstitialModal';
import { CinematicTransition } from './components/gameplay/CinematicTransition';

export default function App() {
  // State Initialization from Persistent Storage
  const [player, setPlayer] = useState<PlayerStats>(() => GameStorage.getPlayer());
  const [weapons, setWeapons] = useState<Weapon[]>(() => GameStorage.getWeapons());
  const [inventory, setInventory] = useState<InventoryItem[]>(() => GameStorage.getInventory());
  const [missions, setMissions] = useState<Mission[]>(() => GameStorage.getMissions());
  const [achievements, setAchievements] = useState<Achievement[]>(() => GameStorage.getAchievements());
  const [settings, setSettings] = useState<GameSettings>(() => GameStorage.getSettings());

  // Screen State & Cinematic Transition
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('HOME');
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [levelUpToast, setLevelUpToast] = useState<number | null>(null);

  // AdMob Modal State
  const [adModalOpen, setAdModalOpen] = useState<boolean>(false);
  const [adModalRewarded, setAdModalRewarded] = useState<boolean>(false);
  const [adRewardText, setAdRewardText] = useState<string>('');
  const [adRewardAction, setAdRewardAction] = useState<(() => void) | null>(null);

  // Sync sound settings on boot
  useEffect(() => {
    sound.setConfig(settings.soundEnabled, settings.musicEnabled, settings.soundVolume);
    adMobService.initialize();
  }, [settings]);

  // Save changes to storage
  useEffect(() => {
    GameStorage.savePlayer(player);
  }, [player]);

  useEffect(() => {
    GameStorage.saveWeapons(weapons);
  }, [weapons]);

  useEffect(() => {
    GameStorage.saveInventory(inventory);
  }, [inventory]);

  useEffect(() => {
    GameStorage.saveMissions(missions);
  }, [missions]);

  useEffect(() => {
    GameStorage.saveAchievements(achievements);
  }, [achievements]);

  useEffect(() => {
    GameStorage.saveSettings(settings);
  }, [settings]);

  // Current active mission and equipped weapon
  const activeMission = missions.find((m) => m.id === player.activeMissionId) || missions[0];
  const equippedWeapon = weapons.find((w) => w.id === player.selectedWeaponId) || weapons[0];

  // Inventory counts
  const medkitsCount = inventory.find((i) => i.id === 'medkit')?.count || 0;
  const grenadesCount = inventory.find((i) => i.id === 'grenade')?.count || 0;

  // Unclaimed achievements counter
  const unclaimedAchievementsCount = achievements.filter((a) => a.completed && !a.claimed).length;

  // Update Player Stats helper
  const handleUpdatePlayerStats = useCallback((updates: Partial<PlayerStats>) => {
    setPlayer((prev) => ({ ...prev, ...updates }));
  }, []);

  // Use Inventory Item during gameplay
  const handleUseInventoryItem = useCallback(
    (type: 'medkit' | 'grenade'): boolean => {
      const item = inventory.find((i) => i.id === type);
      if (!item || item.count <= 0) return false;

      setInventory((prev) =>
        prev.map((it) => (it.id === type ? { ...it, count: it.count - 1 } : it))
      );

      // Check achievement progress
      if (type === 'grenade') {
        setAchievements((prev) =>
          prev.map((ach) => {
            if (ach.id === 'ach_4') {
              const nextVal = ach.current + 1;
              return {
                ...ach,
                current: nextVal,
                completed: nextVal >= ach.target,
              };
            }
            return ach;
          })
        );
      }
      return true;
    },
    [inventory]
  );

  // Buy Inventory Item
  const handleBuyItem = useCallback(
    (itemId: string) => {
      const item = inventory.find((i) => i.id === itemId);
      if (!item || player.coins < item.cost || item.count >= item.maxCount) return;

      setPlayer((prev) => ({ ...prev, coins: prev.coins - item.cost }));
      setInventory((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, count: i.count + 1 } : i))
      );
    },
    [inventory, player.coins]
  );

  // Use Item from backpack modal
  const handleUseItemFromModal = useCallback(
    (itemId: string) => {
      const item = inventory.find((i) => i.id === itemId);
      if (!item || item.count <= 0) return;

      if (itemId === 'medkit') {
        if (player.health >= player.maxHealth) return;
        sound.playPickup();
        setPlayer((prev) => ({
          ...prev,
          health: Math.min(prev.maxHealth, prev.health + 60),
        }));
        setInventory((prev) =>
          prev.map((it) => (it.id === itemId ? { ...it, count: it.count - 1 } : it))
        );
      } else if (itemId === 'armor') {
        if (player.armor >= player.maxArmor) return;
        sound.playPickup();
        setPlayer((prev) => ({
          ...prev,
          armor: Math.min(prev.maxArmor, prev.armor + 50),
        }));
        setInventory((prev) =>
          prev.map((it) => (it.id === itemId ? { ...it, count: it.count - 1 } : it))
        );
      }
    },
    [inventory, player]
  );

  // Equip Weapon
  const handleEquipWeapon = useCallback((id: WeaponId) => {
    setPlayer((prev) => ({ ...prev, selectedWeaponId: id }));
  }, []);

  // Upgrade Weapon
  const handleUpgradeWeapon = useCallback(
    (id: WeaponId) => {
      const wpn = weapons.find((w) => w.id === id);
      if (!wpn || wpn.level >= 5) return;

      const upgradeCost = Math.round(350 * Math.pow(1.6, wpn.level - 1));
      if (player.coins < upgradeCost) return;

      sound.playPickup();
      setPlayer((prev) => ({ ...prev, coins: prev.coins - upgradeCost }));

      // Achievement: Armed Survivor
      setAchievements((prev) =>
        prev.map((a) =>
          a.id === 'ach_armed_survivor' ? { ...a, current: 1, completed: true } : a
        )
      );

      setWeapons((prev) =>
        prev.map((w) => {
          if (w.id === id) {
            return {
              ...w,
              level: w.level + 1,
              damage: Math.round(w.damage * 1.2),
              magCapacity: w.magCapacity + (w.id === 'shotgun' || w.id === 'sniper' ? 1 : 4),
              currentMag: w.magCapacity + (w.id === 'shotgun' || w.id === 'sniper' ? 1 : 4),
              reloadTimeMs: Math.max(900, Math.round(w.reloadTimeMs * 0.92)),
            };
          }
          return w;
        })
      );
    },
    [weapons, player.coins]
  );

  // Unlock Weapon
  const handleUnlockWeapon = useCallback(
    (id: WeaponId) => {
      const wpn = weapons.find((w) => w.id === id);
      if (!wpn || wpn.unlocked || player.coins < wpn.cost) return;

      sound.playVictory();
      setPlayer((prev) => ({
        ...prev,
        coins: prev.coins - wpn.cost,
        selectedWeaponId: id,
      }));

      setWeapons((prev) =>
        prev.map((w) => (w.id === id ? { ...w, unlocked: true } : w))
      );
    },
    [weapons, player.coins]
  );

  // Mission Completed Flow
  const handleMissionComplete = useCallback(
    (rewardCoins: number, rewardXp: number, kills: number) => {
      // Calculate XP, Level Up & Coins
      setPlayer((prev) => {
        const totalXp = prev.xp + rewardXp;
        let nextLevel = prev.level;
        let nextXp = totalXp;
        let nextTargetXp = prev.xpToNextLevel;

        if (nextXp >= nextTargetXp) {
          nextLevel += 1;
          nextXp -= nextTargetXp;
          nextTargetXp = Math.round(nextTargetXp * 1.35);
          // Show Level Up Toast
          setLevelUpToast(nextLevel);
          sound.playVictory();
          setTimeout(() => setLevelUpToast(null), 4000);
        }

        return {
          ...prev,
          coins: prev.coins + rewardCoins,
          xp: nextXp,
          level: nextLevel,
          xpToNextLevel: nextTargetXp,
          totalKills: prev.totalKills + kills,
          missionsCompleted: prev.missionsCompleted + 1,
        };
      });

      // Mark current mission completed & unlock next mission
      setMissions((prev) => {
        const activeIdx = prev.findIndex((m) => m.id === player.activeMissionId);
        return prev.map((m, idx) => {
          if (idx === activeIdx) return { ...m, completed: true };
          if (idx === activeIdx + 1) return { ...m, unlocked: true };
          return m;
        });
      });

      // Update achievements
      setAchievements((prev) =>
        prev.map((ach) => {
          if (ach.id === 'ach_zombie_hunter') {
            const nextK = ach.current + kills;
            return { ...ach, current: nextK, completed: nextK >= ach.target };
          }
          if (ach.id === 'ach_survivor') {
            const nextM = ach.current + 1;
            return { ...ach, current: nextM, completed: nextM >= ach.target };
          }
          if (ach.id === 'ach_last_city_hero') {
            const currentLvl = player.level;
            return { ...ach, current: currentLvl, completed: currentLvl >= ach.target };
          }
          return ach;
        })
      );
    },
    [player.activeMissionId, player.level]
  );

  // Claim Achievement
  const handleClaimAchievement = useCallback(
    (id: string) => {
      const ach = achievements.find((a) => a.id === id);
      if (!ach || !ach.completed || ach.claimed) return;

      sound.playVictory();
      setPlayer((prev) => ({
        ...prev,
        coins: prev.coins + ach.rewardCoins,
        gems: prev.gems + ach.rewardGems,
      }));

      setAchievements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, claimed: true } : a))
      );
    },
    [achievements]
  );

  // Rewarded Ad Prompt (e.g. revive or 2x coins)
  const handleOpenRewardedAd = useCallback(
    (reason: 'revive' | 'double_coins') => {
      setAdModalRewarded(true);
      if (reason === 'revive') {
        setAdRewardText('Full Vitality Revival (100% HP)');
        setAdRewardAction(() => () => {
          setPlayer((prev) => ({ ...prev, health: prev.maxHealth }));
        });
      } else {
        setAdRewardText('+350 Bonus Coins & +10 Gems');
        setAdRewardAction(() => () => {
          setPlayer((prev) => ({
            ...prev,
            coins: prev.coins + 350,
            gems: prev.gems + 10,
          }));
        });
      }
      setAdModalOpen(true);
    },
    []
  );

  // Reset Progress
  const handleResetProgress = useCallback(() => {
    localStorage.clear();
    setPlayer(INITIAL_PLAYER);
    setWeapons(INITIAL_WEAPONS);
    setInventory(INITIAL_INVENTORY);
    setMissions(INITIAL_MISSIONS);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setSettings(INITIAL_SETTINGS);
    setCurrentScreen('HOME');
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-white overflow-hidden select-none font-sans">
      {/* 
        SCREEN 2: ACTUAL GAMEPLAY FRONT
        When currentScreen === 'GAMEPLAY', render full-screen 60fps shooting arena.
      */}
      {currentScreen === 'GAMEPLAY' ? (
        <GameCanvas
          playerStats={player}
          weapons={weapons}
          mission={activeMission}
          inventoryMedkits={medkitsCount}
          inventoryGrenades={grenadesCount}
          soundEnabled={settings.soundEnabled}
          onUpdatePlayerStats={handleUpdatePlayerStats}
          onMissionComplete={handleMissionComplete}
          onQuitToMenu={() => setCurrentScreen('HOME')}
          onOpenRewardedAd={handleOpenRewardedAd}
          onUseInventoryItem={handleUseInventoryItem}
        />
      ) : (
        /*
          SCREEN 1: GAME HOME / APP FRONT
          Full-screen professional zombie survival game UI.
        */
        <div className="w-full h-full flex flex-col justify-between overflow-hidden">
          {/* Top Player Header Bar */}
          <TopPlayerBar
            player={player}
            soundEnabled={settings.soundEnabled}
            onToggleSound={() => {
              const nextState = !settings.soundEnabled;
              setSettings((s) => ({ ...s, soundEnabled: nextState }));
              sound.setConfig(nextState, settings.musicEnabled, settings.soundVolume);
            }}
            onOpenSettings={() => setCurrentScreen('SETTINGS')}
          />

          {/* Main Home Screen Front */}
          <HomeFront
            player={player}
            equippedWeapon={equippedWeapon}
            activeMission={activeMission}
            onPlayGame={() => setIsDeploying(true)}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenSettings={() => setCurrentScreen('SETTINGS')}
          />

          {/* Tactical Bottom Navigation Dock */}
          <BottomNavBar
            currentScreen={currentScreen}
            onSelectScreen={(screen) => setCurrentScreen(screen)}
            unclaimedAchievementsCount={unclaimedAchievementsCount}
          />
        </div>
      )}

      {/* CINEMATIC ENVIRONMENT REVEAL / TRANSITION */}
      {isDeploying && (
        <CinematicTransition
          mission={activeMission}
          onComplete={() => {
            setIsDeploying(false);
            setCurrentScreen('GAMEPLAY');
          }}
        />
      )}

      {/* LEVEL UP TOAST BANNER */}
      {levelUpToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black px-6 py-2.5 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.8)] border-2 border-white/60 flex items-center gap-3 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-black text-amber-400 flex items-center justify-center font-heading font-black text-lg">
            ★
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest font-black leading-none">
              SURVIVOR PROMOTION
            </div>
            <div className="text-xl font-heading font-black uppercase tracking-wider leading-none mt-0.5">
              LEVEL {levelUpToast} UNLOCKED!
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY MODALS & SCREENS */}
      <MissionsModal
        isOpen={currentScreen === 'MISSIONS'}
        missions={missions}
        activeMissionId={player.activeMissionId}
        playerStats={player}
        onSelectMission={(id) => setPlayer((p) => ({ ...p, activeMissionId: id }))}
        onDeploy={(id) => {
          setPlayer((p) => ({ ...p, activeMissionId: id }));
          setIsDeploying(true);
        }}
        onClose={() => setCurrentScreen('HOME')}
      />

      <WeaponsModal
        isOpen={currentScreen === 'WEAPONS'}
        weapons={weapons}
        playerStats={player}
        onEquipWeapon={handleEquipWeapon}
        onUpgradeWeapon={handleUpgradeWeapon}
        onUnlockWeapon={handleUnlockWeapon}
        onClose={() => setCurrentScreen('HOME')}
      />

      <InventoryModal
        isOpen={currentScreen === 'INVENTORY'}
        inventory={inventory}
        playerStats={player}
        onBuyItem={handleBuyItem}
        onUseItem={handleUseItemFromModal}
        onClose={() => setCurrentScreen('HOME')}
      />

      <AchievementsModal
        isOpen={currentScreen === 'ACHIEVEMENTS'}
        achievements={achievements}
        onClaim={handleClaimAchievement}
        onClose={() => setCurrentScreen('HOME')}
      />

      <SettingsModal
        isOpen={currentScreen === 'SETTINGS'}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((s) => ({ ...s, ...newSettings }))}
        onResetProgress={handleResetProgress}
        onClose={() => setCurrentScreen('HOME')}
      />

      {/* ADMOB INTERSTITIAL / REWARDED MODAL */}
      <AdMobInterstitialModal
        isOpen={adModalOpen}
        isRewarded={adModalRewarded}
        rewardText={adRewardText}
        onClose={(rewardGranted) => {
          setAdModalOpen(false);
          if (rewardGranted && adRewardAction) {
            adRewardAction();
          }
          setAdRewardAction(null);
        }}
      />
    </div>
  );
}
