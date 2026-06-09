import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  searchOutline,
  documentTextOutline,
  checkmarkCircleOutline,
  headsetOutline,
  languageOutline,
} from 'ionicons/icons';
import { TourismCardService } from '../../../core/services/tourism-card.service';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-consultar-tarjeta-turismo',
  templateUrl: './consultar-tarjeta-turismo.page.html',
  styleUrls: ['./consultar-tarjeta-turismo.page.scss'],
  standalone: false,
})
export class ConsultarTarjetaTurismoPage {
  public code = '';
  public documentNumber = '';
  public isSearching = false;
  public errorMessage = '';
  public result: any = null;
  public showLangMenu = false;

  constructor(
    private readonly navCtrl: NavController,
    private readonly tourismCardService: TourismCardService,
    public readonly translation: TranslationService,
  ) {
    addIcons({
      arrowBackOutline,
      searchOutline,
      documentTextOutline,
      checkmarkCircleOutline,
      headsetOutline,
      languageOutline,
    });
  }

  async search(): Promise<void> {
    if (!this.code || !this.documentNumber) return;

    this.isSearching = true;
    this.errorMessage = '';
    this.result = null;

    try {
      this.result = await this.tourismCardService.searchCard(this.code, this.documentNumber);
    } catch (error: any) {
      this.errorMessage = error.error?.error || 'Error al consultar el recibo';
    } finally {
      this.isSearching = false;
    }
  }

  goBack(): void {
    this.navCtrl.navigateBack('/login');
  }

  viewReceipt(code: string): void {
    this.navCtrl.navigateForward(['/tarjeta-turismo/recibo', code]);
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
