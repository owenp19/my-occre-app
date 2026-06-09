import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private readonly apiUrl = `${environment.apiUrl}/devices`;

  constructor(private readonly http: HttpClient) {}

  async registerPushNotifications(): Promise<void> {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('[Push] Permiso no concedido');
      return;
    }

    await PushNotifications.register();

    await PushNotifications.addListener('registration', (token) => {
      this.sendTokenToServer(token.value);
    });

    await PushNotifications.addListener('registrationError', (err) => {
      console.error('[Push] Error de registro:', err);
    });

    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] Notificación recibida:', notification);
    });

    await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('[Push] Acción ejecutada:', notification);
    });
  }

  private async sendTokenToServer(token: string): Promise<void> {
    try {
      const info = await Device.getInfo();
      const platform = info.platform === 'ios' ? 'ios' : info.platform === 'android' ? 'android' : 'web';
      await firstValueFrom(this.http.post(`${this.apiUrl}/register`, { token, platform }));
    } catch (err) {
      console.error('[Push] Error al enviar token al servidor:', err);
    }
  }

  async unregisterPushNotifications(): Promise<void> {
    try {
      const token = (await PushNotifications.getDeliveredNotifications()).notifications;
      await firstValueFrom(this.http.post(`${this.apiUrl}/unregister`, { token }));
    } catch (err) {
      console.error('[Push] Error al desregistrar:', err);
    }
  }
}
