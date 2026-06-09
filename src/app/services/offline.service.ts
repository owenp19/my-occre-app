import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable } from 'rxjs';

export interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  body?: unknown;
  timestamp: number;
}

const CACHE_PREFIX = 'occre_cache_';
const QUEUE_KEY = 'occre_offline_queue';
const MODE_KEY = 'occre_offline_mode';
const CACHE_TTL = 10 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class OfflineService {
  private _isOfflineMode = false;
  private _queueCount = new BehaviorSubject<number>(0);
  private _isOnline = true;

  queueCount$: Observable<number> = this._queueCount.asObservable();

  constructor() {
    this.loadOfflineMode();
  }

  private async loadOfflineMode(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: MODE_KEY });
      this._isOfflineMode = value === 'true';
    } catch {
      this._isOfflineMode = false;
    }
  }

  get isOfflineMode(): boolean {
    return this._isOfflineMode;
  }

  setOfflineMode(enabled: boolean): void {
    this._isOfflineMode = enabled;
    Preferences.set({ key: MODE_KEY, value: String(enabled) });
  }

  setOnline(status: boolean): void {
    this._isOnline = status;
    if (status && this._isOfflineMode) {
      this.syncQueue();
    }
  }

  async cacheResponse(url: string, data: unknown): Promise<void> {
    if (!this._isOfflineMode) return;
    const key = CACHE_PREFIX + btoa(url);
    const entry = { data, timestamp: Date.now() };
    await Preferences.set({ key, value: JSON.stringify(entry) });
  }

  async getCachedResponse<T>(url: string): Promise<T | null> {
    if (!this._isOfflineMode) return null;
    const key = CACHE_PREFIX + btoa(url);
    try {
      const { value } = await Preferences.get({ key });
      if (!value) return null;
      const entry = JSON.parse(value);
      if (Date.now() - entry.timestamp > CACHE_TTL) {
        await Preferences.remove({ key });
        return null;
      }
      return entry.data as T;
    } catch {
      return null;
    }
  }

  async queueRequest(method: string, url: string, body?: unknown): Promise<void> {
    const queue = await this.getQueue();
    queue.push({
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      method,
      url,
      body,
      timestamp: Date.now(),
    });
    await Preferences.set({ key: QUEUE_KEY, value: JSON.stringify(queue) });
    this._queueCount.next(queue.length);
  }

  async getQueue(): Promise<QueuedRequest[]> {
    try {
      const { value } = await Preferences.get({ key: QUEUE_KEY });
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  }

  async syncQueue(): Promise<void> {
    const queue = await this.getQueue();
    if (queue.length === 0) return;

    const failed: QueuedRequest[] = [];
    for (const req of queue) {
      try {
        const opts: RequestInit = {
          method: req.method,
          headers: { 'Content-Type': 'application/json' },
        };
        if (req.body) {
          opts.body = JSON.stringify(req.body);
        }
        const res = await fetch(req.url, opts);
        if (res.ok) {
          const data = await res.json();
          await this.cacheResponse(req.url, data);
        } else {
          failed.push(req);
        }
      } catch {
        failed.push(req);
      }
    }

    await Preferences.set({ key: QUEUE_KEY, value: JSON.stringify(failed) });
    this._queueCount.next(failed.length);
  }

  async clearCache(): Promise<void> {
    const { keys } = await Preferences.keys();
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
    for (const key of cacheKeys) {
      await Preferences.remove({ key });
    }
  }
}
