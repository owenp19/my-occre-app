import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NetworkService } from '../services/network.service';

@Injectable()
export class NetworkInterceptor implements HttpInterceptor {
  constructor(private readonly networkService: NetworkService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.networkService.isOnline() && req.method !== 'GET') {
      return throwError(() => new Error('No hay conexión a internet. Los cambios se guardarán cuando recuperes conexión.'));
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!this.networkService.isOnline()) {
          console.warn('Operación en cola por falta de conexión:', req.url);
        }
        return throwError(() => error);
      }),
    );
  }
}
