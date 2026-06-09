import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  chevronForwardOutline,
  airplaneOutline,
  calendarOutline,
  homeOutline,
  cardOutline,
  documentTextOutline,
  shieldCheckmarkOutline,
  headsetOutline,
  personOutline,
  mailOutline,
  callOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  globeOutline,
  languageOutline,
} from 'ionicons/icons';
import { TourismCardService } from '../../../core/services/tourism-card.service';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-tarjeta-turismo',
  templateUrl: './tarjeta-turismo.page.html',
  styleUrls: ['./tarjeta-turismo.page.scss'],
  standalone: false,
})
export class TarjetaTurismoPage {
  step = 1;
  maxSteps = 5;
  showLangMenu = false;

  documentTypes = [
    { value: 'CC', label: 'CC' },
    { value: 'CI', label: 'CI' },
    { value: 'CE', label: 'CE' },
    { value: 'PA', label: 'PA' },
  ];

  transportTypes = [
    { value: 'Aéreo', label: 'Aéreo' },
    { value: 'Marítimo', label: 'Marítimo' },
  ];

  travelReasons = [
    { value: 'Turismo', label: 'Turismo' },
    { value: 'Visita familiar', label: 'Visita familiar' },
    { value: 'Comisión', label: 'Comisión' },
    { value: 'Otro', label: 'Otro' },
  ];

  lodgingTypes = [
    { value: 'Hotel', label: 'Hotel' },
    { value: 'Apartamento turístico', label: 'Apartamento turístico' },
    { value: 'Posada Nativa', label: 'Posada Nativa' },
    { value: 'Casa familiar', label: 'Casa familiar' },
    { value: 'Otro', label: 'Otro' },
  ];

  form: {
    first_name: string;
    last_name: string;
    document_type: string;
    document_number: string;
    birth_date: string;
    nationality: string;
    country_residence: string;
    city_residence: string;
    email: string;
    phone: string;
    emergency_contact_name: string;
    entry_date: string;
    return_date: string;
    transport_type: string;
    airline_or_company: string;
    flight_number: string;
    origin_city: string;
    travel_reason: string;
    lodging_type: string;
    lodging_name: string;
    lodging_address: string;
    lodging_sector: string;
    lodging_phone: string;
    lodging_responsible_name: string;
  } = {
    first_name: '',
    last_name: '',
    document_type: '',
    document_number: '',
    birth_date: '',
    nationality: '',
    country_residence: '',
    city_residence: '',
    email: '',
    phone: '',
    emergency_contact_name: '',
    entry_date: '',
    return_date: '',
    transport_type: '',
    airline_or_company: '',
    flight_number: '',
    origin_city: '',
    travel_reason: '',
    lodging_type: '',
    lodging_name: '',
    lodging_address: '',
    lodging_sector: '',
    lodging_phone: '',
    lodging_responsible_name: '',
  };

  accepted_terms = false;
  accepted_location_consent = false;
  isSubmitting = false;
  errorMessage = '';
  createdCode = '';

  constructor(
    private readonly navCtrl: NavController,
    private readonly tourismCardService: TourismCardService,
    public readonly translation: TranslationService,
  ) {
    addIcons({
      arrowBackOutline,
      chevronForwardOutline,
      airplaneOutline,
      calendarOutline,
      homeOutline,
      cardOutline,
      documentTextOutline,
      shieldCheckmarkOutline,
      headsetOutline,
      personOutline,
      mailOutline,
      callOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      globeOutline,
      languageOutline,
    });
  }

  get today(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  nextStep(): void {
    if (!this.isStepValid(this.step)) return;
    this.errorMessage = '';
    if (this.step < this.maxSteps) {
      this.step++;
    }
  }

  prevStep(): void {
    this.errorMessage = '';
    if (this.step > 1) {
      this.step--;
    }
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return (
          this.form.first_name.trim().length > 0 &&
          this.form.last_name.trim().length > 0 &&
          this.form.document_type.length > 0 &&
          this.form.document_number.trim().length > 0 &&
          this.form.birth_date.length > 0 &&
          this.form.nationality.trim().length > 0 &&
          this.form.country_residence.trim().length > 0 &&
          this.form.city_residence.trim().length > 0 &&
          this.form.email.trim().length > 0 &&
          this.form.phone.trim().length > 0
        );
      case 2:
        return (
          this.form.entry_date.length > 0 &&
          this.form.return_date.length > 0 &&
          this.form.transport_type.length > 0 &&
          this.form.airline_or_company.trim().length > 0 &&
          this.form.flight_number.trim().length > 0 &&
          this.form.origin_city.trim().length > 0 &&
          this.form.travel_reason.length > 0
        );
      case 3:
        return (
          this.form.lodging_type.length > 0 &&
          this.form.lodging_name.trim().length > 0 &&
          this.form.lodging_address.trim().length > 0 &&
          this.form.lodging_sector.trim().length > 0
        );
      case 4:
        return this.accepted_terms && this.accepted_location_consent;
      default:
        return true;
    }
  }

  goBack(): void {
    this.navCtrl.navigateBack('/login');
  }

  async submitForm(): Promise<void> {
    if (!this.isStepValid(4) || this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      const payload = {
        ...this.form,
        accepted_terms: this.accepted_terms,
        accepted_location_consent: this.accepted_location_consent,
      };

      const response = await this.tourismCardService.createCard(payload);

      if (response.success && response.data) {
        this.createdCode = response.data.code;
        this.step = 5;
      }
    } catch (error: any) {
      this.errorMessage = error.error?.error || 'Error al crear la tarjeta de turismo';
    } finally {
      this.isSubmitting = false;
    }
  }

  goToPayment(): void {
    if (this.createdCode) {
      this.navCtrl.navigateForward(['/tarjeta-turismo/pago', this.createdCode]);
    }
  }

  onInput(event: Event, field: keyof typeof this.form): void {
    const value = (event as CustomEvent<{ value: string | null }>).detail?.value ?? '';
    this.form[field] = value;
  }

  onSelect(event: Event, field: keyof typeof this.form): void {
    const value = (event as CustomEvent<{ value: string | null }>).detail?.value ?? '';
    this.form[field] = value;
  }

  langLabel(l: string): string {
    const labels: Record<string, string> = {
      es: 'Español',
      en: 'English',
      fr: 'Français',
      pt: 'Português',
      it: 'Italiano',
      zh: '中文',
    };
    return labels[l] ?? l;
  }
}
