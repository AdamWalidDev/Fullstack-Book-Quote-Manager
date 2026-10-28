import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '[class.auth-layout]': 'isAuthRoute',
  },
})
export class App {
  protected readonly title = signal('Quotebook');
  protected readonly year = new Date().getFullYear();
  protected router = inject(Router);
  protected auth = inject(AuthService);
  protected themeService = inject(ThemeService);
  protected navOpen = false;

  protected get isAuthRoute(): boolean {
    return this.router.url.startsWith('/login') || this.router.url.startsWith('/register');
  }
}
