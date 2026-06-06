import { BiometryProvider } from './provider';

export async function syncBiometrics() {
  const provider = BiometryProvider.getInstance();

  try {
    // 1. Request permissions (usually does nothing if already granted)
    const hasPermission = await provider.requestPermissions();
    if (!hasPermission) {
      console.warn('[SyncBiometrics] No permission granted for health data.');
      return;
    }

    // 2. Fetch latest data (last 24 hours)
    const data = await provider.fetchBiometrics(1);

    if (data.length === 0) {
      console.log('[SyncBiometrics] No new data to sync.');
      return;
    }

    // 3. Send to API
    const response = await fetch('/api/biometrics/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ biometrics: data }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`[SyncBiometrics] Successfully synced ${result.count} records.`);
    
    // Aggregate latest values for immediate store update
    const latestData = {
      hrv: data.find(b => b.type === 'HRV')?.value || null,
      rhr: data.find(b => b.type === 'RHR')?.value || null,
      activeCalories: data.filter(b => b.type === 'ACTIVE_CALORIES').reduce((acc, curr) => acc + b.value, 0) || null,
    };

    return { ...result, latestData };
  } catch (error) {
    console.error('[SyncBiometrics] Error:', error);
    throw error;
  }
}
