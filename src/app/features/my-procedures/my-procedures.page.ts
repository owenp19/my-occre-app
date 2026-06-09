import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  searchOutline,
  documentTextOutline,
  folderOpenOutline,
  timeOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  warningOutline,
  shieldCheckmarkOutline,
  closeCircleOutline,
  checkmarkDoneCircleOutline,
  chevronForwardOutline,
  reloadOutline,
  funnelOutline,
  createOutline,
} from 'ionicons/icons';
import {
  ProcedureApiService,
  MyProcedureItem,
  MyProceduresSummary,
} from '../../core/services/procedure-api.service';
import { ProcedureStatusService } from '../../core/services/procedure-status.service';

type FilterType = 'all' | 'en_revision' | 'pendiente' | 'devuelto' | 'aprobado';

@Component({
  selector: 'app-my-procedures',
  templateUrl: './my-procedures.page.html',
  styleUrls: ['./my-procedures.page.scss'],
  standalone: false,
})
export class MyProceduresPage implements OnInit {
  procedures: MyProcedureItem[] = [];
  filteredProcedures: MyProcedureItem[] = [];
  summary: MyProceduresSummary = { total: 0, in_review: 0, approved: 0, pending: 0, observed: 0 };
  isLoading = true;
  errorMessage = '';
  activeFilter: FilterType = 'all';
  searchTerm = '';

  readonly filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'en_revision', label: 'En revisión' },
    { key: 'pendiente', label: 'Pendientes' },
    { key: 'devuelto', label: 'Observados' },
    { key: 'aprobado', label: 'Aprobados' },
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
      folderOpenOutline,
      timeOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      warningOutline,
      shieldCheckmarkOutline,
      closeCircleOutline,
      checkmarkDoneCircleOutline,
      chevronForwardOutline,
      reloadOutline,
      funnelOutline,
      createOutline,
    });
  }

  ngOnInit(): void {
    void this.loadProcedures();
  }

  goBack(): void {
    void this.navCtrl.back();
  }

  goToDetail(id: number): void {
    void this.navCtrl.navigateForward(`/procedure-detail/${id}`);
  }

  goToNewProcedure(): void {
    void this.navCtrl.navigateForward('/procedures');
  }

  async loadProcedures(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const res = await firstValueFrom(this.procedureApi.getMyProcedures());
      this.procedures = res.data;
      this.summary = res.summary;
      this.applyFilters();
    } catch (err: any) {
      if (err.status === 0) {
        this.errorMessage = 'Sin conexión a internet. Verifica tu conexión e intenta de nuevo.';
      } else {
        this.errorMessage = err.error?.error || 'No fue posible cargar tus trámites. Intenta más tarde.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  async doRefresh(event: any): Promise<void> {
    try {
      const res = await firstValueFrom(this.procedureApi.getMyProcedures());
      this.procedures = res.data;
      this.summary = res.summary;
      this.applyFilters();
    } catch {
      // silently fail on refresh
    }
    event.target.complete();
  }

  setFilter(filter: FilterType): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  onSearch(event: any): void {
    this.searchTerm = (event.detail?.value || '').trim().toLowerCase();
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.procedures;

    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(p => p.status === this.activeFilter);
    }

    if (this.searchTerm) {
      filtered = filtered.filter(p =>
        p.record_number.toLowerCase().includes(this.searchTerm) ||
        p.procedure_name.toLowerCase().includes(this.searchTerm) ||
        p.status.toLowerCase().includes(this.searchTerm)
      );
    }

    this.filteredProcedures = filtered;
  }

  getSummaryCards(): { label: string; value: number; icon: string; class: string }[] {
    return [
      { label: 'Total', value: this.summary.total, icon: 'document-text-outline', class: 'summary-total' },
      { label: 'En revisión', value: this.summary.in_review, icon: 'time-outline', class: 'summary-review' },
      { label: 'Aprobados', value: this.summary.approved, icon: 'shield-checkmark-outline', class: 'summary-approved' },
      { label: 'Pendientes', value: this.summary.pending, icon: 'alert-circle-outline', class: 'summary-pending' },
      { label: 'Observados', value: this.summary.observed, icon: 'warning-outline', class: 'summary-observed' },
    ];
  }
}
