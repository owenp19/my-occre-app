import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NavController } from '@ionic/angular';
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
  public profile: User = {
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentType: '',
    documentNumber: '',
  };

  public editForm: User = {
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentType: '',
    documentNumber: '',
  };

  public isEditing = false;
  public isSaving = false;
  public isLoading = true;
  public errorMessage = '';

  public readonly quickActions: ProfileAction[] = [
    {
      label: 'profile.actions.mytramites',
      icon: 'document-text-outline',
      route: '/procedures',
    },
    {
      label: 'profile.actions.dataprotection',
      icon: 'shield-checkmark-outline',
      route: '/legal',
    },
    {
      label: 'profile.actions.help',
      icon: 'help-circle-outline',
      route: '/help-contact',
    },
  ];

  public readonly documentTypes = [
    { value: 'CC', label: 'Cédula de ciudadanía' },
    { value: 'TI', label: 'Tarjeta de identidad' },
    { value: 'CE', label: 'Cédula de extranjería' },
    { value: 'PA', label: 'Pasaporte' },
  ];

  constructor(
    private readonly navCtrl: NavController,
    private readonly authService: AuthService,
  ) {
    addIcons({
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
      if (localUser) {
        this.profile = localUser;
      }
    } finally {
      this.isLoading = false;
    }
  }

  public get userInitials(): string {
    const first = this.profile.firstName?.trim().charAt(0) || '';
    const last = this.profile.lastName?.trim().charAt(0) || '';
    return `${first}${last}`.toUpperCase();
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
    return (
      this.editForm.firstName.trim().length >= 2 &&
      this.editForm.lastName.trim().length >= 2
    );
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
        if (token) {
          this.authService.saveSession(token, res.user);
        }
      }
      this.isEditing = false;
    } catch (error: any) {
      if (error.status === 401 || error.status === 403) {
        this.errorMessage = 'Sesión expirada. Inicia sesión nuevamente.';
      } else if (error.status === 0) {
        this.errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
      } else {
        this.errorMessage = error.error?.error || 'Error al guardar los cambios. Intenta de nuevo.';
      }
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
