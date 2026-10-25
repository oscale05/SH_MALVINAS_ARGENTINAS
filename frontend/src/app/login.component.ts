import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <img src="assets/logo.png" alt="Malvinas Argentinas" class="login-logo" />
      <h2>Ingreso al Sistema</h2>
      <div class="login-form">
        <input [value]="username()" (input)="username.set($any($event.target).value)" placeholder="Usuario" />
        <input [value]="password()" (input)="password.set($any($event.target).value)" placeholder="Clave" type="password" />
        <button type="button" (click)="login()">Ingresar</button>
        <p [class.error]="status() === 'error'">{{ status() }}</p>
      </div>
    </div>
  `,
  styles: [`
    .login-container { max-width: 400px; margin: 40px auto; text-align: center; padding: 0 16px; }
    .login-logo { height: 80px; margin-bottom: 16px; max-width: 100%; }
    .login-form { display: flex; flex-direction: column; gap: 12px; align-items: center; margin-top: 16px; width: 100%; }
    .login-form input { max-width: 100%; width: 100%; }
    .login-form button { width: 100%; }
    @media (max-width: 480px) {
      .login-container { margin: 20px auto; }
      .login-logo { height: 60px; }
    }
  `]
})
export class LoginComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  username = signal('operador');
  password = signal('operador123');
  status = signal('sin login');

  login() {
    this.api.login(this.username(), this.password()).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.status.set('ok');
        this.router.navigate(['/']);
      },
      error: () => this.status.set('error')
    });
  }
}
