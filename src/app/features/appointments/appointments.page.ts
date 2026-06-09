import { Component, OnInit, OnDestroy } from '@angular/core';
import { firstValueFrom, Subscription } from 'rxjs';
import { NavController, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, calendarOutline, timeOutline,
  checkmarkOutline, locationOutline, informationOutline,
  cardOutline, readerOutline, personOutline, mailOutline,
  callOutline, documentTextOutline, saveOutline,
  chevronBackOutline, chevronForwardOutline, peopleOutline,
  chatbubbleEllipses, cameraOutline, imageOutline,
  documentAttachOutline, trashOutline, shareOutline,
  cloudOfflineOutline,
} from 'ionicons/icons';
import { AppointmentApiService, AppointmentServiceOption, Office, AvailableHour } from '../../core/services/appointment-api.service';
import { AppointmentDraftService } from '../../core/services/appointment-draft.service';
import { DocumentNativeService } from '../../core/services/document-native.service';
import { AppointmentNotificationService } from '../../core/services/appointment-notification.service';
import { AppointmentShareService } from '../../core/services/appointment-share.service';
import { HapticsService } from '../../core/services/haptics.service';
import { AuthService } from '../../services/auth.service';
import { NetworkService } from '../../services/network.service';

interface CalendarDay {
  day: number;
  date: Date;
  currentMonth: boolean;
  selected: boolean;
  disabled: boolean;
}

interface CitizenData {
  documentType: string;
  documentNumber: string;
  fullName: string;
  email: string;
  phone: string;
  confirmEmail: string;
}

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.page.html',
  styleUrls: ['./appointments.page.scss'],
  standalone: false,
})
export class AppointmentsPage implements OnInit, OnDestroy {

  currentStep = 1;

  steps: string[] = [
    'Servicio',
    'Fecha y hora',
    'Tus datos',
    'Confirmación',
  ];

  services: AppointmentServiceOption[] = [];
  selectedService: AppointmentServiceOption | null = null;

  offices: Office[] = [];
  selectedOffice: Office | null = null;

  availableHours: AvailableHour[] = [];
  selectedHour: AvailableHour | null = null;

  citizen: CitizenData = {
    documentType: 'Cédula de ciudadanía',
    documentNumber: '',
    fullName: '',
    email: '',
    phone: '',
    confirmEmail: '',
  };

  weekDays: string[] = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
  currentMonth: number;
  currentYear: number;
  selectedDate: Date | null = null;
  calendarDays: CalendarDay[] = [];

  loading = false;
  loadingAvailability = false;
  submitting = false;
  appointmentCode: string | null = null;
  appointmentResult: {
    code: string;
    date: string;
    time: string;
    officeName: string;
  } | null = null;
  isOnline = true;
  private networkSub?: Subscription;

  private readonly documentTypeMap: Record<string, string> = {
    CC: 'Cédula de ciudadanía',
    TI: 'Tarjeta de identidad',
    CE: 'Cédula de extranjería',
    PA: 'Pasaporte',
  };

  constructor(
    private readonly navCtrl: NavController,
    private readonly apiService: AppointmentApiService,
    private readonly draftService: AppointmentDraftService,
    readonly documentService: DocumentNativeService,
    private readonly notificationService: AppointmentNotificationService,
    private readonly shareService: AppointmentShareService,
    private readonly haptics: HapticsService,
    private readonly authService: AuthService,
    private readonly networkService: NetworkService,
    private readonly alertCtrl: AlertController,
  ) {
    const now = new Date();
    this.currentMonth = now.getMonth();
    this.currentYear = now.getFullYear();
    this.selectedDate = now;

    addIcons({
      arrowBackOutline, calendarOutline, timeOutline,
      checkmarkOutline, locationOutline, informationOutline,
      cardOutline, readerOutline, personOutline, mailOutline,
      callOutline, documentTextOutline, saveOutline,
      chevronBackOutline, chevronForwardOutline, peopleOutline,
      chatbubbleEllipses, cameraOutline, imageOutline,
      documentAttachOutline, trashOutline, shareOutline,
      cloudOfflineOutline,
    });
  }

  ngOnInit(): void {
    this.isOnline = this.networkService.isOnline();
    this.networkSub = this.networkService.isConnected$.subscribe(online => {
      this.isOnline = online;
    });
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.networkSub?.unsubscribe();
  }

  private readonly fallbackServices: AppointmentServiceOption[] = [
    { id: 1, name: 'Trámites de tarjeta OCCRE', slug: 'tarjeta-occre', description: 'Mi primera tarjeta, renovación, duplicado, correcciones, etc.', icon: 'document-text-outline', requires_documents: 1, duration_minutes: 15 },
    { id: 2, name: 'Permiso temporal de trabajador foráneo', slug: 'trabajador-foraneo', description: 'Vinculación laboral o permanencia temporal.', icon: 'people-outline', requires_documents: 1, duration_minutes: 20 },
    { id: 3, name: 'Consulta de estado de trámite', slug: 'consulta-estado', description: 'Revisa el estado de tu solicitud o radicado.', icon: 'document-text-outline', requires_documents: 0, duration_minutes: 10 },
    { id: 4, name: 'Orientación general', slug: 'orientacion-general', description: 'Información sobre trámites y requisitos.', icon: 'chatbubble-ellipses', requires_documents: 0, duration_minutes: 15 },
  ];

  private readonly fallbackOffices: Office[] = [
    { id: 1, name: 'Oficina OCCRE - San Andrés', address: 'Av. Francisco Newball, Edificio OCCRE', phone: '+57 318 123 4567' },
    { id: 2, name: 'Punto de atención - Providencia', address: 'Calle Principal, Providencia', phone: '+57 318 987 6543' },
  ];

  private async loadInitialData(): Promise<void> {
    this.loading = true;
    try {
      const [svcRes, offRes] = await Promise.all([
        firstValueFrom(this.apiService.getServices()),
        firstValueFrom(this.apiService.getOffices()),
      ]);
      this.services = svcRes.services;
      this.offices = offRes.offices;
    } catch {
      this.services = [...this.fallbackServices];
      this.offices = [...this.fallbackOffices];
    }
    if (this.services.length > 0) this.selectedService = this.services[0];
    if (this.offices.length > 0) this.selectedOffice = this.offices[0];
    this.loadUserData();
    this.generateCalendar();
    await this.checkDraft();
    this.loading = false;
  }

  private loadUserData(): void {
    const user = this.authService.getUser();
    if (!user) return;
    const mappedType = this.documentTypeMap[user.documentType ?? ''];
    if (mappedType) this.citizen.documentType = mappedType;
    this.citizen.documentNumber = user.documentNumber ?? '';
    this.citizen.fullName = `${user.firstName} ${user.lastName}`.trim();
    this.citizen.email = user.email;
    this.citizen.phone = user.phone ?? '';
    this.citizen.confirmEmail = user.email;
  }

  private async checkDraft(): Promise<void> {
    const draft = await this.draftService.getDraft();
    if (!draft) return;
    const alert = await this.alertCtrl.create({
      header: 'Borrador encontrado',
      message: 'Tienes un borrador de cita sin finalizar. ¿Deseas continuar?',
      buttons: [
        { text: 'Descartar', role: 'destructive', handler: () => this.draftService.clearDraft() },
        { text: 'Continuar', handler: () => this.restoreDraft(draft) },
      ],
    });
    await alert.present();
  }

  private restoreDraft(draft: NonNullable<Awaited<ReturnType<typeof this.draftService.getDraft>>>): void {
    this.selectedService = this.services.find(s => s.id === draft.serviceId) ?? this.selectedService;
    this.selectedOffice = this.offices.find(o => o.id === draft.officeId) ?? this.selectedOffice;
    if (draft.date) {
      const d = new Date(draft.date);
      this.selectedDate = d;
      this.currentMonth = d.getMonth();
      this.currentYear = d.getFullYear();
      this.generateCalendar();
    }
    if (draft.time) this.selectedHour = this.availableHours.find(h => h.time === draft.time) ?? null;
    if (draft.citizen) this.citizen = { ...this.citizen, ...draft.citizen };
    if (draft.documents?.length) this.documentService.selectedDocuments = draft.documents;
    this.currentStep = draft.lastStep || 1;
    this.updateAvailabilityForDraft(draft);
  }

  private async updateAvailabilityForDraft(draft: NonNullable<Awaited<ReturnType<typeof this.draftService.getDraft>>>): Promise<void> {
    if (!this.selectedOffice || !this.selectedDate) return;
    const dateStr = this.formatDateISO(this.selectedDate);
    try {
      const res = await firstValueFrom(
        this.apiService.getAvailability(this.selectedOffice.id, dateStr, this.selectedService?.id)
      );
      this.availableHours = res.available_hours;
      if (draft.time) {
        this.selectedHour = this.availableHours.find(h => h.time === draft.time) ?? null;
      }
    } catch { /* fail silently */ }
  }

  get monthName(): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return months[this.currentMonth];
  }

  get selectedDateLabel(): string {
    return this.selectedDate ? this.formatDate(this.selectedDate) : '';
  }

  selectService(service: AppointmentServiceOption): void {
    this.selectedService = service;
    this.currentStep = 2;
    void this.haptics.lightImpact();
  }

  selectDate(day: CalendarDay): void {
    if (day.disabled) return;
    this.selectedDate = day.date;
    void this.haptics.lightImpact();
    this.generateCalendar();
    this.fetchAvailability();
  }

  selectHour(hour: AvailableHour): void {
    this.selectedHour = hour;
    void this.haptics.lightImpact();
    this.currentStep = 3;
  }

  private readonly fallbackHours: AvailableHour[] = [
    { time: '08:00', label: '08:00 a.m.', available_count: 10 },
    { time: '08:30', label: '08:30 a.m.', available_count: 10 },
    { time: '09:00', label: '09:00 a.m.', available_count: 10 },
    { time: '09:30', label: '09:30 a.m.', available_count: 10 },
    { time: '10:00', label: '10:00 a.m.', available_count: 10 },
    { time: '10:30', label: '10:30 a.m.', available_count: 10 },
    { time: '14:00', label: '02:00 p.m.', available_count: 10 },
    { time: '14:30', label: '02:30 p.m.', available_count: 10 },
    { time: '15:00', label: '03:00 p.m.', available_count: 10 },
    { time: '15:30', label: '03:30 p.m.', available_count: 10 },
    { time: '16:00', label: '04:00 p.m.', available_count: 10 },
    { time: '16:30', label: '04:30 p.m.', available_count: 10 },
  ];

  private async fetchAvailability(): Promise<void> {
    if (!this.selectedOffice || !this.selectedDate) return;
    this.loadingAvailability = true;
    this.selectedHour = null;
    this.availableHours = [];
    const dateStr = this.formatDateISO(this.selectedDate);
    try {
      const res = await firstValueFrom(
        this.apiService.getAvailability(this.selectedOffice.id, dateStr, this.selectedService?.id)
      );
      this.availableHours = res.available_hours;
    } catch {
      this.availableHours = [...this.fallbackHours];
    }
    this.loadingAvailability = false;
  }

  selectOffice(): void {
    this.selectedHour = null;
    this.availableHours = [];
    if (this.selectedDate) this.fetchAvailability();
  }

  private goToStep(step: number): void {
    this.currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextStep(): void {
    if (this.currentStep < 4) {
      this.goToStep(this.currentStep + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }

  async saveDraft(): Promise<void> {
    if (!this.selectedService || !this.selectedOffice) return;
    void this.haptics.lightImpact();
    await this.draftService.saveDraft({
      serviceId: this.selectedService.id,
      officeId: this.selectedOffice.id,
      date: this.selectedDate?.toISOString() ?? '',
      time: this.selectedHour?.time ?? '',
      citizen: { ...this.citizen },
      documents: this.documentService.selectedDocuments,
      lastStep: this.currentStep,
    });
    const alert = await this.alertCtrl.create({
      header: 'Borrador guardado',
      message: 'Puedes continuar después desde donde lo dejaste.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async scheduleAppointment(): Promise<void> {
    if (!this.selectedService || !this.selectedOffice || !this.selectedDate || !this.selectedHour) return;
    if (!this.isOnline) {
      const alert = await this.alertCtrl.create({
        header: 'Sin conexión',
        message: 'No hay conexión a internet. Intenta de nuevo más tarde.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    if (this.citizen.email !== this.citizen.confirmEmail) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Los correos electrónicos no coinciden.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    this.submitting = true;
    try {
      const dateStr = this.formatDateISO(this.selectedDate);
      const formData = new FormData();
      formData.append('service_id', String(this.selectedService.id));
      formData.append('office_id', String(this.selectedOffice.id));
      formData.append('scheduled_date', dateStr);
      formData.append('scheduled_time', this.selectedHour.time);
      formData.append('citizen_full_name', this.citizen.fullName);
      formData.append('citizen_document_type', this.citizen.documentType);
      formData.append('citizen_document_number', this.citizen.documentNumber);
      formData.append('citizen_email', this.citizen.email);
      formData.append('citizen_phone', this.citizen.phone);

      if (this.documentService.selectedDocuments.length > 0) {
        const docFormData = this.documentService.buildFormData();
        if (docFormData) {
          for (const [key, value] of (docFormData as any).entries()) {
            formData.append(key, value);
          }
        }
      }

      const res = await firstValueFrom(this.apiService.createAppointment(formData));
      if (res.ok && res.body?.success) {
        const { data } = res.body;
        this.appointmentCode = data.code;
        this.appointmentResult = {
          code: data.code,
          date: this.selectedDateLabel,
          time: this.selectedHour.label,
          officeName: this.selectedOffice.name,
        };
        await this.draftService.clearDraft();
        this.documentService.clearDocuments();

        await this.haptics.success();
        await this.notificationService.scheduleSuccessNotification(
          this.selectedDateLabel, this.selectedHour.label, data.code
        );
        await this.notificationService.scheduleReminder24h(
          this.selectedDateLabel, this.selectedHour.label
        );
        this.goToStep(5);
      } else {
        throw new Error('Error al agendar');
      }
    } catch (err: any) {
      let message = 'No se pudo agendar la cita. Intenta de nuevo más tarde.';
      if (err.status === 409) {
        message = 'El horario seleccionado ya no está disponible. Por favor elige otro.';
        this.selectedHour = null;
        this.fetchAvailability();
      } else if (err.status === 401) {
        message = 'Tu sesión ha expirado. Inicia sesión nuevamente.';
      } else if (err.status === 422 || err.status === 400) {
        message = err.error?.details?.map((d: any) => d.message).join('. ') || 'Verifica los datos ingresados.';
      } else if (err.status === 0 || err.status === 504) {
        message = 'No hay conexión con el servidor. Revisa tu conexión e intenta de nuevo.';
      }
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message,
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.submitting = false;
    }
  }

  async shareAppointment(): Promise<void> {
    if (!this.appointmentResult) return;
    await this.shareService.shareAppointment(
      this.appointmentResult.code,
      this.appointmentResult.date,
      this.appointmentResult.time,
      this.appointmentResult.officeName,
    );
  }

  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  generateCalendar(): void {
    this.calendarDays = [];
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
    const firstWeekday = this.getMondayBasedDay(firstDayOfMonth);
    const daysInMonth = lastDayOfMonth.getDate();
    const previousMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = firstWeekday - 1; i > 0; i--) {
      const dayNumber = previousMonthLastDay - i + 1;
      const date = new Date(this.currentYear, this.currentMonth - 1, dayNumber);
      this.calendarDays.push({
        day: dayNumber, date, currentMonth: false,
        selected: this.isSameDate(date, this.selectedDate), disabled: true,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      this.calendarDays.push({
        day, date, currentMonth: true,
        selected: this.isSameDate(date, this.selectedDate),
        disabled: date < today,
      });
    }

    const remainingDays = 42 - this.calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, day);
      this.calendarDays.push({
        day, date, currentMonth: false,
        selected: this.isSameDate(date, this.selectedDate), disabled: true,
      });
    }
  }

  private getMondayBasedDay(date: Date): number {
    const day = date.getDay();
    return day === 0 ? 7 : day;
  }

  private isSameDate(dateA: Date | null, dateB: Date | null): boolean {
    if (!dateA || !dateB) return false;
    return dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate();
  }

  private formatDate(date: Date): string {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
    ];
    return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  }

  compareOffice(o1: Office, o2: Office): boolean {
    return o1?.id === o2?.id;
  }

  private formatDateISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  get requiresDocuments(): boolean {
    return this.selectedService?.requires_documents === 1;
  }

  async addDocumentCamera(): Promise<void> {
    try {
      await this.documentService.pickFromCamera();
    } catch { /* handled in service */ }
  }

  async addDocumentGallery(): Promise<void> {
    try {
      await this.documentService.pickFromGallery();
    } catch { /* handled in service */ }
  }

  async addDocumentFile(): Promise<void> {
    try {
      await this.documentService.pickFromFiles();
    } catch { /* handled in service */ }
  }

  removeDocument(index: number): void {
    this.documentService.removeDocument(index);
  }

  goBack(): void {
    void this.navCtrl.back();
  }

  newAppointment(): void {
    this.appointmentCode = null;
    this.appointmentResult = null;
    this.selectedHour = null;
    this.availableHours = [];
    this.selectedDate = new Date();
    this.documentService.clearDocuments();
    this.currentStep = 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
