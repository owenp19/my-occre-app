import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';

@Injectable({ providedIn: 'root' })
export class AppointmentShareService {

  async shareAppointment(code: string, date: string, time: string, office: string): Promise<void> {
    const message = `🏝️ Cita OCCRE agendada\n\n📅 Fecha: ${date}\n⏰ Hora: ${time}\n📍 Sede: ${office}\n🔑 Código: ${code}\n\nPresenta este código el día de tu cita.`;

    try {
      await Share.share({
        title: 'Mi cita OCCRE',
        text: message,
        dialogTitle: 'Compartir cita',
      });
    } catch {
      try {
        await navigator.clipboard.writeText(message);
        console.log('Copied to clipboard as fallback');
      } catch {
        console.warn('Share not available');
      }
    }
  }
}
