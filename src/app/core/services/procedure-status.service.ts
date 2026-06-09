import { Injectable } from '@angular/core';

export interface StatusConfig {
  icon: string;
  class: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class ProcedureStatusService {
  private readonly statusMap: Record<string, StatusConfig> = {
    borrador:    { icon: 'create-outline',               class: 'status-draft',    label: 'Borrador' },
    pendiente:   { icon: 'checkmark-circle-outline',     class: 'status-submitted', label: 'Radicado' },
    en_revision: { icon: 'time-outline',                 class: 'status-review',   label: 'En revisión' },
    devuelto:    { icon: 'warning-outline',              class: 'status-observed', label: 'Observado' },
    aprobado:    { icon: 'shield-checkmark-outline',     class: 'status-approved', label: 'Aprobado' },
    rechazado:   { icon: 'close-circle-outline',         class: 'status-rejected', label: 'Rechazado' },
    finalizado:  { icon: 'checkmark-done-circle-outline',class: 'status-finished', label: 'Finalizado' },
  };

  private readonly statusOrder: string[] = [
    'borrador', 'pendiente', 'en_revision', 'devuelto', 'aprobado', 'rechazado', 'finalizado',
  ];

  getStatusConfig(status: string): StatusConfig {
    return this.statusMap[status] || { icon: 'help-circle-outline', class: 'status-unknown', label: status };
  }

  getStatusLabel(status: string): string {
    return this.statusMap[status]?.label || status;
  }

  getStatusIcon(status: string): string {
    return this.statusMap[status]?.icon || 'help-circle-outline';
  }

  getStatusClass(status: string): string {
    return this.statusMap[status]?.class || 'status-unknown';
  }

  getStatusOrder(): string[] {
    return this.statusOrder;
  }

  isTerminal(status: string): boolean {
    return status === 'aprobado' || status === 'rechazado' || status === 'finalizado';
  }

  isActive(status: string): boolean {
    return !this.isTerminal(status) && status !== 'borrador';
  }
}
