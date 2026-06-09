import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NavController, ActionSheetController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  notificationsOutline,
  locationOutline,
  checkmarkCircleOutline,
  informationCircleOutline,
  informationOutline,
  clipboardOutline,
  folderOpenOutline,
  documentTextOutline,
  cameraOutline,
  cloudUploadOutline,
  trashOutline,
  calendarOutline,
  personOutline,
  alertCircleOutline,
  timeOutline,
  saveOutline,
  idCardOutline,
  cardOutline,
  briefcaseOutline,
  copyOutline,
  storefrontOutline,
  peopleCircleOutline,
  airplaneOutline,
  imageOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth.service';
import { ProcedureService, ProcedureType, ProcedureDocument } from '../../../services/procedure.service';
import { environment } from '../../../../environments/environment';

interface UploadedDoc {
  name: string;
  file: File;
}

interface AppointmentData {
  office: string;
  date: string;
  hour: string;
}

interface CitizenData {
  documentType: string;
  documentNumber: string;
  fullName: string;
  email: string;
  phone: string;
}

const LOCAL_FALLBACK: ProcedureType[] = [
  {
    id: 1,
    name: 'Mi Primera Tarjeta OCCRE',
    slug: 'mi-primera-tarjeta-occre',
    title: 'Mi Primera Tarjeta OCCRE',
    shortDescription: 'Solicitud inicial de tarjeta de residencia para residentes del Archipiélago.',
    description: 'Este trámite está dirigido a personas naturales que solicitan por primera vez la Tarjeta OCCRE. Debes cumplir con los requisitos establecidos por la Corporación y presentar la documentación completa para iniciar el proceso de residencia.',
    importantInfo: 'Todos los documentos deben estar legibles y en formato PDF, JPG o PNG. El tamaño máximo por archivo es de 5 MB.',
    icon: 'id-card-outline',
    allowAppointment: true,
    baseCost: 0,
    estimatedDays: 15,
    isActive: true,
    requirements: [
      'Ser residente del Archipiélago de San Andrés, Providencia y Santa Catalina.',
      'Presentar la documentación requerida en original y copia.',
      'Realizar el pago de los derechos de trámite.',
    ],
    documents: [
      { key: 'carta_solicitud', label: 'Carta de solicitud', description: 'Carta dirigida a la OCCRE solicitando la expedición de la tarjeta.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'document-text-outline' },
      { key: 'foto_3x4', label: 'Foto 3x4', description: 'Fotografía reciente, fondo blanco, sin gafas oscuras.', required: true, accept: '.jpg,.jpeg,.png', acceptedText: 'JPG, PNG', maxSizeMb: 3, allowCamera: true, icon: 'camera-outline' },
      { key: 'registro_civil', label: 'Registro civil', description: 'Copia del registro civil de nacimiento.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'document-text-outline' },
      { key: 'documento_adicional', label: 'Documento adicional', description: 'Otro soporte que respalde la solicitud (opcional).', required: false, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'document-text-outline' },
    ],
  },
  {
    id: 2,
    name: 'Cambio de Tarjeta de Identidad a Cédula',
    slug: 'cambio-tarjeta-identidad-cedula',
    title: 'Cambio de Tarjeta de Identidad a Cédula',
    shortDescription: 'Actualización del documento de identidad asociado a la Tarjeta OCCRE.',
    description: 'Trámite para actualizar los datos registrados en la OCCRE cuando el titular cambia su documento de identidad de tarjeta de identidad a cédula de ciudadanía.',
    importantInfo: 'Debes presentar la cédula original y la tarjeta de identidad anterior. Los documentos deben estar en buen estado.',
    icon: 'card-outline',
    allowAppointment: true,
    baseCost: 0,
    estimatedDays: 10,
    isActive: true,
    requirements: [
      'Ser titular de una Tarjeta OCCRE vigente.',
      'Presentar la cédula de ciudadanía original.',
      'Presentar la tarjeta de identidad anterior.',
    ],
    documents: [
      { key: 'carta_solicitud', label: 'Carta de solicitud', description: 'Carta dirigida a la OCCRE solicitando el cambio.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'document-text-outline' },
      { key: 'copia_cedula', label: 'Copia de cédula', description: 'Copia legible de la cédula de ciudadanía.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'card-outline' },
      { key: 'registro_civil', label: 'Registro civil', description: 'Copia del registro civil de nacimiento.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'document-text-outline' },
      { key: 'tarjeta_anterior', label: 'Tarjeta OCCRE anterior', description: 'Copia de la tarjeta OCCRE anterior (opcional).', required: false, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'copy-outline' },
    ],
  },
  {
    id: 3,
    name: 'Requisitos para Inversionistas',
    slug: 'requisitos-inversionistas',
    title: 'Requisitos para Inversionistas',
    shortDescription: 'Información documental para personas o empresas que desean invertir en el Archipiélago.',
    description: 'Trámite dirigido a inversionistas nacionales o extranjeros que desean establecer operaciones en San Andrés, Providencia y Santa Catalina, y requieren la Tarjeta OCCRE.',
    importantInfo: 'Los soportes de inversión deben estar certificados por contador público o entidad competente.',
    icon: 'briefcase-outline',
    allowAppointment: true,
    baseCost: 0,
    estimatedDays: 20,
    isActive: true,
    requirements: [
      'Acreditar la calidad de inversionista.',
      'Presentar documentos de constitución de la empresa si aplica.',
      'Demostrar la inversión mínima requerida.',
    ],
    documents: [
      { key: 'carta_solicitud', label: 'Carta de solicitud', description: 'Carta dirigida a la OCCRE.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'document-text-outline' },
      { key: 'documento_identidad', label: 'Documento de identidad', description: 'Copia del documento de identidad del inversionista.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'card-outline' },
      { key: 'camara_comercio', label: 'Certificado de Cámara de Comercio', description: 'Certificado de existencia y representación legal.', required: true, accept: '.pdf', acceptedText: 'PDF', maxSizeMb: 5, allowCamera: false, icon: 'document-text-outline' },
      { key: 'soporte_inversion', label: 'Soporte de inversión', description: 'Documento que acredite la inversión realizada.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'briefcase-outline' },
    ],
  },
  {
    id: 4,
    name: 'Duplicado Tarjeta OCCRE',
    slug: 'duplicado-tarjeta-occre',
    title: 'Duplicado Tarjeta OCCRE',
    shortDescription: 'Solicitud de duplicado de la Tarjeta OCCRE por pérdida, deterioro u otras causales.',
    description: 'Trámite para obtener un duplicado de la Tarjeta OCCRE en caso de pérdida, hurto, deterioro o destrucción del documento original.',
    importantInfo: 'Si el extravío fue por hurto, adjunta la denuncia formal ante la Policía.',
    icon: 'copy-outline',
    allowAppointment: true,
    baseCost: 0,
    estimatedDays: 12,
    isActive: true,
    requirements: [
      'Ser titular de una Tarjeta OCCRE vigente.',
      'Declarar el motivo de la solicitud de duplicado.',
      'Presentar documento de identidad original.',
    ],
    documents: [
      { key: 'carta_solicitud', label: 'Carta de solicitud', description: 'Carta dirigida a la OCCRE solicitando el duplicado.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'document-text-outline' },
      { key: 'documento_identidad', label: 'Documento de identidad', description: 'Copia del documento de identidad.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'card-outline' },
      { key: 'foto_3x4', label: 'Foto 3x4', description: 'Fotografía reciente, fondo blanco.', required: true, accept: '.jpg,.jpeg,.png', acceptedText: 'JPG, PNG', maxSizeMb: 3, allowCamera: true, icon: 'camera-outline' },
      { key: 'soporte_perdida', label: 'Soporte de pérdida', description: 'Denuncia o declaración de pérdida (opcional).', required: false, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'alert-circle-outline' },
    ],
  },
  {
    id: 5,
    name: 'Independiente Primera Vez',
    slug: 'independiente-primera-vez',
    title: 'Independiente Primera Vez',
    shortDescription: 'Checklist para solicitantes independientes que realizan el trámite inicial.',
    description: 'Trámite dirigido a trabajadores independientes que solicitan por primera vez la Tarjeta OCCRE y deben acreditar su actividad económica.',
    importantInfo: 'Los soportes de actividad económica deben estar vigentes y contener información clara del solicitante.',
    icon: 'storefront-outline',
    allowAppointment: true,
    baseCost: 0,
    estimatedDays: 15,
    isActive: true,
    requirements: [
      'Ser residente del Archipiélago.',
      'Acreditar actividad económica independiente.',
      'Presentar documento de identidad.',
    ],
    documents: [
      { key: 'carta_solicitud', label: 'Carta de solicitud', description: 'Carta dirigida a la OCCRE.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'document-text-outline' },
      { key: 'documento_identidad', label: 'Documento de identidad', description: 'Copia del documento de identidad.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'card-outline' },
      { key: 'soporte_actividad', label: 'Soporte de actividad económica', description: 'Registro mercantil, RUT o certificación de ingresos.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'briefcase-outline' },
      { key: 'soporte_residencia', label: 'Soporte de residencia', description: 'Recibo de servicios público o certificación (opcional).', required: false, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'location-outline' },
    ],
  },
  {
    id: 6,
    name: 'Residencia por Convivencia',
    slug: 'residencia-convivencia',
    title: 'Residencia por Convivencia',
    shortDescription: 'Trámite para obtener la Tarjeta OCCRE por vínculo de convivencia.',
    description: 'Trámite para beneficiarios y otorgantes que acreditan un vínculo de convivencia y desean obtener o actualizar la Tarjeta OCCRE.',
    importantInfo: 'Se debe demostrar la convivencia mínima requerida según la normativa vigente.',
    icon: 'people-circle-outline',
    allowAppointment: true,
    baseCost: 0,
    estimatedDays: 18,
    isActive: true,
    requirements: [
      'Acreditar el vínculo de convivencia.',
      'Presentar documentos del solicitante y del vinculado.',
      'Cumplir con los tiempos de convivencia exigidos.',
    ],
    documents: [
      { key: 'carta_solicitud', label: 'Carta de solicitud', description: 'Carta dirigida a la OCCRE.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'document-text-outline' },
      { key: 'documento_solicitante', label: 'Documento del solicitante', description: 'Copia del documento del solicitante.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'card-outline' },
      { key: 'documento_vinculado', label: 'Documento de la persona vinculada', description: 'Copia del documento de la persona con quien se acredita la convivencia.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'people-circle-outline' },
      { key: 'soporte_convivencia', label: 'Soporte de convivencia', description: 'Declaración extrajuicio, factura compartida o contrato de arrendamiento.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'document-text-outline' },
    ],
  },
  {
    id: 7,
    name: 'Pasajero en Comisión',
    slug: 'pasajero-comision',
    title: 'Pasajero en Comisión',
    shortDescription: 'Orientación para comisiones temporales y entidades solicitantes.',
    description: 'Trámite para personas que requieren la Tarjeta OCCRE por comisión temporal, incluyendo a la entidad solicitante y sus familiares.',
    importantInfo: 'La carta de la entidad debe especificar el tiempo y motivo de la comisión.',
    icon: 'airplane-outline',
    allowAppointment: true,
    baseCost: 0,
    estimatedDays: 8,
    isActive: true,
    requirements: [
      'Ser comisionado por una entidad合法mente constituida.',
      'Presentar carta de la entidad comitente.',
      'Acreditar la duración de la comisión.',
    ],
    documents: [
      { key: 'carta_entidad', label: 'Carta de la entidad o empresa', description: 'Carta original dirigida a la OCCRE.', required: true, accept: '.pdf', acceptedText: 'PDF', maxSizeMb: 5, allowCamera: false, icon: 'document-text-outline' },
      { key: 'documento_identidad', label: 'Documento de identidad', description: 'Copia del documento del comisionado.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'card-outline' },
      { key: 'soporte_viaje', label: 'Soporte de viaje', description: 'Tiquete, orden de comisión o documento similar (opcional).', required: false, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'airplane-outline' },
    ],
  },
  {
    id: 8,
    name: 'Trabajador Foráneo o Trámite Especial',
    slug: 'trabajador-foraneo-tramite-especial',
    title: 'Trabajador Foráneo o Trámite Especial',
    shortDescription: 'Requisitos para trabajadores foráneos, empresas contratantes y su núcleo familiar.',
    description: 'Trámite para trabajadores que provienen de fuera del Archipiélago y requieren la Tarjeta OCCRE, incluyendo a la empresa contratante y el núcleo familiar.',
    importantInfo: 'El contrato laboral debe estar vigente y autenticado. Incluye los documentos del contratante.',
    icon: 'briefcase-outline',
    allowAppointment: true,
    baseCost: 0,
    estimatedDays: 18,
    isActive: true,
    requirements: [
      'Ser trabajador foráneo con contrato vigente.',
      'Presentar documentos del trabajador y del contratante.',
      'Acreditar la relación laboral.',
    ],
    documents: [
      { key: 'carta_solicitud', label: 'Carta de solicitud', description: 'Carta dirigida a la OCCRE.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'document-text-outline' },
      { key: 'documento_trabajador', label: 'Documento del trabajador', description: 'Copia del documento del trabajador.', required: true, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'card-outline' },
      { key: 'contrato_laboral', label: 'Contrato o certificación laboral', description: 'Contrato laboral vigente o certificación de la empresa.', required: true, accept: '.pdf', acceptedText: 'PDF', maxSizeMb: 5, allowCamera: false, icon: 'document-text-outline' },
      { key: 'documentos_contratante', label: 'Documentos del contratante', description: 'Documentos de la empresa o persona contratante (opcional).', required: false, accept: '.pdf,.jpg,.jpeg,.png', acceptedText: 'PDF, JPG, PNG', maxSizeMb: 5, allowCamera: true, icon: 'briefcase-outline' },
    ],
  },
];

@Component({
  selector: 'app-procedure-detail',
  templateUrl: './procedure-detail.page.html',
  styleUrls: ['./procedure-detail.page.scss'],
  standalone: false,
})
export class ProcedureDetailPage implements OnInit {
  public selectedProcedure: ProcedureType | null = null;
  public isLoading = true;
  public error = '';

  public steps = [
    'Información y requisitos',
    'Documentos',
    'Datos del solicitante',
    'Agendar cita',
    'Confirmación',
  ];
  public currentStep = 1;
  public offices = [
    'Sede principal — San Andrés',
    'Sede Providencia',
    'Punto de atención — Aeropuerto',
  ];
  public availableHours = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  ];

  public appointment: AppointmentData = {
    office: '',
    date: '',
    hour: '',
  };

  public citizen: CitizenData = {
    documentType: '',
    documentNumber: '',
    fullName: '',
    email: '',
    phone: '',
  };

  public uploadedDocuments: Record<string, UploadedDoc> = {};

  private slug = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly navCtrl: NavController,
    private readonly procedureService: ProcedureService,
    private readonly authService: AuthService,
    private readonly actionSheetCtrl: ActionSheetController,
  ) {
    addIcons({
      arrowBackOutline,
      notificationsOutline,
      locationOutline,
      checkmarkCircleOutline,
      informationCircleOutline,
      informationOutline,
      clipboardOutline,
      folderOpenOutline,
      documentTextOutline,
      cameraOutline,
      cloudUploadOutline,
      trashOutline,
      calendarOutline,
      personOutline,
      alertCircleOutline,
      timeOutline,
      saveOutline,
      idCardOutline,
      cardOutline,
      briefcaseOutline,
      copyOutline,
      storefrontOutline,
      peopleCircleOutline,
      airplaneOutline,
      imageOutline,
    });
  }

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    if (!this.slug) {
      this.error = 'Trámite no encontrado';
      this.isLoading = false;
      return;
    }
    void this.loadProcedure();
    this.loadCitizenData();
  }

  private loadCitizenData(): void {
    const user = this.authService.getUser();
    if (!user) return;
    this.citizen.documentType = user.documentType || '';
    this.citizen.documentNumber = user.documentNumber || '';
    this.citizen.fullName = `${user.firstName} ${user.lastName}`.trim();
    this.citizen.email = user.email;
    this.citizen.phone = user.phone || '';
  }

  get allowAppointment(): boolean {
    return !!this.selectedProcedure?.allowAppointment;
  }

  get missingRequiredDocs(): string[] {
    if (!this.selectedProcedure?.documents) return [];
    return this.selectedProcedure.documents
      .filter(doc => doc.required && !this.uploadedDocuments[doc.key])
      .map(doc => doc.label);
  }

  private async loadProcedure(): Promise<void> {
    this.isLoading = true;
    this.error = '';
    if (!environment.useFallback) {
      try {
        const res = await firstValueFrom(this.procedureService.getBySlug(this.slug));
        if (res?.procedure) {
          this.selectedProcedure = res.procedure;
          this.isLoading = false;
          return;
        }
      } catch {
        // ignore unexpected errors
      }
    }
    const fallback = LOCAL_FALLBACK.find(p => p.slug === this.slug);
    if (fallback) {
      this.selectedProcedure = fallback;
    } else {
      this.error = 'Trámite no encontrado.';
    }
    this.isLoading = false;
  }

  goBack(): void {
    void this.navCtrl.back();
  }

  triggerFileInput(key: string): void {
    document.getElementById('file-' + key)?.click();
  }

  onFileSelected(event: Event, doc: ProcedureDocument): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.uploadedDocuments[doc.key] = { name: file.name, file };
    input.value = '';
  }

  async captureDocument(doc: ProcedureDocument): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await this.showCaptureOptions(doc);
    } else {
      this.webFallbackCapture(doc);
    }
  }

  private async showCaptureOptions(doc: ProcedureDocument): Promise<void> {
    const sheet = await this.actionSheetCtrl.create({
      header: 'Agregar documento',
      buttons: [
        {
          text: 'Cámara',
          icon: 'camera-outline',
          handler: () => this.captureFromCamera(doc),
        },
        {
          text: 'Galería',
          icon: 'image-outline',
          handler: () => this.captureFromGallery(doc),
        },
        { text: 'Cancelar', role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  private async captureFromCamera(doc: ProcedureDocument): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        source: CameraSource.Camera,
        quality: 70,
        resultType: CameraResultType.Uri,
      });
      await this.processCapturedImage(doc, image.path!, image.format || 'jpeg');
    } catch {
      console.warn('[Camera] Captura cancelada o no disponible');
    }
  }

  private async captureFromGallery(doc: ProcedureDocument): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        source: CameraSource.Photos,
        quality: 70,
        resultType: CameraResultType.Uri,
      });
      await this.processCapturedImage(doc, image.path!, image.format || 'jpeg');
    } catch {
      console.warn('[Gallery] Selección cancelada');
    }
  }

  private async processCapturedImage(doc: ProcedureDocument, path: string, format: string): Promise<void> {
    try {
      const response = await fetch(path);
      const blob = await response.blob();
      const ext = format === 'png' ? 'png' : 'jpg';
      const file = new File([blob], `${doc.key}_${Date.now()}.${ext}`, { type: `image/${ext}` });
      this.uploadedDocuments[doc.key] = { name: file.name, file };
    } catch {
      console.warn('[Camera] Error al procesar la imagen');
    }
  }

  private webFallbackCapture(doc: ProcedureDocument): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = doc.accept || '.jpg,.jpeg,.png';
    input.capture = 'environment';
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files?.length) {
        this.uploadedDocuments[doc.key] = { name: target.files[0].name, file: target.files[0] };
      }
    };
    input.click();
  }

  removeDocument(key: string): void {
    delete this.uploadedDocuments[key];
  }

  saveDraft(): void {
    const draft = {
      procedure: this.selectedProcedure,
      appointment: this.appointment,
      citizen: this.citizen,
      documents: Object.keys(this.uploadedDocuments),
    };
    localStorage.setItem('occre_draft', JSON.stringify(draft));
  }

  submitProcedure(): void {
    if (!this.selectedProcedure) return;

    const missing = this.missingRequiredDocs;
    if (missing.length > 0) {
      return;
    }

    this.buildFormDataAndSubmit();
  }

  private buildFormDataAndSubmit(): void {
    const fd = new FormData();
    const p = this.selectedProcedure!;
    fd.append('procedure_id', String(p.id));
    fd.append('office', this.appointment.office);
    fd.append('appointment_date', this.appointment.date);
    fd.append('appointment_time', this.appointment.hour);
    fd.append('document_type', this.citizen.documentType);
    fd.append('document_number', this.citizen.documentNumber);
    fd.append('full_name', this.citizen.fullName);
    fd.append('email', this.citizen.email);
    fd.append('phone', this.citizen.phone);

    Object.keys(this.uploadedDocuments).forEach(key => {
      const file = this.uploadedDocuments[key]?.file;
      if (file) {
        fd.append(`documents[${key}]`, file);
      }
    });
  }
}
