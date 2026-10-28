import { HttpErrorResponse } from '@angular/common/http';

// Turns an HTTP error into a message that tells the user what actually went wrong.
export function describeHttpError(err: unknown, fallback: string): string {
  if (!(err instanceof HttpErrorResponse)) {
    return fallback;
  }

  switch (err.status) {
    case 0:
      // Network error, CORS block, or server not reachable.
      return 'Could not connect to the server. Please try again shortly.';
    case 401:
      return 'Invalid username or password.';
    case 400:
      return typeof err.error === 'string' && err.error ? err.error : fallback;
    default:
      return err.status >= 500
        ? 'The server had a problem. Please try again shortly.'
        : fallback;
  }
}

