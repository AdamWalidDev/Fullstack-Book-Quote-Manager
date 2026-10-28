import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { describeHttpError } from '../services/http-error';
import { AuthShell } from '../shared/auth-shell';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, AuthShell],
  templateUrl: './register.html',
  styles: ``,
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  error = signal('');
  loading = signal(false);

  // Called when user clicks the register button
  onSubmit() {
    this.error.set('');
    this.loading.set(true);

    // Try to register, go to login page on success
    this.auth.register({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(describeHttpError(err, 'Registration failed. Username may already be taken.'));
      },
    });
  }
}
