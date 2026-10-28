import { Component } from '@angular/core';

// Two-column layout for the login and register pages:
// a product panel on the left and the form (projected content) on the right.
@Component({
  selector: 'app-auth-shell',
  template: `
    <div class="auth-shell page">
      <aside class="auth-aside">
        <div class="aside-content">
          <span class="brand-mark lg"><i class="fas fa-quote-right"></i></span>
          <h2>Your reading list and quote library, in one place.</h2>
          <ul class="aside-features">
            <li style="--i: 0">
              <i class="fas fa-book-open"></i>
              <span><strong>Shared library</strong>Keep a single catalogue of books everyone can browse and update.</span>
            </li>
            <li style="--i: 1">
              <i class="fas fa-quote-left"></i>
              <span><strong>Personal collections</strong>Save quotes privately — each account sees only its own.</span>
            </li>
            <li style="--i: 2">
              <i class="fas fa-shield-halved"></i>
              <span><strong>Secure by default</strong>JWT authentication and salted, hashed passwords.</span>
            </li>
          </ul>
          <p class="aside-foot">.NET 9 Web API · Angular 20 · EF Core</p>
        </div>
      </aside>
      <section class="auth-main">
        <div class="auth-card">
          <ng-content />
        </div>
      </section>
    </div>
  `,
})
export class AuthShell {}

