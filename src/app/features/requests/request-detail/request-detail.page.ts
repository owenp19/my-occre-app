import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { NavController, AlertController } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  checkmarkCircleOutline,
  timeOutline,
  documentOutline,
  downloadOutline,
  shareOutline,
  alertCircleOutline,
  qrCodeOutline,
} from 'ionicons/icons';
import {
  RequestService,
  RequestItem,
  RequestDocument,
} from '../../../services/request.service';
import { DocumentService } from '../../../services/document.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-request-detail',
  templateUrl: './request-detail.page.html',
  styleUrls: ['./request-detail.page.scss'],
  standalone: false,
})
export class RequestDetailPage implements OnInit {
  public request: RequestItem | null = null;
  public isLoading = true;
  public error = '';

  public readonly statusColors: Record<string, string> = {
    pendiente: 'warning',
    en_revision: 'primary',
    devuelto: 'danger',
    aprobado: 'success',
    rechazado: 'dark',
    finalizado: 'medium',
  };

  public readonly statusLabels: Record<string, string> = {
    pendiente: 'Pendiente',
    en_revision: 'En Revisión',
    devuelto: 'Devuelto',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
    finalizado: 'Finalizado',
  };

  private trackingNumber = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly navCtrl: NavController,
    private readonly requestService: RequestService,
    private readonly documentService: DocumentService,
    private readonly alertCtrl: AlertController,
    private readonly http: HttpClient,
  ) {
    addIcons({
      arrowBackOutline,
      checkmarkCircleOutline,
      timeOutline,
      documentOutline,
      downloadOutline,
      shareOutline,
      alertCircleOutline,
      qrCodeOutline,
    });
  }

  ngOnInit(): void {
    this.trackingNumber = this.route.snapshot.paramMap.get('trackingNumber') || '';
    if (!this.trackingNumber) {
      this.error = 'Solicitud no encontrada.';
      this.isLoading = false;
      return;
    }
    void this.loadRequest();
  }

  private async loadRequest(): Promise<void> {
    this.isLoading = true;
    this.error = '';
    try {
      const res = await firstValueFrom(
        this.requestService.getByTrackingNumber(this.trackingNumber)
      );
      this.request = res.request;
    } catch {
      this.error = 'Error al cargar la información de la solicitud.';
    } finally {
      this.isLoading = false;
    }
  }

  getStatusColor(status: string): string {
    return this.statusColors[status] || 'medium';
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] || status;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  async shareRequest(): Promise<void> {
    if (!this.request) return;
    const url = `${environment.apiUrl}/requests/track/${this.request.trackingNumber}`;
    try {
      await Share.share({
        title: 'Solicitud OCCRE',
        text: `Seguimiento de solicitud: ${this.request.trackingNumber}\nEstado: ${this.getStatusLabel(this.request.status)}\n\nVer en: ${url}`,
        dialogTitle: 'Compartir solicitud',
      });
    } catch {
      console.warn('[Share] Compartir cancelado');
    }
  }

  async downloadCertificate(): Promise<void> {
    if (!this.request) return;
    try {
      const blob = await firstValueFrom(
        this.http.get(`${environment.apiUrl}/certificates/generate/${this.request.trackingNumber}`, {
          responseType: 'blob',
        })
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `constancia_${this.request.trackingNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo generar la constancia.',
        buttons: ['OK'],
      });
      void alert.present();
    }
  }

  async downloadDocument(doc: RequestDocument): Promise<void> {
    try {
      const blob = await firstValueFrom(this.documentService.downloadDocument(doc.id));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo descargar el documento.',
        buttons: ['OK'],
      });
      void alert.present();
    }
  }

  goBack(): void {
    void this.navCtrl.back();
  }
}
