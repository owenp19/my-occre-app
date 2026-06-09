import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({ providedIn: 'root' })
export class LocalNotificationService {
  async requestPermission(): Promise<boolean> {
    try {
      const { display } = await LocalNotifications.requestPermissions();
      return display === 'granted';
    } catch {
      return false;
    }
  }

  async scheduleReturnReminder(params: {
    id: number;
    title: string;
    body: string;
    remindAt: Date;
  }): Promise<void> {
    try {
      const now = new Date();
      if (params.remindAt <= now) return;

      await LocalNotifications.schedule({
        notifications: [
          {
            title: params.title,
            body: params.body,
            id: params.id,
            schedule: { at: params.remindAt },
            sound: 'default',
            actionTypeId: '',
            extra: null,
          },
        ],
      });
    } catch (err) {
      console.error('[LocalNotification] schedule error:', err);
    }
  }

  async cancelReminder(id: number): Promise<void> {
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch (err) {
      console.error('[LocalNotification] cancel error:', err);
    }
  }

  async cancelAll(): Promise<void> {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    } catch (err) {
      console.error('[LocalNotification] cancelAll error:', err);
    }
  }
}
