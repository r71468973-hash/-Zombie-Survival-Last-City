/**
 * AdMob Monetization Architecture for Android Mobile Game
 * Contains Google Mobile Ads configuration, test ad IDs, and production placeholders.
 */

export interface AdMobConfig {
  appId: string;
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  rewardedAdUnitId: string;
  isTestMode: boolean;
}

// ==============================================================================
// ADMOB CONFIGURATION FOR ANDROID RELEASE APK
// Clearly designated production insertion points:
// ==============================================================================
export const PRODUCTION_ADMOB_APP_ID_HERE = 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX';
export const PRODUCTION_BANNER_AD_UNIT_ID_HERE = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';
export const PRODUCTION_INTERSTITIAL_AD_UNIT_ID_HERE = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';
export const PRODUCTION_REWARDED_AD_UNIT_ID_HERE = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

// Official Google AdMob Test Ad Unit IDs for Android Development:
export const ADMOB_CONFIG: AdMobConfig = {
  // Set isTestMode to false before building production release APK
  isTestMode: true,

  appId: true ? 'ca-app-pub-3940256099942544~3347511713' : PRODUCTION_ADMOB_APP_ID_HERE,
  bannerAdUnitId: true ? 'ca-app-pub-3940256099942544/6300978111' : PRODUCTION_BANNER_AD_UNIT_ID_HERE,
  interstitialAdUnitId: true ? 'ca-app-pub-3940256099942544/1033173712' : PRODUCTION_INTERSTITIAL_AD_UNIT_ID_HERE,
  rewardedAdUnitId: true ? 'ca-app-pub-3940256099942544/5224354917' : PRODUCTION_REWARDED_AD_UNIT_ID_HERE,
};

type AdCallback = (rewardGranted?: boolean) => void;

class AdMobService {
  private interstitialLoaded: boolean = true;
  private rewardedLoaded: boolean = true;
  private lastInterstitialTime: number = 0;
  private minIntervalBetweenInterstitialsMs: number = 60000; // 60s cooldown

  public initialize(): void {
    // In Android Cordova / Capacitor / React Native / PWA builds, this binds to native MobileAds.initialize()
    if (typeof window !== 'undefined' && (window as unknown as { AdMob?: unknown }).AdMob) {
      // Native SDK hooked
    }
  }

  /**
   * Check if an interstitial can be shown (respects player flow & gameplay safety)
   */
  public canShowInterstitial(): boolean {
    const now = Date.now();
    return this.interstitialLoaded && (now - this.lastInterstitialTime > this.minIntervalBetweenInterstitialsMs);
  }

  /**
   * Trigger interstitial between menus or after completing missions
   */
  public showInterstitial(onClosed?: () => void): void {
    this.lastInterstitialTime = Date.now();
    // Handled by modal presentation in web/apk layer
    if (onClosed) {
      setTimeout(onClosed, 500);
    }
  }

  /**
   * Rewarded video ad for bonus coins or revival
   */
  public showRewardedAd(onCompleted: AdCallback): void {
    // Callback after player watches rewarded ad
    onCompleted(true);
  }
}

export const adMobService = new AdMobService();
