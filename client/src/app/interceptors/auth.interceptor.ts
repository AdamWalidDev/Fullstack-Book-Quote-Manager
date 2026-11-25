import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

// Authenticate API requests and send rejected sessions back to sign-in.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const path = req.url.split('?')[0];
  const isApiRequest = path.startsWith(`${environment.apiUrl}/`);
  const isAuthRequest = path === `${environment.apiUrl}/auth/login`
    || path === `${environment.apiUrl}/auth/register`;

  if (!isApiRequest || isAuthRequest) {
    return next(req);
  }

  const auth = inject(AuthService);
  const token = auth.token;

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && auth.token === token) {
        // Ignore late failures from a session that has since been replaced.
        auth.logout();
      }
      return throwError(() => error);
    })
  );
};
