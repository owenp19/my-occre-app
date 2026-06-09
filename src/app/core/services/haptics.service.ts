import { Injectable } from '@angular/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

@Injectable({ providedIn: 'root' })
export class HapticsService {
  async lightImpact(): Promise<void> {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch { /* no-op on unsupported platforms */ }
  }

  async mediumImpact(): Promise<void> {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch { /* no-op */ }
  }

  async success(): Promise<void> {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch { /* no-op */ }
  }
}
