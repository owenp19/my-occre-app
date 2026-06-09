import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';
import { OfflineService } from './offline.service';

@Injectable({ providedIn: 'root' })
export class NetworkService {
  private isConnectedSubject = new BehaviorSubject<boolean>(true);
  public isConnected$: Observable<boolean> = this.isConnectedSubject.asObservable();
  private connectionType = 'unknown';

  constructor(private readonly offline: OfflineService) {
    this.initializeNetworkListener();
  }

  private async initializeNetworkListener(): Promise<void> {
    try {
      const status = await Network.getStatus();
      this.isConnectedSubject.next(status.connected);
      this.connectionType = status.connectionType;
      this.offline.setOnline(status.connected);

      await Network.addListener('networkStatusChange', (status) => {
        this.isConnectedSubject.next(status.connected);
        this.connectionType = status.connectionType;
        this.offline.setOnline(status.connected);
      });
    } catch {
      this.isConnectedSubject.next(true);
      this.offline.setOnline(true);
    }
  }

  isOnline(): boolean {
    return this.isConnectedSubject.value;
  }

  getConnectionType(): string {
    return this.connectionType;
  }
}
