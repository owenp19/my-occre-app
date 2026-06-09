import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  documentTextOutline,
  chevronForwardOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { RequestService, RequestItem } from '../../../services/request.service';

@Component({
  selector: 'app-request-tracking',
  templateUrl: './request-tracking.page.html',
  styleUrls: ['./request-tracking.page.scss'],
  standalone: false,
})
export class RequestTrackingPage implements OnInit {
  public requests: RequestItem[] = [];
  public filteredRequests: RequestItem[] = [];
  public searchQuery = '';
  public isLoading = true;
  public error = '';
  public activeFilter = 'todas';

  public readonly statusColors: Record<string, string> = {
    pendiente: '#f59e0b',
    en_revision: '#3b82f6',
    devuelto: '#ef4444',
    aprobado: '#22c55e',
    rechazado: '#6b7280',
    finalizado: '#8b5cf6',
  };

  public readonly statusLabels: Record<string, string> = {
    pendiente: 'Pendiente',
    en_revision: 'En Revisión',
    devuelto: 'Devuelto',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
    finalizado: 'Finalizado',
  };

  constructor(
    private readonly navCtrl: NavController,
    private readonly requestService: RequestService,
  ) {
    addIcons({
      searchOutline,
      documentTextOutline,
      chevronForwardOutline,
      alertCircleOutline,
    });
  }

  ngOnInit(): void {
    void this.loadRequests();
  }

  get pendingCount(): number {
    return this.filteredRequests.filter(r => r.status === 'pendiente' || r.status === 'en_revision').length;
  }

  get resolvedCount(): number {
    return this.filteredRequests.filter(r => r.status === 'finalizado' || r.status === 'aprobado').length;
  }

  async loadRequests(): Promise<void> {
    this.isLoading = true;
    this.error = '';
    try {
      const res = await firstValueFrom(this.requestService.getMyRequests());
      this.requests = res.requests;
      this.applyFilter();
    } catch {
      this.error = 'Error al cargar tus solicitudes.';
    } finally {
      this.isLoading = false;
    }
  }

  onSearch(event: any): void {
    this.searchQuery = (event.detail.value || '').trim().toLowerCase();
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilter();
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    let result = [...this.requests];

    if (this.searchQuery) {
      result = result.filter(r =>
        r.trackingNumber.toLowerCase().includes(this.searchQuery)
      );
    }

    if (this.activeFilter !== 'todas') {
      result = result.filter(r => r.status === this.activeFilter);
    }

    this.filteredRequests = result;
  }

  goToDetail(trackingNumber: string): void {
    void this.navCtrl.navigateForward(`/request-tracking/${trackingNumber}`);
  }

  getStatusColor(status: string): string {
    return this.statusColors[status] || '#6b7280';
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] || status;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  async doRefresh(event: any): Promise<void> {
    await this.loadRequests();
    event.target.complete();
  }
}
