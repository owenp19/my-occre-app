import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface RecordSearchPayload {
  record_number: string;
  document_type?: string;
  document_number: string;
}

export interface TimelineEvent {
  id?: number;
  status: string;
  description: string;
  created_at: string;
  user_name?: string;
}

export interface ProcedureDocument {
  id: number;
  name: string;
  status?: string;
  mime_type?: string;
  size?: number;
  document_type?: string;
  is_validated?: boolean;
  observation?: string | null;
  uploaded_at: string;
  can_download?: boolean;
}

export interface AppointmentInfo {
  id?: number;
  code?: string;
  date: string;
  time: string;
  status?: string;
  office: string;
}

export interface ProcedureActions {
  can_upload_corrections: boolean;
  can_schedule_appointment: boolean;
  can_download_receipt: boolean;
  can_cancel: boolean;
}

export interface RecordSearchResult {
  id: number;
  record_number: string;
  procedure_name: string;
  procedure_slug: string;
  applicant_name: string;
  document_type: string;
  document_number: string;
  status: string;
  status_label: string;
  submitted_at: string;
  updated_at: string;
  office: string;
  next_step: string;
  observations: string;
  appointment: AppointmentInfo | null;
  timeline: TimelineEvent[];
  documents: ProcedureDocument[];
}

export interface MyProcedureItem {
  id: number;
  record_number: string;
  procedure_name: string;
  procedure_slug: string;
  status: string;
  status_label: string;
  submitted_at: string;
  updated_at: string;
  office: string;
  next_step: string;
  icon: string;
}

export interface MyProceduresSummary {
  total: number;
  in_review: number;
  approved: number;
  pending: number;
  observed: number;
}

export interface ProcedureDetailResult {
  id: number;
  record_number: string;
  procedure_name: string;
  procedure_slug: string;
  procedure_description: string;
  applicant_name: string;
  document_type: string;
  document_number: string;
  email: string;
  phone: string;
  status: string;
  status_label: string;
  submitted_at: string;
  updated_at: string;
  resolved_at: string | null;
  office: string;
  assigned_to: string | null;
  observations: string;
  actions: ProcedureActions;
  timeline: TimelineEvent[];
  documents: ProcedureDocument[];
  appointments: AppointmentInfo[];
}

@Injectable({ providedIn: 'root' })
export class ProcedureApiService {
  private readonly apiUrl = `${environment.apiUrl}/requests`;

  constructor(private readonly http: HttpClient) {}

  searchRecord(payload: RecordSearchPayload) {
    return this.http.post<{ success: boolean; data: RecordSearchResult }>(
      `${this.apiUrl}/search-record`, payload
    );
  }

  getMyProcedures() {
    return this.http.get<{ success: boolean; data: MyProcedureItem[]; summary: MyProceduresSummary }>(
      `${this.apiUrl}/my-procedures`
    );
  }

  getProcedureDetail(id: number) {
    return this.http.get<{ success: boolean; data: ProcedureDetailResult }>(
      `${this.apiUrl}/my-procedures/${id}`
    );
  }

  getProcedureDocuments(id: number) {
    return this.http.get<{ documents: ProcedureDocument[] }>(
      `${this.apiUrl}/my-procedures/${id}/documents`
    );
  }

  getProcedureTimeline(id: number) {
    return this.http.get<{ timeline: TimelineEvent[] }>(
      `${this.apiUrl}/my-procedures/${id}/timeline`
    );
  }

  downloadReceipt(id: number) {
    return this.http.get(`${this.apiUrl}/${id}/receipt`, { responseType: 'blob' });
  }

  downloadDocument(documentId: number) {
    return this.http.get(`${environment.apiUrl}/documents/${documentId}/download`, { responseType: 'blob' });
  }
}
