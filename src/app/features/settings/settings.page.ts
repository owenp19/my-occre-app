import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { firstValueFrom } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  notificationsOutline,
  languageOutline,
  moonOutline,
  cellularOutline,
  informationCircleOutline,
  chevronForwardOutline,
  logOutOutline,
  shieldCheckmarkOutline,
  documentTextOutline,
  checkmarkOutline,
  colorPaletteOutline,
  cloudOfflineOutline,
  syncOutline,
  fingerPrintOutline,
} from 'ionicons/icons';
import { ThemeService, ColorTheme } from '../../services/theme.service';
import { OfflineService } from '../../services/offline.service';
import { TranslationService, Language } from '../../services/translation.service';
import { AuthService } from '../../services/auth.service';
import { BiometricService } from '../../services/biometric.service';
import { SecureStorageService } from '../../services/secure-storage.service';

interface SettingsOption {
  id: string;
  key: string;
  descKey: string;
  icon: string;
  type: 'toggle' | 'navigation';
  value?: boolean;
  route?: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false,
})
export class SettingsPage implements OnInit {
  public readonly appVersion = '1.0.0';
  public biometricAvailable = false;
  public biometricEnabled = false;
  public biometryLabel = '';

  public readonly options: SettingsOption[] = [
    {
      id: 'notifications',
      key: 'settings.notifications',
      descKey: 'settings.notifications.desc',
      icon: 'notifications-outline',
      type: 'toggle',
      value: true,
    },
    {
      id: 'theme',
      key: 'settings.darkmode',
      descKey: 'settings.darkmode.desc',
      icon: 'moon-outline',
      type: 'toggle',
      value: this.themeService.isDark,
    },
    {
      id: 'mobile-data',
      key: 'settings.mobiledata',
      descKey: 'settings.mobiledata.desc',
      icon: 'cellular-outline',
      type: 'toggle',
      value: true,
    },
    {
      id: 'offline',
      key: 'settings.offline',
      descKey: 'settings.offline.desc',
      icon: 'cloud-offline-outline',
      type: 'toggle',
      value: this.offline.isOfflineMode,
    },
    {
      id: 'legal',
      key: 'settings.privacynotice',
      descKey: 'settings.privacynotice.desc',
      icon: 'shield-checkmark-outline',
      type: 'navigation',
      route: '/legal',
    },
  ];

  public showLangMenu = false;
  public showColorMenu = false;
  public readonly colorOptions: { value: ColorTheme; labelKey: string; class: string }[] = [
    { value: 'blue', labelKey: 'settings.colortheme.blue', class: 'color-blue' },
    { value: 'red', labelKey: 'settings.colortheme.red', class: 'color-red' },
    { value: 'yellow', labelKey: 'settings.colortheme.yellow', class: 'color-yellow' },
  ];
  public readonly languages: { code: Language; label: string }[] = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
  ];

  constructor(
    private readonly navCtrl: NavController,
    public readonly themeService: ThemeService,
    public readonly offline: OfflineService,
    public readonly translation: TranslationService,
    private readonly authService: AuthService,
    private readonly biometricService: BiometricService,
    private readonly secureStorage: SecureStorageService,
  ) {
    addIcons({
      arrowBackOutline,
      notificationsOutline,
      languageOutline,
      moonOutline,
      cellularOutline,
      informationCircleOutline,
      chevronForwardOutline,
      logOutOutline,
      shieldCheckmarkOutline,
      documentTextOutline,
      checkmarkOutline,
      colorPaletteOutline,
      cloudOfflineOutline,
      syncOutline,
      fingerPrintOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      this.biometricAvailable = await this.biometricService.isAvailable();
      if (this.biometricAvailable) {
        this.biometryLabel = await this.biometricService.getBiometryLabel();
      }
    }
    const saved = await this.secureStorage.isBiometricEnabled();
    this.biometricEnabled = saved;
  }

  public get currentLangLabel(): string {
    const lang = this.languages.find(l => l.code === this.translation.current);
    return lang ? lang.label : 'Español';
  }

  public goBack(): void {
    void this.navCtrl.back();
  }

  public onToggleChange(option: SettingsOption): void {
    option.value = !option.value;
    if (option.id === 'theme') {
      this.themeService.setDark(option.value ?? false);
      this.options[1].value = this.themeService.isDark;
    } else if (option.id === 'offline') {
      this.offline.setOfflineMode(option.value ?? false);
    }
  }

  async onBiometricToggle(): Promise<void> {
    this.biometricEnabled = !this.biometricEnabled;
    await this.secureStorage.setBiometricEnabled(this.biometricEnabled);
    try {
      await firstValueFrom(this.authService.setBiometricPreference(this.biometricEnabled));
    } catch {
      console.warn('[Settings] No se pudo sincronizar preferencia biométrica');
    }
  }

  get offlineQueueCount(): number {
    return this.offline['_queueCount'].value;
  }

  public toggleLangMenu(): void {
    this.showLangMenu = !this.showLangMenu;
    this.showColorMenu = false;
  }

  public toggleColorMenu(): void {
    this.showColorMenu = !this.showColorMenu;
    this.showLangMenu = false;
  }

  public setColorTheme(color: ColorTheme): void {
    this.themeService.setColorTheme(color);
    this.showColorMenu = false;
  }

  public setLanguage(lang: Language): void {
    this.translation.setLanguage(lang);
    this.showLangMenu = false;
  }

  public goTo(route?: string): void {
    if (!route) return;
    void this.navCtrl.navigateForward(route);
  }

  public logout(): void {
    void this.navCtrl.navigateRoot('/login');
  }
}
