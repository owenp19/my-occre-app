import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  documentType?: string;
  documentNumber?: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

interface ProfileResponse {
  message?: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'occre_token';
  private readonly USER_KEY = 'occre_user';

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getInitials(): string {
    const user = this.getUser();
    if (!user) return 'US';
    const first = user.firstName.trim().charAt(0) || '';
    const last = user.lastName.trim().charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password });
  }

  register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    documentType?: string;
    documentNumber?: string;
    phone?: string;
  }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  saveSession(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getProfile() {
    const token = this.getToken();
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  updateProfile(data: {
    firstName: string;
    lastName: string;
    documentType?: string;
    documentNumber?: string;
    phone?: string;
  }) {
    const token = this.getToken();
    return this.http.put<ProfileResponse>(`${this.apiUrl}/profile`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    void this.router.navigate(['/login']);
  }
}
