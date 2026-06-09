import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ProcedureDocument {
  key: string;
  label: string;
  description: string;
  required: boolean;
  accept: string;
  acceptedText: string;
  maxSizeMb: number;
  allowCamera: boolean;
  icon: string;
}

export interface ProcedureType {
  id: number;
  name: string;
  slug: string;
  description: string;
  requirements: string[];
  baseCost: number;
  estimatedDays: number;
  isActive: boolean;

  title?: string;
  shortDescription?: string;
  importantInfo?: string;
  icon?: string;
  allowAppointment?: boolean;
  documents?: ProcedureDocument[];
}

@Injectable({ providedIn: 'root' })
export class ProcedureService {
  private readonly apiUrl = `${environment.apiUrl}/procedures`;

  constructor(private readonly http: HttpClient) {}

  getAll() {
    return this.http.get<{ procedures: ProcedureType[] }>(this.apiUrl);
  }

  getBySlug(slug: string): Observable<{ procedure: ProcedureType } | null> {
    return this.http.get<{ procedure: ProcedureType }>(`${this.apiUrl}/${slug}`).pipe(
      catchError(() => of(null)),
    );
  }

  getById(id: number) {
    return this.http.get<{ procedure: ProcedureType }>(`${this.apiUrl}/${id}`);
  }
}
