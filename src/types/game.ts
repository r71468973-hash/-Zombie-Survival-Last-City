export type ScreenType = 'HOME' | 'GAMEPLAY' | 'MISSIONS' | 'WEAPONS' | 'INVENTORY' | 'ACHIEVEMENTS' | 'SETTINGS';

export type WeaponId = 'pistol' | 'shotgun' | 'rifle' | 'sniper';

export interface Weapon {
  id: WeaponId;
  name: string;
  category: string;
  damage: number;
  fireRateMs: number;
  magCapacity: number;
  currentMag: number;
  reserveAmmo: number;
  maxReserveAmmo: number;
  reloadTimeMs: number;
  spread: number;
  bulletSpeed: number;
  cost: number;
  unlocked: boolean;
  level: number;
  icon: string;
  description: string;
  pelletCount?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  count: number;
  maxCount: number;
  cost: number;
  icon: string;
  type: 'medkit' | 'armor' | 'grenade' | 'ammo_crate' | 'adrenaline';
}

export interface Mission {
  id: string;
  title: string;
  sector: string;
  description: string;
  targetKills: number;
  targetType: 'any' | 'brute' | 'spitter';
  timeLimitSec?: number;
  rewardCoins: number;
  rewardXp: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE';
  completed: boolean;
  unlocked: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  rewardCoins: number;
  rewardGems: number;
  completed: boolean;
  claimed: boolean;
}

export interface PlayerStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  coins: number;
  gems: number;
  totalKills: number;
  missionsCompleted: number;
  selectedWeaponId: WeaponId;
  activeMissionId: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  sensitivity: number;
  autoFire: boolean;
  graphics: 'low' | 'medium' | 'ultra';
  vibration: boolean;
}

// In-game entities
export interface PlayerEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  radius: number;
  speed: number;
  isFiring: boolean;
  isReloading: boolean;
  reloadProgress: number;
  lastShotTime: number;
  invincibleTimer: number;
}

export type ZombieType = 'walker' | 'runner' | 'spitter' | 'brute';

export interface ZombieEntity {
  id: string;
  type: ZombieType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  radius: number;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  attackCooldown: number;
  lastAttackTime: number;
  isBoss?: boolean;
  hitFlashTimer: number;
  animFrame: number;
}

export interface BulletEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  rangeRemaining: number;
  isCrit?: boolean;
  color: string;
}

export interface SpitEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  radius: number;
  life: number;
}

export interface GrenadeEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  timer: number;
  radius: number;
}

export interface ParticleEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  alpha: number;
}

export interface BloodDecal {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  rotation: number;
}

export interface LootDrop {
  id: string;
  x: number;
  y: number;
  type: 'coins' | 'ammo' | 'medkit' | 'armor';
  amount: number;
  life: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  isCrit?: boolean;
}
