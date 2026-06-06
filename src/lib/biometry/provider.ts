import { CapacitorHealth } from '@capgo/capacitor-health';
import { Capacitor } from '@capacitor/core';

export type BiometricType = 'HRV' | 'RHR' | 'SLEEP' | 'ACTIVE_CALORIES' | 'STEPS';

export interface NormalizedBiometric {
  type: BiometricType;
  value: number;
  unit: string;
  timestamp: Date;
  source: string;
}

export class BiometryProvider {
  private static instance: BiometryProvider;
  private isNative: boolean;

  private constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  public static getInstance(): BiometryProvider {
    if (!BiometryProvider.instance) {
      BiometryProvider.instance = new BiometryProvider();
    }
    return BiometryProvider.instance;
  }

  /**
   * Request permissions from the OS-level health store
   */
  public async requestPermissions(): Promise<boolean> {
    if (!this.isNative) return false;

    try {
      const result = await CapacitorHealth.requestPermissions({
        read: ['steps', 'calories', 'heart_rate', 'sleep', 'weight'],
        write: []
      });
      return result.read.length > 0;
    } catch (error) {
      console.error('[BiometryProvider] Permission Error:', error);
      return false;
    }
  }

  /**
   * Fetch HRV and RHR data for the last 24 hours
   */
  public async fetchBiometrics(days: number = 1): Promise<NormalizedBiometric[]> {
    if (!this.isNative) return this.getSimulatedData();

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const normalizedData: NormalizedBiometric[] = [];

    try {
      // Fetch Heart Rate (which usually includes RHR and HRV depending on plugin precision)
      // Note: @capgo/capacitor-health provides unified access
      const hrData = await CapacitorHealth.queryData({
        type: 'heart_rate',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      // Map native data to normalized format
      // This is a simplified mapping for implementation phase
      hrData.data.forEach((sample: any) => {
        normalizedData.push({
          type: 'RHR', // Logic for detecting RHR vs HRV would go here
          value: sample.value,
          unit: 'bpm',
          timestamp: new Date(sample.startDate),
          source: Capacitor.getPlatform() === 'ios' ? 'AppleHealth' : 'HealthConnect'
        });
      });

      // Fetch Activity
      const activityData = await CapacitorHealth.queryData({
        type: 'calories',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      activityData.data.forEach((sample: any) => {
        normalizedData.push({
          type: 'ACTIVE_CALORIES',
          value: sample.value,
          unit: 'kcal',
          timestamp: new Date(sample.startDate),
          source: Capacitor.getPlatform() === 'ios' ? 'AppleHealth' : 'HealthConnect'
        });
      });

      return normalizedData;
    } catch (error) {
      console.error('[BiometryProvider] Fetch Error:', error);
      return this.getSimulatedData();
    }
  }

  /**
   * Fallback for web/development mode
   */
  private getSimulatedData(): NormalizedBiometric[] {
    console.warn('[BiometryProvider] Running in simulation mode (Non-native platform)');
    return [
      {
        type: 'RHR',
        value: 58 + Math.random() * 5,
        unit: 'bpm',
        timestamp: new Date(),
        source: 'SIMULATED_BIO'
      }
    ];
  }
}
