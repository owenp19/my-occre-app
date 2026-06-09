import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({ providedIn: 'root' })
export class AppointmentNotificationService {

  async scheduleSuccessNotification(appointmentDate: string, appointmentTime: string, code: string): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Cita agendada',
            body: `Tu cita para el ${appointmentDate} a las ${appointmentTime} ha sido confirmada. Código: ${code}`,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 3000) },
          },
        ],
      });
    } catch (err) {
      console.warn('Notification not available:', err);
    }
  }

  async scheduleReminder24h(appointmentDate: string, appointmentTime: string): Promise<void> {
    try {
      const [day, month, year] = appointmentDate.split('/').map(Number);
      const [hour, minute] = appointmentTime.replace(/\s*[ap]\.m\./, '').split(':').map(Number);
      const isPM = appointmentTime.includes('p.m.');
      const fireDate = new Date(year, month - 1, day, isPM && hour < 12 ? hour + 12 : hour, minute || 0);
      fireDate.setDate(fireDate.getDate() - 1);

      if (fireDate.getTime() > Date.now()) {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'Recordatorio de cita OCCRE',
              body: `Tu cita es mañana a las ${appointmentTime}. ¡No faltes!`,
              id: Date.now() + 1,
              schedule: { at: fireDate },
            },
          ],
        });
      }
    } catch (err) {
      console.warn('Reminder not available:', err);
    }
  }
}
