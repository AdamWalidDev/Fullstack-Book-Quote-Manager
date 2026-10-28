import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-shell',
  styles: `
    :host {
      display: flex;
      flex: 1;
      min-width: 0;
    }
  `,
  template: `
    <div class="auth-shell page">
      <section class="auth-card">
        <ng-content />
      </section>
    </div>
  `,
})
export class AuthShell {}
