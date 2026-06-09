import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Appointment {
  id: number;
  procedureName?: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  notes?: string;
  citizenName?: string;
  citizenEmail?: string;
  citizenPhone?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private readonly http: HttpClient) {}

  create(procedureTypeId: number | null, scheduledDate: string, scheduledTime: string, notes?: string) {
    return this.http.post<{ message: string; id: number }>(this.apiUrl, {
      procedureTypeId, scheduledDate, scheduledTime, notes,
    });
  }

  getMyAppointments() {
    return this.http.get<{ appointments: Appointment[] }>(`${this.apiUrl}/my`);
  }

  getAllAppointments(paramsData?: { date?: string; status?: string }) {
    let params = new HttpParams();
    if (paramsData) {
      Object.entries(paramsData).forEach(([key, value]) => {
        if (value) params = params.set(key, String(value));
      });
    }
    return this.http.get<{ appointments: Appointment[] }>(`${this.apiUrl}/all`, { params });
  }

  cancel(id: number) {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
