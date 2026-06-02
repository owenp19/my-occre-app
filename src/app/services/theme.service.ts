import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly DARK_KEY = 'occre_dark_mode';
  private _isDark = false;

  constructor() {
    const stored = localStorage.getItem(this.DARK_KEY);
    this._isDark = stored === 'true';
    this.applyTheme();
  }

  get isDark(): boolean {
    return this._isDark;
  }

  toggle(): void {
    this._isDark = !this._isDark;
    localStorage.setItem(this.DARK_KEY, String(this._isDark));
    this.applyTheme();
  }

  setDark(value: boolean): void {
    this._isDark = value;
    localStorage.setItem(this.DARK_KEY, String(this._isDark));
    this.applyTheme();
  }

  private applyTheme(): void {
    if (this._isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}
