import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AppointmentServiceOption {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  requires_documents: number;
  duration_minutes: number;
}

export interface Office {
  id: number;
  name: string;
  address: string;
  phone: string;
}

export interface AvailableHour {
  time: string;
  label: string;
  available_count: number;
}

export interface AvailabilityResponse {
  date: string;
  duration_minutes: number;
  available_hours: AvailableHour[];
}

export interface AppointmentResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    code: string;
    scheduled_date: string;
    scheduled_time: string;
  };
}

export interface AppointmentDetail {
  id: number;
  code: string;
  serviceName: string;
  serviceSlug: string;
  serviceIcon: string;
  officeName: string;
  officeAddress: string;
  citizenFullName: string;
  citizenDocumentType: string;
  citizenDocumentNumber: string;
  citizenEmail: string;
  citizenPhone: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  notes: string;
  documents: Array<{
    id: number;
    original_name: string;
    mime_type: string;
    file_size: number;
    document_type: string;
    created_at: string;
  }>;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  private readonly apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private readonly http: HttpClient) {}

  getServices(): Observable<{ services: AppointmentServiceOption[] }> {
    return this.http.get<{ services: AppointmentServiceOption[] }>(`${this.apiUrl}/services`);
  }

  getOffices(): Observable<{ offices: Office[] }> {
    return this.http.get<{ offices: Office[] }>(`${this.apiUrl}/offices`);
  }

  getAvailability(officeId: number, date: string, serviceId?: number): Observable<AvailabilityResponse> {
    let params = new HttpParams()
      .set('office_id', String(officeId))
      .set('date', date);
    if (serviceId) params = params.set('service_id', String(serviceId));
    return this.http.get<AvailabilityResponse>(`${this.apiUrl}/availability`, { params });
  }

  createAppointment(formData: FormData): Observable<HttpResponse<AppointmentResponse>> {
    return this.http.post<AppointmentResponse>(this.apiUrl, formData, {
      observe: 'response',
    });
  }

  getAppointmentByCode(code: string): Observable<{ appointment: AppointmentDetail }> {
    return this.http.get<{ appointment: AppointmentDetail }>(`${this.apiUrl}/${code}`);
  }
}
