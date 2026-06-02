import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface NotificationItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
  type: 'success' | 'info' | 'alert';
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  private getHeaders() {
    return { Authorization: `Bearer ${this.auth.getToken()}` };
  }

  getAll() {
    return this.http.get<{ notifications: NotificationItem[] }>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  getUnreadCount() {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`, {
      headers: this.getHeaders(),
    });
  }

  markAsRead(id: string) {
    return this.http.patch<{ message: string }>(
      `${this.apiUrl}/${id}/read`,
      {},
      { headers: this.getHeaders() },
    );
  }

  markAllAsRead() {
    return this.http.patch<{ message: string }>(
      `${this.apiUrl}/read-all`,
      {},
      { headers: this.getHeaders() },
    );
  }

  clearAll() {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/clear-all`,
      { headers: this.getHeaders() },
    );
  }

  seed() {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/seed`,
      {},
      { headers: this.getHeaders() },
    );
  }
}
