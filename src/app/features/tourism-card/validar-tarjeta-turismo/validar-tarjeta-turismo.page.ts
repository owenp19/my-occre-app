import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  headsetOutline,
  qrCodeOutline,
  languageOutline,
} from 'ionicons/icons';
import { TourismCardService } from '../../../core/services/tourism-card.service';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-validar-tarjeta-turismo',
  templateUrl: './validar-tarjeta-turismo.page.html',
  styleUrls: ['./validar-tarjeta-turismo.page.scss'],
  standalone: false,
})
export class ValidarTarjetaTurismoPage implements OnInit {
  public code = '';
  public qrToken = '';
  public result: any = null;
  public loaded = false;
  public error = '';
  public showLangMenu = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly tourismCardService: TourismCardService,
    private readonly navCtrl: NavController,
    public readonly translation: TranslationService,
  ) {
    addIcons({
      checkmarkCircleOutline,
      closeCircleOutline,
      headsetOutline,
      qrCodeOutline,
      languageOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.code = this.route.snapshot.params['code'];
    this.qrToken = this.route.snapshot.params['qr_token'];
    if (this.qrToken) {
      await this.verifyByQrToken(this.qrToken);
    } else if (this.code) {
      await this.verifyCard(this.code);
    }
  }

  async verifyCard(code: string): Promise<void> {
    this.loaded = false;
    this.error = '';

    try {
      this.result = await this.tourismCardService.verifyCard(code);
    } catch (error: any) {
      this.error = error.error?.error || 'Error al validar la tarjeta';
    } finally {
      this.loaded = true;
    }
  }

  async verifyByQrToken(qrToken: string): Promise<void> {
    this.loaded = false;
    this.error = '';

    try {
      this.result = await this.tourismCardService.verifyByQrToken(qrToken);
    } catch (error: any) {
      this.error = error.error?.error || 'Error al validar código QR';
    } finally {
      this.loaded = true;
    }
  }

  goBack(): void {
    this.navCtrl.navigateBack('/login');
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
