import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly loadingSubject = new Subject<boolean>();
  public readonly loading$ = this.loadingSubject.asObservable();
  private counter = 0;

  show(): void {
    this.counter++;
    if (this.counter === 1) {
      this.loadingSubject.next(true);
    }
  }

  hide(): void {
    this.counter = Math.max(0, this.counter - 1);
    if (this.counter === 0) {
      this.loadingSubject.next(false);
    }
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    this.show();
    try {
      return await fn();
    } finally {
      this.hide();
    }
  }
}
