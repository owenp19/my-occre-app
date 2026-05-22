import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  chevronForwardOutline,
  eyeOffOutline,
  eyeOutline,
  lockClosedOutline,
  mailOutline,
  personOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false,
})
export class LoginComponent {
  public email = '';
  public password = '';
  public showPassword = false;
  public isSubmitting = false;
  public isGoingToRegister = false;
  public isRecoveringPassword = false;

  constructor(private readonly navCtrl: NavController) {
    addIcons({
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      personOutline,
      chevronForwardOutline,
    });
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

    try {
      this.clearActiveFocus();

      await this.delay(700);

      await this.navCtrl.navigateRoot('/home');
    } catch (error) {
      console.error('Error al iniciar sesión y navegar hacia /home:', error);
    } finally {
      this.isSubmitting = false;
    }
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
    return this.email.length > 5 && this.password.length >= 6;
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