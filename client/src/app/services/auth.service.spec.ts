import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { environment } from '../../environments/environment';
import { authGuard } from '../guards/auth.guard';
import { AuthService } from './auth.service';

function tokenWithPayload(payload: object): string {
  const encoded = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `header.${encoded}.signature`;
}

describe('AuthService session expiration', () => {
  let router: jasmine.SpyObj<Router>;
  let originalToken: string | null;

  beforeEach(() => {
    originalToken = localStorage.getItem('jwt_token');
    localStorage.removeItem('jwt_token');
    router = jasmine.createSpyObj<Router>('Router', ['navigate', 'createUrlTree']);
    router.navigate.and.resolveTo(true);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    TestBed.resetTestingModule();
    if (originalToken === null) localStorage.removeItem('jwt_token');
    else localStorage.setItem('jwt_token', originalToken);
  });

  it('clears an expired saved token and redirects protected navigation to login', () => {
    localStorage.setItem('jwt_token', tokenWithPayload({ exp: Date.now() / 1000 - 60 }));
    const loginUrl = new UrlTree();
    router.createUrlTree.and.returnValue(loginUrl);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBe(loginUrl);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(TestBed.inject(AuthService).isLoggedIn()).toBeFalse();
    expect(localStorage.getItem('jwt_token')).toBeNull();
  });

  for (const token of ['invalid', 'header.%%%.signature', tokenWithPayload({}), tokenWithPayload({ exp: 'invalid' })]) {
    it(`discards an unreadable or missing expiration: ${token}`, () => {
      localStorage.setItem('jwt_token', token);
      const auth = TestBed.inject(AuthService);
      expect(auth.token).toBeNull();
      expect(auth.isLoggedIn()).toBeFalse();
      expect(localStorage.getItem('jwt_token')).toBeNull();
    });
  }

  it('redirects when a saved session expires while the page is open', fakeAsync(() => {
    const token = tokenWithPayload({ exp: (Date.now() + 5000) / 1000 });
    localStorage.setItem('jwt_token', token);
    const auth = TestBed.inject(AuthService);

    tick(4999);
    expect(auth.token).toBe(token);
    expect(auth.isLoggedIn()).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();

    tick(1);
    expect(auth.token).toBeNull();
    expect(auth.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem('jwt_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/login'], { replaceUrl: true });
  }));

  it('uses the new expiry after signing in again', fakeAsync(() => {
    localStorage.setItem('jwt_token', tokenWithPayload({ exp: (Date.now() + 1000) / 1000 }));
    const auth = TestBed.inject(AuthService);
    const token = tokenWithPayload({ exp: (Date.now() + 5000) / 1000 });

    auth.login({ username: 'demo', password: 'password' }).subscribe();
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/auth/login`).flush({ token });

    tick(1000);
    expect(auth.token).toBe(token);
    expect(localStorage.getItem('jwt_token')).toBe(token);
    expect(router.navigate).not.toHaveBeenCalled();

    tick(4000);
    expect(auth.isLoggedIn()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/login'], { replaceUrl: true });
  }));

  it('cancels the expiry redirect after manual logout', fakeAsync(() => {
    localStorage.setItem('jwt_token', tokenWithPayload({ exp: (Date.now() + 1000) / 1000 }));
    TestBed.inject(AuthService).logout();
    tick(1000);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/login'], { replaceUrl: true });
  }));
});
