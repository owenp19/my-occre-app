import { Injectable } from '@angular/core';

export type ColorTheme = 'blue' | 'red' | 'yellow';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly DARK_KEY = 'occre_dark_mode';
  private readonly COLOR_KEY = 'occre_color_theme';
  private _isDark = false;
  private _colorTheme: ColorTheme = 'blue';

  constructor() {
    const stored = localStorage.getItem(this.DARK_KEY);
    this._isDark = stored === 'true';

    const storedColor = localStorage.getItem(this.COLOR_KEY) as ColorTheme | null;
    if (storedColor && ['blue', 'red', 'yellow'].includes(storedColor)) {
      this._colorTheme = storedColor;
    }

    this.applyTheme();
  }

  get isDark(): boolean {
    return this._isDark;
  }

  get colorTheme(): ColorTheme {
    return this._colorTheme;
  }

  get isDefault(): boolean {
    return this._colorTheme === 'blue' && !this._isDark;
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

  setColorTheme(color: ColorTheme): void {
    this._colorTheme = color;
    localStorage.setItem(this.COLOR_KEY, color);
    this.applyTheme();
  }

  private applyTheme(): void {
    const root = document.documentElement;

    root.classList.remove('theme-red', 'theme-yellow');
    if (this._colorTheme !== 'blue') {
      root.classList.add(`theme-${this._colorTheme}`);
    }

    if (this._isDark) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
  }
}
