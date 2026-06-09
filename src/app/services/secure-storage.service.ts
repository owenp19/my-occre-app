import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })
export class SecureStorageService {
  private readonly TOKEN_KEY = 'occre_token';
  private readonly USER_KEY = 'occre_user';
  private readonly BIOMETRIC_KEY = 'occre_biometric_enabled';
  private cachedToken: string | null = null;
  private cachedUserJson: string | null = null;

  constructor() {
    this.loadFromStorage();
    this.readSyncFallback();
  }

  private readSyncFallback(): void {
    if (!this.cachedToken) {
      this.cachedToken = localStorage.getItem(this.TOKEN_KEY);
    }
    if (!this.cachedUserJson) {
      this.cachedUserJson = localStorage.getItem(this.USER_KEY);
    }
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const { value: token } = await Preferences.get({ key: this.TOKEN_KEY });
      const { value: user } = await Preferences.get({ key: this.USER_KEY });
      this.cachedToken = token;
      this.cachedUserJson = user;
      if (token) localStorage.setItem(this.TOKEN_KEY, token);
      if (user) localStorage.setItem(this.USER_KEY, user);
    } catch {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const user = localStorage.getItem(this.USER_KEY);
      if (token) {
        this.cachedToken = token;
        await Preferences.set({ key: this.TOKEN_KEY, value: token });
      }
      if (user) {
        this.cachedUserJson = user;
        await Preferences.set({ key: this.USER_KEY, value: user });
      }
    }
  }

  getToken(): string | null {
    return this.cachedToken;
  }

  getUserJson(): string | null {
    return this.cachedUserJson;
  }

  async save(key: string, value: string): Promise<void> {
    if (key === this.TOKEN_KEY) this.cachedToken = value;
    if (key === this.USER_KEY) this.cachedUserJson = value;
    localStorage.setItem(key, value);
    await Preferences.set({ key, value });
  }

  async remove(key: string): Promise<void> {
    if (key === this.TOKEN_KEY) this.cachedToken = null;
    if (key === this.USER_KEY) this.cachedUserJson = null;
    localStorage.removeItem(key);
    await Preferences.remove({ key });
  }

  async clearAll(): Promise<void> {
    this.cachedToken = null;
    this.cachedUserJson = null;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.BIOMETRIC_KEY);
    await Preferences.remove({ key: this.TOKEN_KEY });
    await Preferences.remove({ key: this.USER_KEY });
    await Preferences.remove({ key: this.BIOMETRIC_KEY });
  }

  async isBiometricEnabled(): Promise<boolean> {
    const { value } = await Preferences.get({ key: this.BIOMETRIC_KEY });
    return value === 'true';
  }

  async setBiometricEnabled(enabled: boolean): Promise<void> {
    await Preferences.set({ key: this.BIOMETRIC_KEY, value: String(enabled) });
  }
}
