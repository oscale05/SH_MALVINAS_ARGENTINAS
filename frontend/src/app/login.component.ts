import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-login',
  template: `
    <section>
      <h2>Login</h2>
      <input [value]="username()" (input)="username.set($any($event.target).value)" placeholder="usuario" />
      <input [value]="password()" (input)="password.set($any($event.target).value)" placeholder="clave" type="password" />
      <button type="button" (click)="login()">Entrar</button>
      <p>{{ status() }}</p>
    </section>
  `
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
