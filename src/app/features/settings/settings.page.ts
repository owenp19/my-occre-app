import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
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
} from 'ionicons/icons';
import { ThemeService } from '../../services/theme.service';
import { TranslationService, Language } from '../../services/translation.service';

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
export class SettingsPage {
  public readonly appVersion = '1.0.0';

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
      id: 'legal',
      key: 'settings.privacynotice',
      descKey: 'settings.privacynotice.desc',
      icon: 'shield-checkmark-outline',
      type: 'navigation',
      route: '/legal',
    },
  ];

  public showLangMenu = false;
  public readonly languages: { code: Language; label: string }[] = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
  ];

  constructor(
    private readonly navCtrl: NavController,
    public readonly themeService: ThemeService,
    public readonly translation: TranslationService,
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
    });
  }

  public get currentLangLabel(): string {
    return this.translation.current === 'es' ? 'Español' : 'English';
  }

  public goBack(): void {
    void this.navCtrl.back();
  }

  public onToggleChange(option: SettingsOption): void {
    option.value = !option.value;
    if (option.id === 'theme') {
      this.themeService.setDark(option.value ?? false);
      this.options[1].value = this.themeService.isDark;
    }
  }

  public toggleLangMenu(): void {
    this.showLangMenu = !this.showLangMenu;
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
