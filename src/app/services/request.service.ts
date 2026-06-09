import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface RequestItem {
  id: number;
  trackingNumber: string;
  status: string;
  priority: string;
  procedureName: string;
  procedureSlug?: string;
  citizenName?: string;
  citizenEmail?: string;
  assignedName?: string;
  notes?: string;
  internalNotes?: string;
  submittedAt: string;
  resolvedAt?: string;
  updatedAt?: string;
  history?: RequestHistory[];
  documents?: RequestDocument[];
}

export interface RequestHistory {
  id: number;
  fromStatus?: string;
  toStatus?: string;
  action: string;
  comment?: string;
  userName?: string;
  createdAt: string;
}

export interface RequestDocument {
  id: number;
  name: string;
  mimeType: string;
  size: number;
  documentType?: string;
  isValidated: boolean;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class RequestService {
  private readonly apiUrl = `${environment.apiUrl}/requests`;

  constructor(private readonly http: HttpClient) {}

  create(procedureTypeId: number, notes?: string) {
    return this.http.post<{ message: string; requestId: number; trackingNumber: string }>(
      this.apiUrl, { procedureTypeId, notes }
    );
  }

  getMyRequests(page = 1, limit = 20) {
    const params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return this.http.get<{ requests: RequestItem[]; pagination: Pagination }>(`${this.apiUrl}/my`, { params });
  }

  getByTrackingNumber(trackingNumber: string) {
    return this.http.get<{ request: RequestItem }>(`${this.apiUrl}/tracking/${trackingNumber}`);
  }

  getAllRequests(paramsData?: {
    page?: number; limit?: number; status?: string; priority?: string;
    assignedTo?: string; search?: string; dateFrom?: string; dateTo?: string;
  }) {
    let params = new HttpParams();
    if (paramsData) {
      Object.entries(paramsData).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }
    return this.http.get<{ requests: RequestItem[]; statusCounts: Record<string, number>; pagination: Pagination }>(
      `${this.apiUrl}/all`, { params }
    );
  }

  getMyAssignedRequests(page = 1, limit = 20, status?: string) {
    let params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    if (status) params = params.set('status', status);
    return this.http.get<{ requests: RequestItem[]; pagination: Pagination }>(
      `${this.apiUrl}/assigned`, { params }
    );
  }

  updateStatus(id: number, status: string, comment?: string, internalNotes?: string) {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/status`, { status, comment, internalNotes });
  }

  assignRequest(id: number, assignedTo: number | null) {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/assign`, { assignedTo });
  }
}
