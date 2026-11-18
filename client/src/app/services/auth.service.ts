import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, NgZone, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

interface AuthResponse {
  token: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
}

// Base URL for auth API
const API = `${environment.apiUrl}/auth`;
// Key used to store the token in localStorage
const TOKEN_KEY = 'jwt_token';

// Handles login, register, logout and token storage
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private zone = inject(NgZone);

  private tokenSignal = signal<string | null>(null);
  private expirationTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.setToken(localStorage.getItem(TOKEN_KEY));
    inject(DestroyRef).onDestroy(() => clearTimeout(this.expirationTimer));
  }

  // Saved tokens are checked on startup and cleared when they expire.
  isLoggedIn = computed(() => !!this.tokenSignal());

  get token(): string | null {
    return this.tokenSignal();
  }

  // Send register request to API
  register(data: RegisterRequest) {
    return this.http.post(`${API}/register`, data);
  }

  // Send login request, save token on success
  login(data: LoginRequest) {
    return this.http.post<AuthResponse>(`${API}/login`, data).pipe(
      tap((res) => this.setToken(res.token))
    );
  }

  // Remove token and go to login page
  logout() {
    this.setToken(null);
    void this.router.navigate(['/login'], { replaceUrl: true });
  }

  private setToken(token: string | null) {
    clearTimeout(this.expirationTimer);
    const expiresAt = this.getExpiration(token);

    if (!token || expiresAt === null || expiresAt <= Date.now()) {
      localStorage.removeItem(TOKEN_KEY);
      this.tokenSignal.set(null);
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);
    this.tokenSignal.set(token);
    this.scheduleExpiration(expiresAt);
  }

  private scheduleExpiration(expiresAt: number) {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      this.logout();
      return;
    }

    // Recheck the clock after waking; cap the delay at the browser timer limit.
    this.expirationTimer = this.zone.runOutsideAngular(() =>
      setTimeout(
        () => this.zone.run(() => this.scheduleExpiration(expiresAt)),
        Math.min(remaining, 2_147_483_647)
      )
    );
  }

  private getExpiration(token: string | null): number | null {
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3 || parts.some((part) => !part)) return null;

      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const { exp } = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')));
      // This only controls client navigation; the API still validates the JWT.
      return typeof exp === 'number' && Number.isFinite(exp * 1000) ? exp * 1000 : null;
    } catch {
      return null;
    }
  }
}
