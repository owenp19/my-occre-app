import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface TourismTariff {
  concept: string;
  amount: number;
  currency: string;
  active: boolean;
}

export interface TourismQuote {
  requires_payment: boolean;
  amount: number;
  currency: string;
  concept: string;
  exemption_reason: string | null;
}

export interface TourismCardData {
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  birth_date?: string;
  nationality?: string;
  country_residence?: string;
  city_residence?: string;
  email: string;
  phone: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  entry_date: string;
  return_date: string;
  transport_type?: string;
  airline_or_company?: string;
  flight_number?: string;
  origin_city?: string;
  travel_reason?: string;
  lodging_type?: string;
  lodging_name?: string;
  lodging_address?: string;
  lodging_sector?: string;
  lodging_phone?: string;
  lodging_responsible_name?: string;
  accepted_terms: boolean;
  accepted_location_consent: boolean;
}

export interface TourismCardResponse {
  success: boolean;
  data: {
    id: number;
    code: string;
    payment_status: string;
    card_status: string;
    amount: number;
    currency: string;
  };
}

export interface PaymentInitResponse {
  success: boolean;
  payment_url: string;
  reference: string;
}

export interface PaymentStatusResponse {
  code: string;
  payment_status: string;
  card_status: string;
  amount: number;
  currency: string;
}

export interface ReceiptResponse {
  code: string;
  receipt_number: string | null;
  pdf_path: string | null;
  qr_payload: string | null;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  birth_date: string | null;
  nationality: string | null;
  country_residence: string | null;
  city_residence: string | null;
  email: string;
  phone: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  entry_date: string;
  return_date: string;
  transport_type: string | null;
  airline_or_company: string | null;
  flight_number: string | null;
  origin_city: string | null;
  travel_reason: string | null;
  lodging_type: string | null;
  lodging_name: string | null;
  lodging_address: string | null;
  lodging_sector: string | null;
  lodging_phone: string | null;
  lodging_responsible_name: string | null;
  amount: number;
  currency: string;
  payment_status: string;
  card_status: string;
  created_at: string;
}

export interface VerifyResponse {
  code: string;
  status: string;
  payment_status: string;
  entry_date: string;
  return_date: string;
  document: string;
  valid: boolean;
  message: string;
}

export interface QrVerifyResponse {
  code: string;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  status: string;
  payment_status: string;
  entry_date: string;
  return_date: string;
  issued_at: string;
  expires_at: string;
  valid: boolean;
  message: string;
}

export interface SearchResponse {
  code: string;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  entry_date: string;
  return_date: string;
  lodging_name: string;
  lodging_sector: string;
  amount: number;
  currency: string;
  payment_status: string;
  card_status: string;
  qr_code: string | null;
  receipt_url: string | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class TourismCardService {
  private readonly apiUrl = `${environment.apiUrl}/tourism-card`;

  constructor(private readonly http: HttpClient) {}

  async getTariff(): Promise<TourismTariff> {
    return firstValueFrom(this.http.get<TourismTariff>(`${this.apiUrl}/tariff`));
  }

  async quote(payload: {
    birth_date: string;
    document_type: string;
    document_number: string;
    entry_date: string;
    return_date: string;
    nationality: string;
  }): Promise<TourismQuote> {
    return firstValueFrom(this.http.post<TourismQuote>(`${this.apiUrl}/quote`, payload));
  }

  async createCard(payload: TourismCardData): Promise<TourismCardResponse> {
    return firstValueFrom(this.http.post<TourismCardResponse>(`${this.apiUrl}/card`, payload));
  }

  async initPayment(code: string): Promise<PaymentInitResponse> {
    return firstValueFrom(this.http.post<PaymentInitResponse>(`${this.apiUrl}/card/${code}/payment/init`, {}));
  }

  async checkPaymentStatus(code: string): Promise<PaymentStatusResponse> {
    return firstValueFrom(this.http.get<PaymentStatusResponse>(`${this.apiUrl}/card/${code}/payment/status`));
  }

  async getReceipt(code: string): Promise<ReceiptResponse> {
    return firstValueFrom(this.http.get<ReceiptResponse>(`${this.apiUrl}/card/${code}/receipt`));
  }

  async verifyCard(code: string): Promise<VerifyResponse> {
    return firstValueFrom(this.http.get<VerifyResponse>(`${this.apiUrl}/card/${code}/verify`));
  }

  async searchCard(code: string, documentNumber: string): Promise<SearchResponse> {
    return firstValueFrom(this.http.post<SearchResponse>(`${this.apiUrl}/search`, { code, document_number: documentNumber }));
  }

  async shareLocation(code: string, location: { latitude: number; longitude: number; accuracy?: number; reason?: string }) {
    return firstValueFrom(this.http.post(`${this.apiUrl}/card/${code}/share-location`, {
      ...location,
      captured_at: new Date().toISOString(),
    }));
  }

  async verifyByQrToken(qrToken: string): Promise<QrVerifyResponse> {
    return firstValueFrom(this.http.get<QrVerifyResponse>(`${this.apiUrl}/card/verify/qr/${qrToken}`));
  }
}
