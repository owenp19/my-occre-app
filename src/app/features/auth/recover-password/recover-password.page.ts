import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  mailOutline,
  lockClosedOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

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

  constructor(private readonly navCtrl: NavController) {
    addIcons({
      arrowBackOutline,
      mailOutline,
      lockClosedOutline,
      checkmarkCircleOutline,
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
    const value =
      (event as CustomEvent<{ value: string | null }>).detail?.value ?? '';
    this.email = value.trim();
  }

  public get isEmailValid(): boolean {
    return this.email.length > 5 && this.email.includes('@');
  }

  public async sendRecovery(): Promise<void> {
    if (!this.isEmailValid || this.isSubmitting) return;

    this.isSubmitting = true;

    await this.delay(1200);

    this.isSubmitting = false;
    this.step = 'sent';
  }

  public goToLogin(): void {
    void this.navCtrl.navigateRoot('/login');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }
}
