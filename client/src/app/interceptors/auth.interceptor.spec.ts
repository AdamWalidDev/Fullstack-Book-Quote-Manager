import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let requests: HttpTestingController;
  let auth: { token: string | null; logout: jasmine.Spy };

  beforeEach(() => {
    auth = { token: 'current-session', logout: jasmine.createSpy('logout') };
    auth.logout.and.callFake(() => { auth.token = null; });
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    });
    http = TestBed.inject(HttpClient);
    requests = TestBed.inject(HttpTestingController);
  });

  afterEach(() => requests.verify());

  it('attaches the token and logs out when the API rejects it', () => {
    let receivedError: HttpErrorResponse | undefined;
    http.get(`${environment.apiUrl}/books`).subscribe({ error: (error) => { receivedError = error; } });
    const request = requests.expectOne(`${environment.apiUrl}/books`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer current-session');

    request.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(auth.logout).toHaveBeenCalledTimes(1);
    expect(receivedError?.status).toBe(401);
  });

  it('redirects an unauthenticated protected request on 401', () => {
    auth.token = null;
    http.get(`${environment.apiUrl}/books`).subscribe({ error: () => {} });
    const request = requests.expectOne(`${environment.apiUrl}/books`);
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(auth.logout).toHaveBeenCalledTimes(1);
  });

  for (const endpoint of ['auth/login', 'auth/register']) {
    it(`keeps ${endpoint} failures in the form without redirecting`, () => {
      http.post(`${environment.apiUrl}/${endpoint}`, {}).subscribe({ error: () => {} });
      const request = requests.expectOne(`${environment.apiUrl}/${endpoint}`);
      expect(request.request.headers.has('Authorization')).toBeFalse();
      request.flush(null, { status: 401, statusText: 'Unauthorized' });
      expect(auth.logout).not.toHaveBeenCalled();
    });
  }

  it('does not attach the token or redirect for another server', () => {
    const url = 'https://example.com/api/books';
    http.get(url).subscribe({ error: () => {} });
    const request = requests.expectOne(url);
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(auth.logout).not.toHaveBeenCalled();
  });

  for (const status of [0, 403, 500]) {
    it(`keeps the session for a non-401 error (${status})`, () => {
      http.get(`${environment.apiUrl}/books`).subscribe({ error: () => {} });
      const request = requests.expectOne(`${environment.apiUrl}/books`);
      if (status === 0) request.error(new ProgressEvent('error'));
      else request.flush(null, { status, statusText: 'Error' });
      expect(auth.logout).not.toHaveBeenCalled();
    });
  }

  it('redirects only once when concurrent requests reject the same session', () => {
    http.get(`${environment.apiUrl}/books`).subscribe({ error: () => {} });
    http.get(`${environment.apiUrl}/my-citations`).subscribe({ error: () => {} });
    requests.expectOne(`${environment.apiUrl}/books`).flush(null, { status: 401, statusText: 'Unauthorized' });
    requests.expectOne(`${environment.apiUrl}/my-citations`).flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(auth.logout).toHaveBeenCalledTimes(1);
  });

  it('keeps a new session when an older request fails late', () => {
    http.get(`${environment.apiUrl}/books`).subscribe({ error: () => {} });
    auth.token = 'new-session';
    requests.expectOne(`${environment.apiUrl}/books`).flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(auth.logout).not.toHaveBeenCalled();
    expect(auth.token).toBe('new-session');
  });
});
