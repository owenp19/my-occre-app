import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NavController, AlertController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { addIcons } from 'ionicons';
import {
  chevronForwardOutline,
  eyeOffOutline,
  eyeOutline,
  lockClosedOutline,
  mailOutline,
  personOutline,
  fingerPrintOutline,
  personAddOutline,
  airplaneOutline,
  shieldCheckmarkOutline,
  headsetOutline,
} from 'ionicons/icons';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { LoadingService } from '../../../services/loading.service';
import { BiometricService } from '../../../services/biometric.service';
import { SecureStorageService } from '../../../services/secure-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent implements OnInit {
  public email = '';
  public password = '';
  public showPassword = false;
  public isSubmitting = false;
  public isGoingToRegister = false;
  public isRecoveringPassword = false;
  public errorMessage = '';
  public biometricAvailable = false;
  public biometryLabel = '';
  private readonly useFallback = environment.useFallback;

  constructor(
    private readonly navCtrl: NavController,
    private readonly authService: AuthService,
    private readonly loadingService: LoadingService,
    private readonly biometricService: BiometricService,
    private readonly secureStorage: SecureStorageService,
    private readonly alertCtrl: AlertController,
  ) {
    addIcons({
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      personOutline,
      chevronForwardOutline,
      fingerPrintOutline,
      personAddOutline,
      airplaneOutline,
      shieldCheckmarkOutline,
      headsetOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.biometricAvailable = await this.biometricService.isAvailable();
    if (this.biometricAvailable) {
      this.biometryLabel = await this.biometricService.getBiometryLabel();
      const biometricEnabled = await this.secureStorage.isBiometricEnabled();
      if (biometricEnabled) {
        await this.biometricLogin();
      }
    }
  }

  async biometricLogin(): Promise<void> {
    this.errorMessage = '';
    const result = await this.biometricService.authenticate();
    if (!result.success) {
      this.errorMessage = result.error || 'Autenticación fallida';
      return;
    }

    const userJson = this.secureStorage.getUserJson();
    const token = this.secureStorage.getToken();
    if (!token || !userJson) {
      this.errorMessage = 'No hay sesión guardada. Inicia sesión manualmente.';
      return;
    }

    this.loadingService.show();
    try {
      this.authService.saveSession(token, JSON.parse(userJson));
      await this.navCtrl.navigateRoot('/home');
    } finally {
      this.loadingService.hide();
    }
  }

  public onEmailInput(event: Event): void {
    const value =
      (event as CustomEvent<{ value: string | null }>).detail?.value ?? '';

    this.email = value.trim();
  }

  public onPasswordInput(event: Event): void {
    const value =
      (event as CustomEvent<{ value: string | null }>).detail?.value ?? '';

    this.password = value;
  }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  public async login(): Promise<void> {
    if (!this.isFormValid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      this.clearActiveFocus();
      this.loadingService.show();

      if (this.useFallback) {
        throw new Error('BACKEND_OFFLINE');
      }

      const res = await firstValueFrom(this.authService.login(this.email, this.password));
      if (res) {
        await this.authService.saveSession(res.token, res.user);

        if (Capacitor.isNativePlatform() && await this.biometricService.isAvailable()) {
          const alreadyEnabled = await this.secureStorage.isBiometricEnabled();
          if (!alreadyEnabled) {
            await this.promptEnableBiometric(res.user.id);
          }
        }

        await this.navCtrl.navigateRoot('/home');
      }
    } catch (error: any) {
      if (error.message === 'BACKEND_OFFLINE') {
        this.errorMessage = 'Servicio no disponible. Intenta más tarde.';
      } else {
        this.errorMessage = error.error?.error || 'Error al iniciar sesión';
      }
    } finally {
      this.isSubmitting = false;
      this.loadingService.hide();
    }
  }

  private async promptEnableBiometric(userId: number): Promise<void> {
    const label = await this.biometricService.getBiometryLabel();
    const alert = await this.alertCtrl.create({
      header: '¿Activar ingreso con ' + label + '?',
      message: `Puedes iniciar sesión con tu ${label} en lugar de escribir correo y contraseña.`,
      buttons: [
        { text: 'No ahora', role: 'cancel' },
        {
          text: 'Activar',
          handler: async () => {
            await this.secureStorage.setBiometricEnabled(true);
            try {
              await firstValueFrom(this.authService.setBiometricPreference(true));
            } catch {
              console.warn('[Biometric] No se pudo guardar preferencia en servidor');
            }
          },
        },
      ],
    });
    await alert.present();
  }

  public async recoverPassword(): Promise<void> {
    if (this.isRecoveringPassword) return;

    this.isRecoveringPassword = true;

    try {
      this.clearActiveFocus();

      await this.delay(100);

      await this.navCtrl.navigateForward('/recover-password');
    } catch (error) {
      console.error('Error al navegar hacia /recover-password:', error);
    } finally {
      this.isRecoveringPassword = false;
    }
  }

  public goToTourismCard(): void {
    this.navCtrl.navigateForward('/tarjeta-turismo');
  }

  public async goToRegister(): Promise<void> {
    if (this.isGoingToRegister) return;

    this.isGoingToRegister = true;

    try {
      this.clearActiveFocus();

      await this.delay(100);

      await this.navCtrl.navigateRoot('/register');
    } catch (error) {
      console.error('Error al navegar hacia /register:', error);
    } finally {
      this.isGoingToRegister = false;
    }
  }

  public get isFormValid(): boolean {
    return this.email.length > 0 && this.password.length >= 6;
  }

  private clearActiveFocus(): void {
    const activeElement = document.activeElement as HTMLElement | null;

    if (activeElement) {
      activeElement.blur();
    }
  }

  private delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => window.setTimeout(resolve, milliseconds));
  }
}
