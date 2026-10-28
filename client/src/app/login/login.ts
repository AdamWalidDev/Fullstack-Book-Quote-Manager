import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { describeHttpError } from '../services/http-error';
import { AuthShell } from '../shared/auth-shell';

// Public demo account (created automatically by the API at startup).
const DEMO_USERNAME = 'demo';
const DEMO_PASSWORD = 'demo1234';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, AuthShell],
  templateUrl: './login.html',
  styles: ``,
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  error = signal('');
  loading = signal(false);

  // Called when user clicks the login button
  onSubmit() {
    this.login(this.username, this.password);
  }

  // One-click login with the demo account
  loginAsDemo() {
    this.username = DEMO_USERNAME;
    this.password = DEMO_PASSWORD;
    this.login(DEMO_USERNAME, DEMO_PASSWORD);
  }

  private login(username: string, password: string) {
    this.error.set('');
    this.loading.set(true);

    // Try to log in, go to home on success
    this.auth.login({ username, password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(describeHttpError(err, 'Login failed. Please try again.'));
      },
    });
  }
}
