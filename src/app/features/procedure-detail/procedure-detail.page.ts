import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  documentTextOutline,
  timeOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  warningOutline,
  shieldCheckmarkOutline,
  closeCircleOutline,
  checkmarkDoneCircleOutline,
  calendarOutline,
  locationOutline,
  personOutline,
  informationCircleOutline,
  folderOpenOutline,
  downloadOutline,
  createOutline,
  callOutline,
  reloadOutline,
} from 'ionicons/icons';
import {
  ProcedureApiService,
  ProcedureDetailResult,
} from '../../core/services/procedure-api.service';
import { ProcedureStatusService } from '../../core/services/procedure-status.service';

@Component({
  selector: 'app-procedure-detail',
  templateUrl: './procedure-detail.page.html',
  styleUrls: ['./procedure-detail.page.scss'],
  standalone: false,
})
export class ProcedureDetailPage implements OnInit {
  procedureId = 0;
  procedure: ProcedureDetailResult | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly navCtrl: NavController,
    private readonly procedureApi: ProcedureApiService,
    public readonly statusService: ProcedureStatusService,
  ) {
    addIcons({
      arrowBackOutline,
      documentTextOutline,
      timeOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      warningOutline,
      shieldCheckmarkOutline,
      closeCircleOutline,
      checkmarkDoneCircleOutline,
      calendarOutline,
      locationOutline,
      personOutline,
      informationCircleOutline,
      folderOpenOutline,
      downloadOutline,
      createOutline,
      callOutline,
      reloadOutline,
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.errorMessage = 'Trámite no encontrado';
      this.isLoading = false;
      return;
    }
    this.procedureId = parseInt(idParam, 10);
    void this.loadDetail();
  }

  goBack(): void {
    void this.navCtrl.back();
  }

  private async loadDetail(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const res = await firstValueFrom(this.procedureApi.getProcedureDetail(this.procedureId));
      this.procedure = res.data;
    } catch (err: any) {
      if (err.status === 404) {
        this.errorMessage = 'Trámite no encontrado.';
      } else if (err.status === 403) {
        this.errorMessage = 'No tienes acceso a este trámite.';
      } else if (err.status === 0) {
        this.errorMessage = 'Sin conexión a internet.';
      } else {
        this.errorMessage = err.error?.error || 'Error al cargar el detalle del trámite.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  goToAppointment(): void {
    void this.navCtrl.navigateForward('/appointments');
  }

  downloadReceipt(): void {
    if (!this.procedure) return;
    this.procedureApi.downloadReceipt(this.procedure.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        // silently fail
      },
    });
  }

  downloadDocument(docId: number): void {
    this.procedureApi.downloadDocument(docId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        // silently fail
      },
    });
  }

  contactSupport(): void {
    void this.navCtrl.navigateForward('/help-contact');
  }
}
