import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  headsetOutline,
  arrowForwardOutline,
  shieldCheckmarkOutline,
  cardOutline,
  businessOutline,
  phonePortraitOutline,
  globeOutline,
  languageOutline,
  lockClosedOutline,
} from 'ionicons/icons';
import { TourismCardService, ReceiptResponse } from '../../../core/services/tourism-card.service';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-pago-turismo',
  templateUrl: './pago-turismo.page.html',
  styleUrls: ['./pago-turismo.page.scss'],
  standalone: false,
})
export class PagoTurismoPage implements OnInit, OnDestroy {
  public code = '';
  public status = '';
  public amount = 0;
  public currency = '';
  public loaded = false;
  public isPaying = false;
  public paymentUrl = '';
  public error = '';
  public firstName = '';
  public lastName = '';
  public documentType = '';
  public documentNumber = '';
  public entryDate = '';
  public returnDate = '';
  public selectedMethod = '';
  public showLangMenu = false;
  private receipt: ReceiptResponse | null = null;

  constructor(
    private readonly navCtrl: NavController,
    private readonly alertCtrl: AlertController,
    private readonly route: ActivatedRoute,
    private readonly tourismCardService: TourismCardService,
    public readonly translation: TranslationService,
  ) {
    addIcons({
      arrowBackOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      headsetOutline,
      arrowForwardOutline,
      shieldCheckmarkOutline,
      cardOutline,
      businessOutline,
      phonePortraitOutline,
      globeOutline,
      lockClosedOutline,
      languageOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.code = this.route.snapshot.paramMap.get('code') || '';
    if (!this.code) {
      this.error = 'Código no especificado';
      this.loaded = true;
      return;
    }
    await this.loadPaymentData();
  }

  ngOnDestroy(): void {
    Browser.removeAllListeners();
  }

  private async loadPaymentData(): Promise<void> {
    this.loaded = false;
    this.error = '';
    try {
      this.receipt = await this.tourismCardService.getReceipt(this.code);
      this.firstName = this.receipt.first_name;
      this.lastName = this.receipt.last_name;
      this.documentType = this.receipt.document_type;
      this.documentNumber = this.receipt.document_number;
      this.entryDate = this.receipt.entry_date;
      this.returnDate = this.receipt.return_date;
      this.amount = this.receipt.amount;
      this.currency = this.receipt.currency;
      this.status = this.receipt.payment_status;
    } catch {
      this.error = 'Error al cargar los datos de pago';
    } finally {
      this.loaded = true;
    }
  }

  async goToPayment(): Promise<void> {
    this.isPaying = true;
    this.error = '';
    try {
      const result = await this.tourismCardService.initPayment(this.code);
      this.paymentUrl = result.payment_url;

      Browser.addListener('browserFinished', async () => {
        await this.consultarEstado();
      });

      await Browser.open({ url: this.paymentUrl });
    } catch {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo iniciar el pago. Intenta de nuevo.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.isPaying = false;
    }
  }

  goBack(): void {
    this.navCtrl.navigateBack('/tarjeta-turismo');
  }

  selectMethod(method: string): void {
    this.selectedMethod = method;
  }

  goToReceipt(): void {
    this.navCtrl.navigateForward(['/tarjeta-turismo/recibo', this.code]);
  }

  async consultarEstado(): Promise<void> {
    try {
      const statusData = await this.tourismCardService.checkPaymentStatus(this.code);
      this.status = statusData.payment_status;
      this.amount = statusData.amount;
      this.currency = statusData.currency;
    } catch {
      this.error = 'Error al consultar el estado del pago';
    }
  }

  get statusBadgeClass(): string {
    switch (this.status) {
      case 'paid':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'rejected':
        return 'badge-danger';
      default:
        return 'badge-default';
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
