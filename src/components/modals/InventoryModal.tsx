import React from 'react';
import { InventoryItem, PlayerStats } from '../../types/game';
import { Backpack, Heart, Shield, Bomb, Box, Coins, Plus, X, Check } from 'lucide-react';
import { sound } from '../../services/sound';
import { AdMobBanner } from '../ads/AdMobBanner';

interface InventoryModalProps {
  isOpen: boolean;
  inventory: InventoryItem[];
  playerStats: PlayerStats;
  onBuyItem: (itemId: string) => void;
  onUseItem: (itemId: string) => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  inventory,
  playerStats,
  onBuyItem,
  onUseItem,
  onClose,
}) => {
  if (!isOpen) return null;

  const getItemIcon = (type: InventoryItem['type']) => {
    switch (type) {
      case 'medkit':
        return <Heart className="w-6 h-6 text-red-500 fill-red-500/20" />;
      case 'armor':
        return <Shield className="w-6 h-6 text-sky-400 fill-sky-400/20" />;
      case 'grenade':
        return <Bomb className="w-6 h-6 text-amber-500" />;
      case 'ammo_crate':
        return <Box className="w-6 h-6 text-blue-400" />;
      default:
        return <Backpack className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 select-none animate-fadeIn">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-500">
            <Backpack className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
              SURVIVOR STORAGE
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-white uppercase">
              TACTICAL BACKPACK
            </h2>
          </div>
        </div>

        {/* Currency & Close */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-amber-500/40 px-3 py-1 rounded-lg">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-amber-300 text-sm">
              {playerStats.coins.toLocaleString()}
            </span>
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
      </div>

      {/* Main Grid of Inventory Items */}
      <div className="max-w-4xl mx-auto w-full flex-1 overflow-y-auto py-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {inventory.map((item) => {
          const canAfford = playerStats.coins >= item.cost;
          const isFull = item.count >= item.maxCount;

          return (
            <div
              key={item.id}
              className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0">
                  {getItemIcon(item.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-base text-white">
                      {item.name}
                    </h3>
                    <span className="font-mono font-bold text-xs text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                      x{item.count} / {item.maxCount}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-900 gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    onUseItem(item.id);
                  }}
                  disabled={item.count <= 0}
                  className={`flex-1 py-2 rounded-lg text-xs font-heading font-bold uppercase transition-colors ${
                    item.count > 0
                      ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                      : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                  }`}
                >
                  Use Item
                </button>

                <button
                  onClick={() => {
                    sound.playPickup();
                    onBuyItem(item.id);
                  }}
                  disabled={!canAfford || isFull}
                  className={`flex-1 py-2 rounded-lg text-xs font-heading font-bold uppercase flex items-center justify-center gap-1.5 transition-colors ${
                    isFull
                      ? 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                      : canAfford
                      ? 'bg-amber-600/80 hover:bg-amber-500 text-black border border-amber-400/50 shadow-sm active:scale-95'
                      : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{isFull ? 'Stock Full' : `Buy: ${item.cost}`}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AdMob Banner at bottom */}
      <div className="max-w-4xl mx-auto w-full pt-2">
        <AdMobBanner screenName="Tactical Inventory" />
      </div>
    </div>
  );
};
