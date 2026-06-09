import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  searchOutline,
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
  chevronForwardOutline,
  downloadOutline,
  reloadOutline,
} from 'ionicons/icons';
import {
  ProcedureApiService,
  RecordSearchResult,
} from '../../core/services/procedure-api.service';
import { ProcedureStatusService } from '../../core/services/procedure-status.service';

@Component({
  selector: 'app-record-search',
  templateUrl: './record-search.page.html',
  styleUrls: ['./record-search.page.scss'],
  standalone: false,
})
export class RecordSearchPage {
  recordNumber = '';
  documentType = 'Cédula de ciudadanía';
  documentNumber = '';
  isSearching = false;
  hasSearched = false;
  errorMessage = '';
  result: RecordSearchResult | null = null;

  readonly documentTypes = [
    'Cédula de ciudadanía',
    'Tarjeta de identidad',
    'Cédula de extranjería',
    'Pasaporte',
    'NIT',
  ];

  constructor(
    private readonly navCtrl: NavController,
    private readonly procedureApi: ProcedureApiService,
    public readonly statusService: ProcedureStatusService,
  ) {
    addIcons({
      arrowBackOutline,
      searchOutline,
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
      chevronForwardOutline,
      downloadOutline,
      reloadOutline,
    });
  }

  goBack(): void {
    void this.navCtrl.back();
  }

  get isFormValid(): boolean {
    return this.recordNumber.trim().length > 0 && this.documentNumber.trim().length > 0;
  }

  async search(): Promise<void> {
    if (!this.isFormValid || this.isSearching) return;

    this.isSearching = true;
    this.errorMessage = '';
    this.hasSearched = false;
    this.result = null;

    try {
      const res = await firstValueFrom(
        this.procedureApi.searchRecord({
          record_number: this.recordNumber.trim(),
          document_type: this.documentType,
          document_number: this.documentNumber.trim(),
        })
      );
      this.result = res.data;
    } catch (err: any) {
      if (err.status === 404) {
        this.errorMessage = 'No encontramos un trámite con esos datos. Verifica el número de radicado y documento.';
      } else if (err.status === 0) {
        this.errorMessage = 'Sin conexión a internet. Verifica tu conexión e intenta de nuevo.';
      } else {
        this.errorMessage = err.error?.error || 'No fue posible realizar la consulta. Intenta más tarde.';
      }
    } finally {
      this.isSearching = false;
      this.hasSearched = true;
    }
  }

  goToDetail(): void {
    if (!this.result) return;
    void this.navCtrl.navigateForward(`/procedure-detail/${this.result.id}`);
  }

  get timelineCompleted(): number {
    if (!this.result) return 0;
    const statusOrder = this.statusService.getStatusOrder();
    const idx = statusOrder.indexOf(this.result.status);
    return idx >= 0 ? idx + 1 : 1;
  }
}
