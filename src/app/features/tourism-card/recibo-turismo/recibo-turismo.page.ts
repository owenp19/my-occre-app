import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { Geolocation } from '@capacitor/geolocation';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  downloadOutline,
  shareOutline,
  checkmarkCircleOutline,
  headsetOutline,
  qrCodeOutline,
  documentTextOutline,
  languageOutline,
  notificationsOutline,
  calendarOutline,
  locateOutline,
} from 'ionicons/icons';
import { TourismCardService, ReceiptResponse } from '../../../core/services/tourism-card.service';
import { LocalNotificationService } from '../../../core/services/local-notification.service';
import { CalendarReminderService } from '../../../core/services/calendar-reminder.service';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-recibo-turismo',
  templateUrl: './recibo-turismo.page.html',
  styleUrls: ['./recibo-turismo.page.scss'],
  standalone: false,
})
export class ReciboTurismoPage implements OnInit {
  public code = '';
  public receipt: ReceiptResponse | null = null;
  public loaded = false;
  public showLangMenu = false;
  public reminderDays = 1;
  public notifyEmail = true;
  public notifyPush = false;
  public reminderSet = false;
  public locationEnabled = false;
  public locationSharing = false;
  public readonly Math = Math;

  constructor(
    private readonly navCtrl: NavController,
    private readonly route: ActivatedRoute,
    private readonly tourismCardService: TourismCardService,
    private readonly alertCtrl: AlertController,
    private readonly localNotification: LocalNotificationService,
    private readonly calendarReminder: CalendarReminderService,
    public readonly translation: TranslationService,
  ) {
    addIcons({
      arrowBackOutline,
      downloadOutline,
      shareOutline,
      checkmarkCircleOutline,
      headsetOutline,
      qrCodeOutline,
      documentTextOutline,
      languageOutline,
      notificationsOutline,
      calendarOutline,
      locateOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.code = this.route.snapshot.paramMap.get('code') || '';
    if (!this.code) {
      this.loaded = true;
      return;
    }
    try {
      this.receipt = await this.tourismCardService.getReceipt(this.code);
    } catch {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo cargar el comprobante.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.loaded = true;
    }
  }

  goBack(): void {
    this.navCtrl.navigateBack('/tarjeta-turismo');
  }

  goToLogin(): void {
    this.navCtrl.navigateRoot('/login');
  }

  async shareReceipt(): Promise<void> {
    const text = this.receipt
      ? `Comprobante Tarjeta de Turismo\nCódigo: ${this.receipt.code}\nVisitante: ${this.receipt.first_name} ${this.receipt.last_name}\nMonto: ${this.receipt.amount} ${this.receipt.currency}\nEstado: ${this.receipt.payment_status}`
      : 'Comprobante Tarjeta de Turismo';
    await Share.share({ text });
  }

  async downloadPdf(): Promise<void> {
    if (this.receipt?.pdf_path) {
      window.open(this.receipt.pdf_path, '_blank');
    } else {
      const alert = await this.alertCtrl.create({
        header: 'Aviso',
        message: 'PDF no disponible',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  consultarEstado(): void {
    this.navCtrl.navigateForward('/consultar-tarjeta-turismo');
  }

  async setReminder(): Promise<void> {
    if (!this.receipt?.return_date) return;

    const returnDate = new Date(this.receipt.return_date);
    const remindAt = new Date(returnDate);
    remindAt.setDate(remindAt.getDate() - this.reminderDays);
    remindAt.setHours(9, 0, 0, 0);

    if (this.notifyPush) {
      const granted = await this.localNotification.requestPermission();
      if (granted) {
        await this.localNotification.scheduleReturnReminder({
          id: Date.now(),
          title: this.translation.translate('reminder.title'),
          body: this.translation.translate('reminder.subtitle'),
          remindAt,
        });
      }
    }

    this.reminderSet = true;
    const alert = await this.alertCtrl.create({
      header: this.translation.translate('reminder.added'),
      message: this.translation.translate('reminder.return_info').replace('{date}', returnDate.toLocaleDateString()),
      buttons: ['OK'],
    });
    await alert.present();
  }

  async addToCalendar(): Promise<void> {
    if (!this.receipt) return;

    const returnDate = new Date(this.receipt.return_date);
    await this.calendarReminder.shareReturnReminder({
      title: this.translation.translate('reminder.title'),
      description: `${this.receipt.first_name} ${this.receipt.last_name} - ${this.receipt.code}`,
      returnDate,
      location: this.receipt.lodging_name ?? '',
    });
  }

  async toggleLocation(): Promise<void> {
    if (!this.locationSharing) {
      try {
        const perm = await Geolocation.requestPermissions();
        if (perm.location === 'granted') {
          this.locationSharing = true;
          const pos = await Geolocation.getCurrentPosition();
          await this.tourismCardService.shareLocation(this.code, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy ?? undefined,
          });
        }
      } catch {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo obtener la ubicación',
          buttons: ['OK'],
        });
        await alert.present();
      }
    } else {
      this.locationSharing = false;
    }
  }

  langLabel(l: string): string {
    const labels: Record<string, string> = {
      es: 'Español',
      en: 'English',
      fr: 'Français',
      pt: 'Português',
      it: 'Italiano',
      zh: '中文',
    };
    return labels[l] ?? l;
  }
}
