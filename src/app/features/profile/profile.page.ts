import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NavController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  cardOutline,
  callOutline,
  idCardOutline,
  documentTextOutline,
  helpCircleOutline,
  logOutOutline,
  chevronForwardOutline,
  shieldCheckmarkOutline,
  arrowBackOutline,
  createOutline,
  checkmarkOutline,
  closeOutline,
  cameraOutline,
  folderOpenOutline,
  timeOutline,
  calendarOutline,
  peopleOutline,
} from 'ionicons/icons';
import { AuthService, User } from '../../services/auth.service';

interface ProfileAction {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  public profile: User = {
    id: 0, firstName: '', lastName: '', email: '',
    phone: '', documentType: '', documentNumber: '', photoUrl: '', roles: [],
  };

  public editForm: User = {
    id: 0, firstName: '', lastName: '', email: '',
    phone: '', documentType: '', documentNumber: '', photoUrl: '',
  };

  public isEditing = false;
  public isSaving = false;
  public isLoading = true;
  public isUploadingPhoto = false;
  public errorMessage = '';

  public readonly quickActions: ProfileAction[] = [
    { label: 'Mis solicitudes', icon: 'document-text-outline', route: '/request-tracking' },
    { label: 'Mis citas', icon: 'calendar-outline', route: '/appointments' },
    { label: 'Protección de datos', icon: 'shield-checkmark-outline', route: '/legal' },
    { label: 'Ayuda y contacto', icon: 'help-circle-outline', route: '/help-contact' },
  ];

  public readonly documentTypes = [
    { value: 'CC', label: 'Cédula de ciudadanía' },
    { value: 'TI', label: 'Tarjeta de identidad' },
    { value: 'CE', label: 'Cédula de extranjería' },
    { value: 'PA', label: 'Pasaporte' },
  ];

  public get userRoles(): string[] {
    return this.profile.roles || [];
  }

  public get roleLabels(): string {
    const labels: Record<string, string> = {
      funcionario: 'Funcionario',
      ciudadano: 'Ciudadano',
    };
    return this.userRoles.map(r => labels[r] || r).join(', ');
  }

  constructor(
    private readonly navCtrl: NavController,
    private readonly authService: AuthService,
  ) {
    addIcons({
      personOutline, mailOutline, cardOutline, callOutline,
      idCardOutline, documentTextOutline, helpCircleOutline,
      logOutOutline, chevronForwardOutline, shieldCheckmarkOutline,
      arrowBackOutline, createOutline, checkmarkOutline, closeOutline,
      cameraOutline, folderOpenOutline, timeOutline, calendarOutline, peopleOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadProfile();
  }

  private async loadProfile(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const res = await firstValueFrom(this.authService.getProfile());
      if (res?.user) {
        this.profile = res.user;
      }
    } catch {
      const localUser = this.authService.getUser();
      if (localUser) this.profile = localUser;
    } finally {
      this.isLoading = false;
    }
  }

  public get userInitials(): string {
    const first = this.profile.firstName?.trim().charAt(0) || '';
    const last = this.profile.lastName?.trim().charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  }

  public get hasPhoto(): boolean {
    return !!this.profile.photoUrl;
  }

  public async takePhoto(): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 1024,
      });

      if (image?.dataUrl) {
        await this.uploadPhoto(image.dataUrl);
      }
    } catch {
      console.log('Camera cancelled or failed');
    }
  }

  public triggerFileInput(): void {
    void this.pickFromGallery();
  }

  public async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Selecciona una imagen válida';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage = 'La imagen no debe superar 2MB';
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      await this.uploadPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  public async pickFromGallery(): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        width: 1024,
      });

      if (image?.dataUrl) {
        await this.uploadPhoto(image.dataUrl);
      }
    } catch {
      console.log('Gallery pick cancelled');
    }
  }

  private async uploadPhoto(dataUrl: string): Promise<void> {
    this.isUploadingPhoto = true;
    this.errorMessage = '';

    try {
      const res = await firstValueFrom(this.authService.updatePhoto(dataUrl));
      if (res?.photoUrl) {
        this.profile.photoUrl = res.photoUrl;
        const token = this.authService.getToken();
        if (token) {
          await this.authService.saveSession(token, this.profile);
        }
      }
    } catch (error: any) {
      this.errorMessage = error.error?.error || 'Error al subir la foto';
    } finally {
      this.isUploadingPhoto = false;
    }
  }

  public startEditing(): void {
    this.editForm = { ...this.profile };
    this.isEditing = true;
  }

  public cancelEditing(): void {
    this.isEditing = false;
    this.errorMessage = '';
  }

  public get isFormValid(): boolean {
    return this.editForm.firstName.trim().length >= 2 && this.editForm.lastName.trim().length >= 2;
  }

  public async saveProfile(): Promise<void> {
    if (this.isSaving || !this.isFormValid) return;
    this.isSaving = true;
    this.errorMessage = '';

    try {
      const res = await firstValueFrom(
        this.authService.updateProfile({
          firstName: this.editForm.firstName,
          lastName: this.editForm.lastName,
          documentType: this.editForm.documentType,
          documentNumber: this.editForm.documentNumber,
          phone: this.editForm.phone,
        })
      );
      if (res?.user) {
        this.profile = res.user;
        const token = this.authService.getToken();
        if (token) await this.authService.saveSession(token, res.user);
      }
      this.isEditing = false;
    } catch (error: any) {
      this.errorMessage = error.error?.error || 'Error al guardar los cambios';
    } finally {
      this.isSaving = false;
    }
  }

  public goBack(): void {
    void this.navCtrl.back();
  }

  public goTo(route: string): void {
    void this.navCtrl.navigateForward(route);
  }

  public logout(): void {
    this.authService.logout();
  }
}
