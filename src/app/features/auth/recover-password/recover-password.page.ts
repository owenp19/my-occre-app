import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  mailOutline,
  lockClosedOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.page.html',
  styleUrls: ['./recover-password.page.scss'],
  standalone: false,
})
export class RecoverPasswordPage {
  public email = '';
  public step: 'form' | 'sent' = 'form';
  public isSubmitting = false;
  public errorMessage = '';
  public successMessage = '';

  constructor(
    private readonly navCtrl: NavController,
    private readonly authService: AuthService,
  ) {
    addIcons({
      arrowBackOutline,
      mailOutline,
      lockClosedOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
    });
  }

  public goBack(): void {
    if (this.step === 'sent') {
      this.step = 'form';
      return;
    }
    void this.navCtrl.back();
  }

  public onEmailInput(event: Event): void {
    const value = (event as CustomEvent<{ value: string | null }>).detail?.value ?? '';
    this.email = value.trim();
  }

  public get isEmailValid(): boolean {
    return this.email.length > 5 && this.email.includes('@');
  }

  public async sendRecovery(): Promise<void> {
    if (!this.isEmailValid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      const res = await firstValueFrom(this.authService.forgotPassword(this.email));
      this.step = 'sent';
      this.successMessage = res.message;
    } catch (error: any) {
      this.errorMessage = error.error?.error || 'Error al enviar la solicitud. Intenta de nuevo.';
    } finally {
      this.isSubmitting = false;
    }
  }

  public goToLogin(): void {
    void this.navCtrl.navigateRoot('/login');
  }
}
