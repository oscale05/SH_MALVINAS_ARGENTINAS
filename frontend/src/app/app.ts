import { Component, inject, signal } from "@angular/core";
import { RouterOutlet, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgIcon],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private api = inject(ApiService);
  menuOpen = signal(false);
  showPasswordModal = signal(false);
  newPassword = signal('');
  confirmPassword = signal('');
  showPassword = signal(false);
  passwordStatus = signal('');

  get username(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      return JSON.parse(atob(token.split('.')[1])).sub || '';
    } catch {
      return '';
    }
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get isAdmin(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      return JSON.parse(atob(token.split('.')[1])).role === 'administrador';
    } catch {
      return false;
    }
  }

  toggleMenu() { this.menuOpen.update(v => !v); }
  closeMenu() { this.menuOpen.set(false); }
  logout() {
    localStorage.removeItem('token');
    this.menuOpen.set(false);
    window.location.href = '/login';
  }

  openPasswordModal() {
    this.menuOpen.set(false);
    this.showPasswordModal.set(true);
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.passwordStatus.set('');
    this.showPassword.set(false);
  }

  closePasswordModal() {
    this.showPasswordModal.set(false);
  }

  toggleShowPassword() {
    this.showPassword.update(v => !v);
  }

  changePassword() {
    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordStatus.set('Las claves no coinciden');
      return;
    }
    if (this.newPassword().length < 6) {
      this.passwordStatus.set('Mínimo 6 caracteres');
      return;
    }
    this.api.changePassword(this.newPassword()).subscribe({
      next: () => {
        this.passwordStatus.set('ok');
        setTimeout(() => this.closePasswordModal(), 1500);
      },
      error: () => this.passwordStatus.set('error')
    });
  }
}
