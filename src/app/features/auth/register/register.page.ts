import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  personOutline,
  cardOutline,
  mailOutline,
  callOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  chevronBackOutline,
  chevronForwardOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

interface RegisterForm {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  public form: RegisterForm = {
    firstName: '',
    lastName: '',
    documentType: '',
    documentNumber: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  };

  public showPassword = false;
  public showConfirmPassword = false;
  public isSubmitting = false;
  public wasSubmitted = false;
  public isGoingBack = false;

  public readonly documentTypes = [
    { value: 'CC', label: 'Cédula de ciudadanía' },
    { value: 'TI', label: 'Tarjeta de identidad' },
    { value: 'CE', label: 'Cédula de extranjería' },
    { value: 'PA', label: 'Pasaporte' },
  ];

  constructor(private readonly navCtrl: NavController) {
    addIcons({
      personOutline,
      cardOutline,
      mailOutline,
      callOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      chevronBackOutline,
      chevronForwardOutline,
      checkmarkCircleOutline,
    });
  }

  public onInput(
    field: Exclude<keyof RegisterForm, 'acceptTerms'>,
    event: Event
  ): void {
    const value =
      (event as CustomEvent<{ value: string | null }>).detail?.value ?? '';

    this.form[field] = value.replace(/^\s+/, '');
  }

  public onDocumentTypeChange(event: Event): void {
    this.form.documentType =
      (event as CustomEvent<{ value: string | null }>).detail?.value ?? '';
  }

  public onTermsChange(event: Event): void {
    this.form.acceptTerms = Boolean(
      (event as CustomEvent<{ checked: boolean }>).detail?.checked
    );
  }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  public toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  public async goBack(): Promise<void> {
    if (this.isGoingBack) return;

    this.isGoingBack = true;

    try {
      await this.navCtrl.navigateBack('/login');
    } catch (error) {
      console.error('Error al volver hacia /login:', error);
      this.isGoingBack = false;
    }
  }

  public async goToLogin(): Promise<void> {
    if (this.isGoingBack) return;

    this.isGoingBack = true;

    try {
      await this.navCtrl.navigateBack('/login');
    } catch (error) {
      console.error('Error al navegar hacia /login:', error);
      this.isGoingBack = false;
    }
  }

  public async register(): Promise<void> {
    this.wasSubmitted = true;

    if (!this.isFormValid || this.isSubmitting) return;

    this.isSubmitting = true;

    try {
      await this.delay(1300);
      await this.navCtrl.navigateRoot('/home');
    } catch (error) {
      console.error('Error al registrar y navegar hacia /home:', error);
      this.isSubmitting = false;
    }
  }

  public get passwordsMatch(): boolean {
    return this.form.password === this.form.confirmPassword;
  }

  public get isEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email.trim());
  }

  public get isPasswordValid(): boolean {
    return this.form.password.length >= 6;
  }

  public get isFormValid(): boolean {
    return (
      this.form.firstName.trim().length >= 2 &&
      this.form.lastName.trim().length >= 2 &&
      this.form.documentType.trim().length > 0 &&
      this.form.documentNumber.trim().length >= 5 &&
      this.form.phone.trim().length >= 7 &&
      this.isEmailValid &&
      this.isPasswordValid &&
      this.passwordsMatch &&
      this.form.acceptTerms
    );
  }

  private delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => window.setTimeout(resolve, milliseconds));
  }
}