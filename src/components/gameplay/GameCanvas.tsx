import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  BloodDecal,
  BulletEntity,
  FloatingText,
  GrenadeEntity,
  LootDrop,
  Mission,
  ParticleEntity,
  PlayerEntity,
  PlayerStats,
  SpitEntity,
  Weapon,
  WeaponId,
  ZombieEntity,
  ZombieType,
} from '../../types/game';
import { sound } from '../../services/sound';
import { GameHUD } from './GameHUD';
import { PauseModal } from './PauseModal';
import { GameOverModal } from './GameOverModal';
import { MissionCompleteModal } from './MissionCompleteModal';
import { RotateCw, Crosshair, Bomb, Plus } from 'lucide-react';

interface GameCanvasProps {
  playerStats: PlayerStats;
  weapons: Weapon[];
  mission: Mission;
  inventoryMedkits: number;
  inventoryGrenades: number;
  soundEnabled: boolean;
  onUpdatePlayerStats: (stats: Partial<PlayerStats>) => void;
  onMissionComplete: (rewardCoins: number, rewardXp: number, kills: number) => void;
  onQuitToMenu: () => void;
  onOpenRewardedAd: (reason: 'revive' | 'double_coins') => void;
  onUseInventoryItem: (type: 'medkit' | 'grenade') => boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  playerStats,
  weapons,
  mission,
  inventoryMedkits,
  inventoryGrenades,
  soundEnabled,
  onUpdatePlayerStats,
  onMissionComplete,
  onQuitToMenu,
  onOpenRewardedAd,
  onUseInventoryItem,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active weapon state
  const [selectedWeaponId, setSelectedWeaponId] = useState<WeaponId>(playerStats.selectedWeaponId);
  const activeWeapon = weapons.find((w) => w.id === selectedWeaponId) || weapons[0];

  const [currentMag, setCurrentMag] = useState<number>(activeWeapon.currentMag);
  const [reserveAmmo, setReserveAmmo] = useState<number>(activeWeapon.reserveAmmo);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [reloadProgress, setReloadProgress] = useState<number>(0);

  // Combat status state
  const [health, setHealth] = useState<number>(playerStats.health);
  const [armor, setArmor] = useState<number>(playerStats.armor);
  const [kills, setKills] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [coinsEarned, setCoinsEarned] = useState<number>(0);
  const [accuracyHits, setAccuracyHits] = useState<number>(0);
  const [totalShotsFired, setTotalShotsFired] = useState<number>(0);

  // Screen shake & damage vignette
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);
  const [damageFlash, setDamageFlash] = useState<boolean>(false);

  // Modals
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);

  // Virtual Controls State
  const joystickCenterRef = useRef<{ x: number; y: number } | null>(null);
  const joystickTouchIdRef = useRef<number | null>(null);
  const [joystickThumb, setJoystickThumb] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const moveVectorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const aimVectorRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 });
  const isFiringRef = useRef<boolean>(false);

  // Keyboard controls tracking
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // Core Game Entities References (kept in mutable ref for 60fps canvas performance)
  const playerRef = useRef<PlayerEntity>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    radius: 20,
    speed: 3.4,
    isFiring: false,
    isReloading: false,
    reloadProgress: 0,
    lastShotTime: 0,
    invincibleTimer: 0,
  });

  const zombiesRef = useRef<ZombieEntity[]>([]);
  const bulletsRef = useRef<BulletEntity[]>([]);
  const spitRef = useRef<SpitEntity[]>([]);
  const grenadesRef = useRef<GrenadeEntity[]>([]);
  const particlesRef = useRef<ParticleEntity[]>([]);
  const bloodDecalsRef = useRef<BloodDecal[]>([]);
  const lootDropsRef = useRef<LootDrop[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  const lastSpawnTimeRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const gameActiveRef = useRef<boolean>(true);

  // Start ambient audio tension
  useEffect(() => {
    sound.startAmbientDrone();
    return () => {
      sound.stopAmbientDrone();
    };
  }, []);

  // Sync health/armor into persistent state when updated
  useEffect(() => {
    onUpdatePlayerStats({ health, armor });
  }, [health, armor, onUpdatePlayerStats]);

  // Sync weapon mag when switching
  const handleSwitchWeapon = useCallback((id: WeaponId) => {
    const w = weapons.find((item) => item.id === id);
    if (!w || !w.unlocked) return;
    setSelectedWeaponId(id);
    setCurrentMag(w.currentMag);
    setReserveAmmo(w.reserveAmmo);
    setIsReloading(false);
    playerRef.current.isReloading = false;
  }, [weapons]);

  // Reload action
  const handleReload = useCallback(() => {
    if (isReloading || currentMag >= activeWeapon.magCapacity || reserveAmmo <= 0) return;
    setIsReloading(true);
    playerRef.current.isReloading = true;
    sound.playReload();

    const reloadDuration = activeWeapon.reloadTimeMs;
    const startTime = performance.now();

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / reloadDuration);
      setReloadProgress(progress);

      if (progress >= 1) {
        clearInterval(interval);
        const needed = activeWeapon.magCapacity - currentMag;
        const take = Math.min(needed, reserveAmmo);
        setCurrentMag((prev) => prev + take);
        setReserveAmmo((prev) => prev - take);
        setIsReloading(false);
        playerRef.current.isReloading = false;
        setReloadProgress(0);
      }
    }, 50);
  }, [isReloading, currentMag, activeWeapon, reserveAmmo]);

  // Throw Grenade
  const handleUseGrenade = useCallback(() => {
    if (inventoryGrenades <= 0) return;
    const used = onUseInventoryItem('grenade');
    if (!used) return;

    sound.playClick();
    const p = playerRef.current;
    const aim = aimVectorRef.current;
    grenadesRef.current.push({
      id: `grenade_${Date.now()}_${Math.random()}`,
      x: p.x,
      y: p.y,
      vx: aim.x * 7,
      vy: aim.y * 7,
      timer: 70, // ~1.2s fuse
      radius: 6,
    });
  }, [inventoryGrenades, onUseInventoryItem]);

  // Use Medkit
  const handleUseMedkit = useCallback(() => {
    if (inventoryMedkits <= 0 || health >= playerStats.maxHealth) return;
    const used = onUseInventoryItem('medkit');
    if (!used) return;

    sound.playPickup();
    setHealth((prev) => Math.min(playerStats.maxHealth, prev + 50));
    floatingTextsRef.current.push({
      id: `heal_${Date.now()}`,
      x: playerRef.current.x,
      y: playerRef.current.y - 30,
      text: '+50 HP HEALED',
      color: '#10b981',
      alpha: 1,
      life: 60,
    });
  }, [inventoryMedkits, health, playerStats.maxHealth, onUseInventoryItem]);

  // Trigger Screen Shake
  const triggerScreenShake = useCallback(() => {
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 150);
  }, []);

  // Keyboard Event Listeners for WASD / Arrow movement and Space/R/G hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = true;
      if (e.code === 'KeyR') handleReload();
      if (e.code === 'KeyG') handleUseGrenade();
      if (e.code === 'KeyH') handleUseMedkit();
      if (e.code === 'Digit1') handleSwitchWeapon('pistol');
      if (e.code === 'Digit2') handleSwitchWeapon('shotgun');
      if (e.code === 'Digit3') handleSwitchWeapon('rifle');
      if (e.code === 'Digit4') handleSwitchWeapon('sniper');
      if (e.code === 'Space') isFiringRef.current = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
      if (e.code === 'Space') isFiringRef.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleReload, handleUseGrenade, handleUseMedkit, handleSwitchWeapon]);

  // Initialize Canvas & Game Entities
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
        if (playerRef.current.x === 0 && playerRef.current.y === 0) {
          playerRef.current.x = canvas.width / 2;
          playerRef.current.y = canvas.height / 2;
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial zombie spawn wave
    zombiesRef.current = [
      {
        id: 'z_init_1',
        type: 'walker',
        x: canvas.width / 2 - 250,
        y: canvas.height / 2 - 180,
        vx: 0,
        vy: 0,
        angle: 0,
        radius: 18,
        health: 50,
        maxHealth: 50,
        speed: 1.1,
        damage: 12,
        attackCooldown: 0,
        lastAttackTime: 0,
        hitFlashTimer: 0,
        animFrame: 0,
      },
      {
        id: 'z_init_2',
        type: 'runner',
        x: canvas.width / 2 + 280,
        y: canvas.height / 2 + 150,
        vx: 0,
        vy: 0,
        angle: 0,
        radius: 16,
        health: 35,
        maxHealth: 35,
        speed: 2.2,
        damage: 10,
        attackCooldown: 0,
        lastAttackTime: 0,
        hitFlashTimer: 0,
        animFrame: 0,
      },
    ];

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // MAIN GAME LOOP (Physics, AI, Shooting, Splatters, Rendering)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastFrameTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(60, currentTime - lastFrameTime);
      lastFrameTime = currentTime;

      if (!isPaused && !isGameOver && gameActiveRef.current) {
        // --- 1. PLAYER INPUT & MOVEMENT ---
        const player = playerRef.current;

        // Combine Virtual Joystick and Keyboard WASD
        let moveX = moveVectorRef.current.x;
        let moveY = moveVectorRef.current.y;

        const keys = keysPressedRef.current;
        if (keys['KeyW'] || keys['ArrowUp']) moveY -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) moveY += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

        const moveLen = Math.hypot(moveX, moveY);
        if (moveLen > 0.1) {
          player.vx = (moveX / Math.max(1, moveLen)) * player.speed;
          player.vy = (moveY / Math.max(1, moveLen)) * player.speed;
        } else {
          player.vx *= 0.7;
          player.vy *= 0.7;
        }

        player.x += player.vx;
        player.y += player.vy;

        // Clamp player inside city street arena
        const padding = 25;
        player.x = Math.max(padding, Math.min(canvas.width - padding, player.x));
        player.y = Math.max(padding, Math.min(canvas.height - padding, player.y));

        // Aim angle
        player.angle = Math.atan2(aimVectorRef.current.y, aimVectorRef.current.x);

        // Invincibility countdown
        if (player.invincibleTimer > 0) {
          player.invincibleTimer -= 1;
        }

        // --- 2. SHOOTING MECHANICS ---
        const now = performance.now();
        if (
          isFiringRef.current &&
          !player.isReloading &&
          currentMag > 0 &&
          now - player.lastShotTime >= activeWeapon.fireRateMs
        ) {
          player.lastShotTime = now;
          setCurrentMag((prev) => {
            const nextMag = prev - 1;
            if (nextMag === 0) {
              setTimeout(() => handleReload(), 100);
            }
            return nextMag;
          });

          setTotalShotsFired((prev) => prev + 1);

          // Audio gunshot
          sound.playGunshot(activeWeapon.id);

          // Muzzle flash recoil screen micro-shake
          if (activeWeapon.id === 'shotgun' || activeWeapon.id === 'sniper') {
            triggerScreenShake();
          }

          // Bullet creation
          const baseAngle = player.angle;
          const pelletCount = activeWeapon.pelletCount || 1;

          for (let p = 0; p < pelletCount; p++) {
            const angleOffset = (Math.random() - 0.5) * activeWeapon.spread;
            const shotAngle = baseAngle + angleOffset;
            const isCrit = Math.random() < (activeWeapon.id === 'sniper' ? 0.45 : 0.15);

            bulletsRef.current.push({
              id: `b_${now}_${p}`,
              x: player.x + Math.cos(baseAngle) * 25,
              y: player.y + Math.sin(baseAngle) * 25,
              vx: Math.cos(shotAngle) * activeWeapon.bulletSpeed,
              vy: Math.sin(shotAngle) * activeWeapon.bulletSpeed,
              radius: activeWeapon.id === 'sniper' ? 3.5 : 2.5,
              damage: isCrit ? activeWeapon.damage * 2 : activeWeapon.damage,
              rangeRemaining: activeWeapon.id === 'sniper' ? 1200 : 700,
              isCrit,
              color: isCrit ? '#f59e0b' : '#38bdf8',
            });
          }

          // Eject shell casing particles
          particlesRef.current.push({
            id: `shell_${now}`,
            x: player.x,
            y: player.y,
            vx: Math.cos(baseAngle - Math.PI / 2) * (2 + Math.random()),
            vy: Math.sin(baseAngle - Math.PI / 2) * (2 + Math.random()),
            life: 25,
            maxLife: 25,
            color: '#fbbf24',
            size: 2,
            alpha: 1,
          });
        }

        // --- 3. BULLETS UPDATE & COLLISION ---
        const bullets = bulletsRef.current;
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          b.x += b.vx;
          b.y += b.vy;
          b.rangeRemaining -= Math.hypot(b.vx, b.vy);

          let bulletHit = false;

          // Check hit against zombies
          for (let z = 0; z < zombiesRef.current.length; z++) {
            const zombie = zombiesRef.current[z];
            const dist = Math.hypot(b.x - zombie.x, b.y - zombie.y);
            if (dist < zombie.radius + b.radius) {
              bulletHit = true;
              zombie.health -= b.damage;
              zombie.hitFlashTimer = 6;
              setAccuracyHits((prev) => prev + 1);

              sound.playZombieHit();

              // Floating damage text
              floatingTextsRef.current.push({
                id: `dmg_${now}_${i}`,
                x: zombie.x + (Math.random() - 0.5) * 15,
                y: zombie.y - 15,
                text: b.isCrit ? `CRIT ${Math.round(b.damage)}!` : `${Math.round(b.damage)}`,
                color: b.isCrit ? '#ef4444' : '#fbbf24',
                alpha: 1,
                life: 35,
                isCrit: b.isCrit,
              });

              // Blood splatter particles
              for (let s = 0; s < 5; s++) {
                particlesRef.current.push({
                  id: `blood_${now}_${s}`,
                  x: zombie.x,
                  y: zombie.y,
                  vx: (Math.random() - 0.5) * 4 + b.vx * 0.1,
                  vy: (Math.random() - 0.5) * 4 + b.vy * 0.1,
                  life: 20,
                  maxLife: 20,
                  color: '#991b1b',
                  size: 2 + Math.random() * 2,
                  alpha: 1,
                });
              }

              // Knockback
              zombie.x += b.vx * 0.12;
              zombie.y += b.vy * 0.12;
              break;
            }
          }

          if (bulletHit || b.rangeRemaining <= 0 || b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            bullets.splice(i, 1);
          }
        }

        // --- 4. GRENADES UPDATE ---
        const grenades = grenadesRef.current;
        for (let g = grenades.length - 1; g >= 0; g--) {
          const gr = grenades[g];
          gr.x += gr.vx;
          gr.y += gr.vy;
          gr.vx *= 0.94;
          gr.vy *= 0.94;
          gr.timer -= 1;

          if (gr.timer <= 0) {
            // DETONATE EXPLOSION
            sound.playExplosion();
            triggerScreenShake();

            // Destroy nearby zombies in blast radius 160px
            const blastRadius = 160;
            zombiesRef.current.forEach((zombie) => {
              const d = Math.hypot(zombie.x - gr.x, zombie.y - gr.y);
              if (d < blastRadius) {
                const blastDmg = Math.round(260 * (1 - d / blastRadius));
                zombie.health -= blastDmg;
                zombie.hitFlashTimer = 10;
                floatingTextsRef.current.push({
                  id: `blast_dmg_${now}_${zombie.id}`,
                  x: zombie.x,
                  y: zombie.y - 20,
                  text: `BOOM ${blastDmg}!`,
                  color: '#f97316',
                  alpha: 1,
                  life: 45,
                  isCrit: true,
                });
              }
            });

            // Explosion shockwave particles
            for (let e = 0; e < 35; e++) {
              const pAngle = Math.random() * Math.PI * 2;
              const pSpeed = 3 + Math.random() * 8;
              particlesRef.current.push({
                id: `exp_${now}_${e}`,
                x: gr.x,
                y: gr.y,
                vx: Math.cos(pAngle) * pSpeed,
                vy: Math.sin(pAngle) * pSpeed,
                life: 30 + Math.random() * 15,
                maxLife: 45,
                color: e % 2 === 0 ? '#ef4444' : '#f59e0b',
                size: 3 + Math.random() * 4,
                alpha: 1,
              });
            }

            // Scorch decal
            bloodDecalsRef.current.push({
              x: gr.x,
              y: gr.y,
              radius: 40,
              alpha: 0.8,
              rotation: Math.random() * Math.PI,
            });

            grenades.splice(g, 1);
          }
        }

        // --- 5. SPIT PROJECTILES (Spitter Zombies) ---
        const spits = spitRef.current;
        for (let s = spits.length - 1; s >= 0; s--) {
          const sp = spits[s];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.life -= 1;

          // Check hit against player
          const distToPlayer = Math.hypot(sp.x - player.x, sp.y - player.y);
          if (distToPlayer < player.radius + sp.radius) {
            // Player hit by acid
            sound.playPlayerHurt();
            setDamageFlash(true);
            setTimeout(() => setDamageFlash(false), 200);

            setArmor((prevArmor) => {
              if (prevArmor > 0) {
                const absorbed = Math.min(prevArmor, sp.damage);
                return prevArmor - absorbed;
              }
              setHealth((prevHealth) => Math.max(0, prevHealth - sp.damage));
              return 0;
            });

            spits.splice(s, 1);
            continue;
          }

          if (sp.life <= 0 || sp.x < 0 || sp.x > canvas.width || sp.y < 0 || sp.y > canvas.height) {
            spits.splice(s, 1);
          }
        }

        // --- 6. ZOMBIES AI & BEHAVIOR ---
        const zombies = zombiesRef.current;
        for (let z = zombies.length - 1; z >= 0; z--) {
          const zombie = zombies[z];

          // Check if zombie died
          if (zombie.health <= 0) {
            sound.playZombieGroan(zombie.isBoss);

            // Add kill & score
            setKills((prev) => {
              const nextKills = prev + 1;
              if (nextKills >= mission.targetKills) {
                // VICTORY!
                setIsVictory(true);
                setIsGameOver(true);
                sound.playVictory();
                onMissionComplete(mission.rewardCoins, mission.rewardXp, nextKills);
              }
              return nextKills;
            });

            const points = zombie.isBoss ? 500 : zombie.type === 'spitter' ? 120 : zombie.type === 'runner' ? 90 : 50;
            setScore((prev) => prev + points);

            // Blood puddle decal
            bloodDecalsRef.current.push({
              x: zombie.x,
              y: zombie.y,
              radius: zombie.isBoss ? 35 : 18 + Math.random() * 8,
              alpha: 0.7,
              rotation: Math.random() * Math.PI * 2,
            });

            // Random Loot Drop (Coin, Ammo, Medkit, Armor)
            const dropChance = Math.random();
            if (dropChance < 0.45) {
              lootDropsRef.current.push({
                id: `loot_${now}_${zombie.id}`,
                x: zombie.x,
                y: zombie.y,
                type: dropChance < 0.25 ? 'coins' : dropChance < 0.35 ? 'ammo' : 'medkit',
                amount: dropChance < 0.25 ? 40 + Math.round(Math.random() * 40) : 1,
                life: 600, // 10 seconds before despawn
              });
            }

            zombies.splice(z, 1);
            continue;
          }

          // Hit flash decay
          if (zombie.hitFlashTimer > 0) zombie.hitFlashTimer -= 1;

          // Animation frame
          zombie.animFrame += 0.1;

          // Angle toward player
          const dx = player.x - zombie.x;
          const dy = player.y - zombie.y;
          const distToPlayer = Math.hypot(dx, dy);
          zombie.angle = Math.atan2(dy, dx);

          // Spitter ranged attack
          if (zombie.type === 'spitter' && distToPlayer < 350 && distToPlayer > 120) {
            if (now - zombie.lastAttackTime > 2500) {
              zombie.lastAttackTime = now;
              // Spit projectile
              const spAngle = zombie.angle;
              spitRef.current.push({
                id: `spit_${now}_${zombie.id}`,
                x: zombie.x + Math.cos(spAngle) * 20,
                y: zombie.y + Math.sin(spAngle) * 20,
                vx: Math.cos(spAngle) * 5.5,
                vy: Math.sin(spAngle) * 5.5,
                damage: 18,
                radius: 6,
                life: 80,
              });
            }
          }

          // Move toward player
          if (distToPlayer > player.radius + zombie.radius) {
            zombie.vx = (dx / distToPlayer) * zombie.speed;
            zombie.vy = (dy / distToPlayer) * zombie.speed;
            zombie.x += zombie.vx;
            zombie.y += zombie.vy;
          } else {
            // Melee Attack on Player
            if (now - zombie.lastAttackTime > (zombie.isBoss ? 1600 : 900)) {
              zombie.lastAttackTime = now;
              sound.playPlayerHurt();
              setDamageFlash(true);
              setTimeout(() => setDamageFlash(false), 200);
              triggerScreenShake();

              const dmg = zombie.damage;
              setArmor((prevArmor) => {
                if (prevArmor > 0) {
                  const absorb = Math.min(prevArmor, dmg);
                  const remainder = dmg - absorb;
                  if (remainder > 0) {
                    setHealth((prevHealth) => {
                      const finalHealth = Math.max(0, prevHealth - remainder);
                      if (finalHealth <= 0) {
                        setIsGameOver(true);
                        setIsVictory(false);
                      }
                      return finalHealth;
                    });
                  }
                  return prevArmor - absorb;
                }
                setHealth((prevHealth) => {
                  const finalHealth = Math.max(0, prevHealth - dmg);
                  if (finalHealth <= 0) {
                    setIsGameOver(true);
                    setIsVictory(false);
                  }
                  return finalHealth;
                });
                return 0;
              });
            }
          }
        }

        // --- 7. ZOMBIE WAVE SPAWNER ---
        if (now - lastSpawnTimeRef.current > 2400 && zombiesRef.current.length < 18) {
          lastSpawnTimeRef.current = now;

          // Spawn from screen edges
          const edge = Math.floor(Math.random() * 4);
          let spawnX = 0;
          let spawnY = 0;

          if (edge === 0) {
            spawnX = Math.random() * canvas.width;
            spawnY = -30;
          } else if (edge === 1) {
            spawnX = canvas.width + 30;
            spawnY = Math.random() * canvas.height;
          } else if (edge === 2) {
            spawnX = Math.random() * canvas.width;
            spawnY = canvas.height + 30;
          } else {
            spawnX = -30;
            spawnY = Math.random() * canvas.height;
          }

          // Random zombie type
          const randType = Math.random();
          let zType: ZombieType = 'walker';
          let zHealth = 55;
          let zSpeed = 1.15;
          let zDmg = 12;
          let zRadius = 18;
          let isBoss = false;

          // Boss spawn chance or hard mission
          if (mission.difficulty === 'NIGHTMARE' && randType > 0.88 && !zombiesRef.current.some((z) => z.isBoss)) {
            zType = 'brute';
            zHealth = 420;
            zSpeed = 0.9;
            zDmg = 35;
            zRadius = 32;
            isBoss = true;
          } else if (randType > 0.7) {
            zType = 'runner';
            zHealth = 38;
            zSpeed = 2.4;
            zDmg = 10;
            zRadius = 16;
          } else if (randType > 0.5) {
            zType = 'spitter';
            zHealth = 50;
            zSpeed = 1.3;
            zDmg = 15;
            zRadius = 18;
          }

          zombiesRef.current.push({
            id: `z_${now}`,
            type: zType,
            x: spawnX,
            y: spawnY,
            vx: 0,
            vy: 0,
            angle: 0,
            radius: zRadius,
            health: zHealth,
            maxHealth: zHealth,
            speed: zSpeed,
            damage: zDmg,
            attackCooldown: 0,
            lastAttackTime: 0,
            isBoss,
            hitFlashTimer: 0,
            animFrame: 0,
          });
        }

        // --- 8. LOOT DROPS PICKUP ---
        const loots = lootDropsRef.current;
        for (let l = loots.length - 1; l >= 0; l--) {
          const loot = loots[l];
          loot.life -= 1;
          const distToPlayer = Math.hypot(loot.x - player.x, loot.y - player.y);

          // Magnetic pickup when player is close
          if (distToPlayer < 45) {
            sound.playPickup();

            if (loot.type === 'coins') {
              setCoinsEarned((prev) => prev + loot.amount);
              floatingTextsRef.current.push({
                id: `coin_${now}_${l}`,
                x: loot.x,
                y: loot.y - 10,
                text: `+${loot.amount} COINS`,
                color: '#fbbf24',
                alpha: 1,
                life: 40,
              });
            } else if (loot.type === 'ammo') {
              setReserveAmmo((prev) => prev + 25);
              floatingTextsRef.current.push({
                id: `ammo_${now}_${l}`,
                x: loot.x,
                y: loot.y - 10,
                text: '+25 AMMO',
                color: '#38bdf8',
                alpha: 1,
                life: 40,
              });
            } else if (loot.type === 'medkit') {
              setHealth((prev) => Math.min(playerStats.maxHealth, prev + 35));
              floatingTextsRef.current.push({
                id: `med_${now}_${l}`,
                x: loot.x,
                y: loot.y - 10,
                text: '+35 HP',
                color: '#10b981',
                alpha: 1,
                life: 40,
              });
            }

            loots.splice(l, 1);
            continue;
          }

          if (loot.life <= 0) {
            loots.splice(l, 1);
          }
        }

        // --- 9. PARTICLES & FLOATING TEXTS ---
        for (let p = particlesRef.current.length - 1; p >= 0; p--) {
          const pt = particlesRef.current[p];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life -= 1;
          pt.alpha = pt.life / pt.maxLife;
          if (pt.life <= 0) particlesRef.current.splice(p, 1);
        }

        for (let ft = floatingTextsRef.current.length - 1; ft >= 0; ft--) {
          const txt = floatingTextsRef.current[ft];
          txt.y -= 0.8;
          txt.life -= 1;
          txt.alpha = Math.max(0, txt.life / 35);
          if (txt.life <= 0) floatingTextsRef.current.splice(ft, 1);
        }
      }

      // =========================================================================
      // --- RENDERING PIPELINE ---
      // =========================================================================
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Post-Apocalyptic Asphalt Street & Grid Markings
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Road markings & crosswalk
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Yellow Broken Road Divider
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.setLineDash([20, 20]);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Render Permanent Blood Decals on Asphalt
      bloodDecalsRef.current.forEach((decal) => {
        ctx.save();
        ctx.translate(decal.x, decal.y);
        ctx.rotate(decal.rotation);
        ctx.fillStyle = `rgba(127, 29, 29, ${decal.alpha * 0.7})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, decal.radius, decal.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 3. Render Loot Drops
      lootDropsRef.current.forEach((loot) => {
        ctx.save();
        ctx.translate(loot.x, loot.y);

        // Pulsing glow
        ctx.shadowBlur = 12;
        if (loot.type === 'coins') {
          ctx.shadowColor = '#fbbf24';
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(0, 0, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$', 0, 0);
        } else if (loot.type === 'ammo') {
          ctx.shadowColor = '#38bdf8';
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-7, -7, 14, 14);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('A', 0, 0);
        } else {
          ctx.shadowColor = '#10b981';
          ctx.fillStyle = '#059669';
          ctx.fillRect(-8, -8, 16, 16);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('+', 0, 0);
        }
        ctx.restore();
      });

      // 4. Render Grenades
      grenadesRef.current.forEach((gr) => {
        ctx.save();
        ctx.translate(gr.x, gr.y);
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(0, 0, gr.radius, 0, Math.PI * 2);
        ctx.fill();
        // Flashing fuse light
        if (gr.timer % 6 < 3) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(0, -gr.radius, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 5. Render Zombies
      zombiesRef.current.forEach((zombie) => {
        ctx.save();
        ctx.translate(zombie.x, zombie.y);
        ctx.rotate(zombie.angle);

        // Hit flash or regular zombie color
        if (zombie.hitFlashTimer > 0) {
          ctx.fillStyle = '#ffffff';
        } else if (zombie.isBoss) {
          ctx.fillStyle = '#7f1d1d'; // Crimson Goliath
        } else if (zombie.type === 'runner') {
          ctx.fillStyle = '#b91c1c'; // Fast red
        } else if (zombie.type === 'spitter') {
          ctx.fillStyle = '#047857'; // Toxic green
        } else {
          ctx.fillStyle = '#334155'; // Walker slate
        }

        // Zombie Body
        ctx.beginPath();
        ctx.arc(0, 0, zombie.radius, 0, Math.PI * 2);
        ctx.fill();

        // Zombie Arms (Walking Claw Motion)
        const armWiggle = Math.sin(zombie.animFrame) * 4;
        ctx.fillRect(zombie.radius * 0.5, -zombie.radius * 0.6 + armWiggle, 12, 5);
        ctx.fillRect(zombie.radius * 0.5, zombie.radius * 0.3 - armWiggle, 12, 5);

        // Glowing Red/Green Eyes
        ctx.fillStyle = zombie.type === 'spitter' ? '#4ade80' : '#ef4444';
        ctx.beginPath();
        ctx.arc(zombie.radius * 0.4, -zombie.radius * 0.35, zombie.isBoss ? 4 : 2.5, 0, Math.PI * 2);
        ctx.arc(zombie.radius * 0.4, zombie.radius * 0.35, zombie.isBoss ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Zombie Health Bar Above Head
        const barWidth = zombie.isBoss ? 60 : 30;
        const barHeight = zombie.isBoss ? 6 : 3.5;
        const hpPct = Math.max(0, zombie.health / zombie.maxHealth);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(zombie.x - barWidth / 2, zombie.y - zombie.radius - 14, barWidth, barHeight);
        ctx.fillStyle = zombie.isBoss ? '#f59e0b' : '#ef4444';
        ctx.fillRect(zombie.x - barWidth / 2, zombie.y - zombie.radius - 14, barWidth * hpPct, barHeight);

        // Boss label
        if (zombie.isBoss) {
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 10px Chakra Petch, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('GOLIATH BRUTE', zombie.x, zombie.y - zombie.radius - 18);
        }
      });

      // 6. Render Acid Spit Projectiles
      spitRef.current.forEach((sp) => {
        ctx.save();
        ctx.translate(sp.x, sp.y);
        ctx.fillStyle = '#22c55e';
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, sp.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 7. Render Bullets & Tracers
      bulletsRef.current.forEach((b) => {
        ctx.save();
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.radius;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - b.vx * 1.5, b.y - b.vy * 1.5);
        ctx.stroke();
        ctx.restore();
      });

      // 8. Render Player Survivor
      const p = playerRef.current;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);

      // Flashlight beam illuminating city street in front
      const flashGrad = ctx.createRadialGradient(0, 0, 15, 0, 0, 360);
      flashGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
      flashGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.1)');
      flashGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 360, -0.4, 0.4);
      ctx.closePath();
      ctx.fill();

      // Survivor Body / Tactical Armor
      ctx.fillStyle = '#1e3a5f'; // Tactical navy vest
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Survivor Tactical Helmet / Visor
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, p.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();

      // Survivor Weapon Barrel
      ctx.fillStyle = '#475569';
      if (activeWeapon.id === 'sniper') {
        ctx.fillRect(p.radius * 0.3, -3.5, 32, 7);
      } else if (activeWeapon.id === 'rifle') {
        ctx.fillRect(p.radius * 0.3, -3, 24, 6);
      } else if (activeWeapon.id === 'shotgun') {
        ctx.fillRect(p.radius * 0.3, -4, 20, 8);
      } else {
        // Pistol
        ctx.fillRect(p.radius * 0.3, -2.5, 14, 5);
      }

      // Muzzle Flash Effect when Firing
      if (isFiringRef.current && !p.isReloading && currentMag > 0) {
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        const barrelLen = activeWeapon.id === 'sniper' ? 36 : activeWeapon.id === 'rifle' ? 28 : 22;
        ctx.arc(barrelLen, 0, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // 9. Render Particles
      particlesRef.current.forEach((pt) => {
        ctx.save();
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 10. Render Floating Damage Numbers
      floatingTextsRef.current.forEach((ft) => {
        ctx.save();
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.alpha;
        ctx.font = ft.isCrit ? 'bold 15px Chakra Petch, sans-serif' : 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // Request next frame
      animationFrameIdRef.current = requestAnimationFrame(loop);
    };

    animationFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [
    isPaused,
    isGameOver,
    currentMag,
    activeWeapon,
    triggerScreenShake,
    handleReload,
    mission,
    onMissionComplete,
    playerStats.maxHealth,
  ]);

  // Touch Handling for Virtual Movement Joystick
  const handleJoystickTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    joystickCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    joystickTouchIdRef.current = touch.identifier;

    const dx = touch.clientX - joystickCenterRef.current.x;
    const dy = touch.clientY - joystickCenterRef.current.y;
    const maxDist = 45;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxDist);
    const angle = Math.atan2(dy, dx);

    const thumbX = Math.cos(angle) * clampedDist;
    const thumbY = Math.sin(angle) * clampedDist;

    setJoystickThumb({ x: thumbX, y: thumbY });
    moveVectorRef.current = { x: thumbX / maxDist, y: thumbY / maxDist };
  };

  const handleJoystickTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!joystickCenterRef.current || joystickTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        const dx = touch.clientX - joystickCenterRef.current.x;
        const dy = touch.clientY - joystickCenterRef.current.y;
        const maxDist = 45;
        const dist = Math.hypot(dx, dy);
        const clampedDist = Math.min(dist, maxDist);
        const angle = Math.atan2(dy, dx);

        const thumbX = Math.cos(angle) * clampedDist;
        const thumbY = Math.sin(angle) * clampedDist;

        setJoystickThumb({ x: thumbX, y: thumbY });
        moveVectorRef.current = { x: thumbX / maxDist, y: thumbY / maxDist };
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        joystickCenterRef.current = null;
        setJoystickThumb({ x: 0, y: 0 });
        moveVectorRef.current = { x: 0, y: 0 };
        break;
      }
    }
  };

  // Mouse / Touch Aim Tracker on Canvas
  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;
    const dx = targetX - playerRef.current.x;
    const dy = targetY - playerRef.current.y;
    const len = Math.hypot(dx, dy);
    if (len > 5) {
      aimVectorRef.current = { x: dx / len, y: dy / len };
    }
  };

  // Restart Handler
  const handleRestart = () => {
    setHealth(playerStats.maxHealth);
    setArmor(playerStats.maxArmor);
    setKills(0);
    setScore(0);
    setCoinsEarned(0);
    setAccuracyHits(0);
    setTotalShotsFired(0);
    setIsGameOver(false);
    setIsVictory(false);
    setIsPaused(false);

    zombiesRef.current = [];
    bulletsRef.current = [];
    spitRef.current = [];
    grenadesRef.current = [];
    particlesRef.current = [];
    bloodDecalsRef.current = [];
    lootDropsRef.current = [];
  };

  const accuracyPct = totalShotsFired > 0 ? Math.min(100, Math.round((accuracyHits / totalShotsFired) * 100)) : 100;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex-1 bg-black overflow-hidden select-none touch-none ${
        isScreenShaking ? 'animate-screen-shake' : ''
      }`}
    >
      {/* Red Damage Vignette Pulse */}
      {damageFlash && (
        <div className="absolute inset-0 z-20 pointer-events-none bg-red-600/35 border-8 border-red-600 transition-opacity animate-pulse" />
      )}

      {/* Main 2D Canvas */}
      <canvas
        ref={canvasRef}
        onPointerMove={handleCanvasPointerMove}
        onPointerDown={(e) => {
          handleCanvasPointerMove(e);
          isFiringRef.current = true;
        }}
        onPointerUp={() => {
          isFiringRef.current = false;
        }}
        className="w-full h-full block cursor-crosshair"
      />

      {/* TACTICAL GAME HUD */}
      <GameHUD
        health={health}
        maxHealth={playerStats.maxHealth}
        armor={armor}
        maxArmor={playerStats.maxArmor}
        currentWeapon={activeWeapon}
        allWeapons={weapons}
        currentMag={currentMag}
        reserveAmmo={reserveAmmo}
        isReloading={isReloading}
        reloadProgress={reloadProgress}
        mission={mission}
        killCount={kills}
        score={score}
        coinsEarned={coinsEarned}
        grenadesCount={inventoryGrenades}
        medkitsCount={inventoryMedkits}
        onPause={() => setIsPaused(true)}
        onReload={handleReload}
        onSwitchWeapon={handleSwitchWeapon}
        onUseGrenade={handleUseGrenade}
        onUseMedkit={handleUseMedkit}
      />

      {/* ON-SCREEN VIRTUAL JOYSTICK (Bottom-Left) */}
      <div
        onTouchStart={handleJoystickTouchStart}
        onTouchMove={handleJoystickTouchMove}
        onTouchEnd={handleJoystickTouchEnd}
        className="absolute bottom-6 left-6 z-40 w-32 h-32 rounded-full bg-slate-950/70 border-2 border-slate-700/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto touch-none shadow-2xl active:border-red-500/80 transition-colors"
      >
        {/* Center Origin Mark */}
        <div className="w-8 h-8 rounded-full border border-slate-600/60 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-slate-400" />
        </div>

        {/* Movable Joystick Thumb Head */}
        <div
          className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-amber-600 border-2 border-white/60 shadow-lg shadow-red-950 flex items-center justify-center transition-transform duration-75"
          style={{
            transform: `translate(${joystickThumb.x}px, ${joystickThumb.y}px)`,
          }}
        >
          <div className="w-6 h-6 rounded-full bg-red-950/60 border border-white/40" />
        </div>
      </div>

      {/* ON-SCREEN SHOOT & RELOAD BUTTONS (Bottom-Right) */}
      <div className="absolute bottom-6 right-6 z-40 flex items-center gap-3 pointer-events-auto select-none">
        {/* Reload Button */}
        <button
          onClick={handleReload}
          disabled={isReloading || currentMag >= activeWeapon.magCapacity}
          className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center backdrop-blur-md shadow-xl active:scale-90 transition-all ${
            isReloading
              ? 'bg-amber-950/80 border-amber-500 text-amber-400 animate-spin'
              : 'bg-slate-950/85 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
          }`}
          title="Reload (R)"
        >
          <RotateCw className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-mono font-bold">RELOAD</span>
        </button>

        {/* PRIMARY SHOOT BUTTON */}
        <button
          onPointerDown={() => {
            isFiringRef.current = true;
          }}
          onPointerUp={() => {
            isFiringRef.current = false;
          }}
          onPointerLeave={() => {
            isFiringRef.current = false;
          }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 via-red-500 to-amber-600 border-2 border-red-300/80 shadow-[0_0_30px_rgba(239,68,68,0.7)] flex flex-col items-center justify-center active:scale-95 transition-transform"
          title="Fire Weapon (Space / Hold)"
        >
          <Crosshair className="w-8 h-8 text-white mb-0.5" />
          <span className="text-[10px] font-heading font-black tracking-widest text-white uppercase leading-none">
            FIRE
          </span>
        </button>
      </div>

      {/* PAUSE MODAL */}
      <PauseModal
        isOpen={isPaused}
        soundEnabled={soundEnabled}
        onToggleSound={() => sound.setConfig(!soundEnabled, soundEnabled, 0.8)}
        onResume={() => setIsPaused(false)}
        onRestart={handleRestart}
        onQuitToMenu={onQuitToMenu}
      />

      {/* MISSION FAILED MODAL */}
      <GameOverModal
        isOpen={isGameOver && !isVictory}
        kills={kills}
        score={score}
        coinsEarned={coinsEarned}
        xpEarned={Math.round(kills * 15)}
        accuracy={accuracyPct}
        canRevive={true}
        onRestart={handleRestart}
        onQuitToMenu={onQuitToMenu}
        onWatchRewardedAd={() => {
          onOpenRewardedAd('revive');
        }}
      />

      {/* MISSION COMPLETE MODAL */}
      <MissionCompleteModal
        isOpen={isGameOver && isVictory}
        kills={kills}
        score={score}
        coinsEarned={coinsEarned}
        xpEarned={mission.rewardXp}
        accuracy={accuracyPct}
        missionTitle={mission.title}
        onContinue={() => {
          onQuitToMenu();
        }}
        onWatchRewardedAd={() => {
          onOpenRewardedAd('double_coins');
        }}
      />
    </div>
  );
};
