import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { OfflineService } from '../services/offline.service';
import { NetworkService } from '../services/network.service';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  constructor(
    private readonly offline: OfflineService,
    private readonly network: NetworkService,
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.offline.isOfflineMode) {
      return next.handle(req);
    }

    if (!this.network.isOnline()) {
      this.offline.setOnline(false);
    }

    if (req.method === 'GET') {
      if (this.network.isOnline()) {
        return next.handle(req).pipe(
          switchMap(async (event: HttpEvent<unknown>) => {
            if (event && (event as any).body) {
              await this.offline.cacheResponse(req.urlWithParams, (event as any).body);
            }
            return event;
          }),
          catchError(async (error: HttpErrorResponse) => {
            const cached = await this.offline.getCachedResponse<any>(req.urlWithParams);
            if (cached) {
              return { body: cached, status: 200, headers: error.headers, statusText: 'OK' } as any;
            }
            throw error;
          }),
        );
      } else {
        return from(this.offline.getCachedResponse<any>(req.urlWithParams)).pipe(
          switchMap(cached => {
            if (cached) {
              return of({ body: cached, status: 200, statusText: 'OK (cache)' } as any);
            }
            return throwError(() => new Error('Sin conexión y sin datos en caché'));
          }),
        );
      }
    }

    if (!this.network.isOnline()) {
      return from(this.offline.queueRequest(req.method, req.urlWithParams, req.body)).pipe(
        switchMap(() => throwError(() => new Error('Operación encolada para cuando haya conexión'))),
      );
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0 || error.status === 503) {
          return from(this.offline.queueRequest(req.method, req.urlWithParams, req.body)).pipe(
            switchMap(() => throwError(() => new Error('Operación encolada. Se sincronizará automáticamente'))),
          );
        }
        return throwError(() => error);
      }),
    );
  }
}
