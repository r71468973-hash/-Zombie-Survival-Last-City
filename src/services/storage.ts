import { Achievement, GameSettings, InventoryItem, Mission, PlayerStats, Weapon } from '../types/game';

const STORAGE_KEYS = {
  PLAYER: 'zombie_survival_player_stats_v1',
  WEAPONS: 'zombie_survival_weapons_v1',
  INVENTORY: 'zombie_survival_inventory_v1',
  MISSIONS: 'zombie_survival_missions_v1',
  ACHIEVEMENTS: 'zombie_survival_achievements_v1',
  SETTINGS: 'zombie_survival_settings_v1',
};

export const INITIAL_WEAPONS: Weapon[] = [
  {
    id: 'pistol',
    name: 'Beretta M9 Tactical',
    category: 'Sidearm',
    damage: 28,
    fireRateMs: 220,
    magCapacity: 15,
    currentMag: 15,
    reserveAmmo: 90,
    maxReserveAmmo: 120,
    reloadTimeMs: 1400,
    spread: 0.04,
    bulletSpeed: 14,
    cost: 0,
    unlocked: true,
    level: 1,
    icon: 'Crosshair',
    description: 'Standard issue high-precision sidearm. Reliable, fast tactical reload.',
  },
  {
    id: 'shotgun',
    name: 'SPAS-12 Annihilator',
    category: 'Combat Shotgun',
    damage: 18,
    pelletCount: 6,
    fireRateMs: 700,
    magCapacity: 8,
    currentMag: 8,
    reserveAmmo: 40,
    maxReserveAmmo: 64,
    reloadTimeMs: 2200,
    spread: 0.22,
    bulletSpeed: 12,
    cost: 850,
    unlocked: true,
    level: 1,
    icon: 'Flame',
    description: 'Devastating close-range scatter gun. Shreds zombie packs at point-blank.',
  },
  {
    id: 'rifle',
    name: 'AK-47 Vanguard',
    category: 'Assault Rifle',
    damage: 42,
    fireRateMs: 120,
    magCapacity: 30,
    currentMag: 30,
    reserveAmmo: 180,
    maxReserveAmmo: 240,
    reloadTimeMs: 1800,
    spread: 0.08,
    bulletSpeed: 16,
    cost: 1600,
    unlocked: false,
    level: 1,
    icon: 'Zap',
    description: 'High-caliber fully automatic assault rifle. Extreme stopping power for hordes.',
  },
  {
    id: 'sniper',
    name: 'AWM Dead-Eye',
    category: 'Precision Rifle',
    damage: 160,
    fireRateMs: 1100,
    magCapacity: 5,
    currentMag: 5,
    reserveAmmo: 25,
    maxReserveAmmo: 40,
    reloadTimeMs: 2600,
    spread: 0.01,
    bulletSpeed: 24,
    cost: 3200,
    unlocked: false,
    level: 1,
    icon: 'Target',
    description: 'Heavy armor-piercing anti-materiel sniper. Penetrates multiple infected.',
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'medkit',
    name: 'Military Medkit',
    description: 'Restores 60 Health points instantly.',
    count: 3,
    maxCount: 10,
    cost: 150,
    icon: 'Heart',
    type: 'medkit',
  },
  {
    id: 'armor',
    name: 'Kevlar Vest Plate',
    description: 'Repairs 50 Armor points for damage absorption.',
    count: 2,
    maxCount: 8,
    cost: 200,
    icon: 'Shield',
    type: 'armor',
  },
  {
    id: 'grenade',
    name: 'M67 Frag Grenade',
    description: 'Clears dense clusters with a 250 damage blast radius.',
    count: 4,
    maxCount: 12,
    cost: 250,
    icon: 'Bomb',
    type: 'grenade',
  },
  {
    id: 'ammo_crate',
    name: 'Tactical Ammo Box',
    description: 'Fully refills reserve ammunition for all equipped weapons.',
    count: 2,
    maxCount: 6,
    cost: 300,
    icon: 'Box',
    type: 'ammo_crate',
  },
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'mission_1',
    title: 'Mission 1: Survive the Street',
    sector: 'Sector 1 · Outskirts',
    description: 'Infected hordes are wandering down Main Avenue. Eliminate 10 zombies to secure the extraction point.',
    targetKills: 10,
    targetType: 'any',
    rewardCoins: 100,
    rewardXp: 50,
    difficulty: 'EASY',
    completed: false,
    unlocked: true,
  },
  {
    id: 'mission_2',
    title: 'Mission 2: Clear the Block',
    sector: 'Sector 2 · Highrise District',
    description: 'A dense cluster of infected and acid spitters has overtaken the residential district. Clear the block.',
    targetKills: 25,
    targetType: 'any',
    rewardCoins: 250,
    rewardXp: 150,
    difficulty: 'MEDIUM',
    completed: false,
    unlocked: false,
  },
  {
    id: 'mission_3',
    title: 'Mission 3: Last Stand',
    sector: 'Sector 3 · Industrial Complex',
    description: 'Survive the ferocious zombie wave and hold off the fast runners until reinforcements arrive.',
    targetKills: 40,
    targetType: 'any',
    rewardCoins: 500,
    rewardXp: 300,
    difficulty: 'HARD',
    completed: false,
    unlocked: false,
  },
  {
    id: 'mission_4',
    title: 'Mission 4: Hospital Quarantine',
    sector: 'Sector 4 · Memorial General',
    description: 'A colossal Goliath Brute has broken out of the triage zone. Slay the mutated boss and its minions.',
    targetKills: 50,
    targetType: 'brute',
    rewardCoins: 1000,
    rewardXp: 600,
    difficulty: 'NIGHTMARE',
    completed: false,
    unlocked: false,
  },
  {
    id: 'mission_5',
    title: 'Mission 5: City Hall Defense',
    sector: 'Sector 5 · Downtown Center',
    description: 'Apocalyptic mega-horde convergence on the last surviving stronghold. Defeat 75 infected hostiles.',
    targetKills: 75,
    targetType: 'any',
    rewardCoins: 2500,
    rewardXp: 1200,
    difficulty: 'NIGHTMARE',
    completed: false,
    unlocked: false,
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_zombie_hunter',
    title: 'Zombie Hunter',
    description: 'Defeat 50 zombies in Last City combat.',
    current: 0,
    target: 50,
    rewardCoins: 500,
    rewardGems: 15,
    completed: false,
    claimed: false,
  },
  {
    id: 'ach_survivor',
    title: 'Survivor',
    description: 'Complete 5 missions in the apocalypse campaign.',
    current: 0,
    target: 5,
    rewardCoins: 1000,
    rewardGems: 25,
    completed: false,
    claimed: false,
  },
  {
    id: 'ach_armed_survivor',
    title: 'Armed Survivor',
    description: 'Upgrade any weapon at the armory workbench.',
    current: 0,
    target: 1,
    rewardCoins: 300,
    rewardGems: 10,
    completed: false,
    claimed: false,
  },
  {
    id: 'ach_last_city_hero',
    title: 'Last City Hero',
    description: 'Earn enough battle experience to reach Level 10.',
    current: 3,
    target: 10,
    rewardCoins: 2500,
    rewardGems: 50,
    completed: false,
    claimed: false,
  },
];

export const INITIAL_PLAYER: PlayerStats = {
  level: 3,
  xp: 420,
  xpToNextLevel: 1000,
  health: 100,
  maxHealth: 100,
  armor: 75,
  maxArmor: 100,
  coins: 1450,
  gems: 25,
  totalKills: 14,
  missionsCompleted: 0,
  selectedWeaponId: 'pistol',
  activeMissionId: 'mission_1',
};

export const INITIAL_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.8,
  musicVolume: 0.6,
  sensitivity: 6,
  autoFire: false,
  graphics: 'ultra',
  vibration: true,
};

export class GameStorage {
  public static getPlayer(): PlayerStats {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYER);
      return data ? { ...INITIAL_PLAYER, ...JSON.parse(data) } : INITIAL_PLAYER;
    } catch {
      return INITIAL_PLAYER;
    }
  }

  public static savePlayer(player: PlayerStats) {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(player));
    } catch {}
  }

  public static getWeapons(): Weapon[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEAPONS);
      return data ? JSON.parse(data) : INITIAL_WEAPONS;
    } catch {
      return INITIAL_WEAPONS;
    }
  }

  public static saveWeapons(weapons: Weapon[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.WEAPONS, JSON.stringify(weapons));
    } catch {}
  }

  public static getInventory(): InventoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      return data ? JSON.parse(data) : INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  }

  public static saveInventory(items: InventoryItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
    } catch {}
  }

  public static getMissions(): Mission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MISSIONS);
      return data ? JSON.parse(data) : INITIAL_MISSIONS;
    } catch {
      return INITIAL_MISSIONS;
    }
  }

  public static saveMissions(missions: Mission[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
    } catch {}
  }

  public static getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : INITIAL_ACHIEVEMENTS;
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  }

  public static saveAchievements(achs: Achievement[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achs));
    } catch {}
  }

  public static getSettings(): GameSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  public static saveSettings(settings: GameSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }
}
