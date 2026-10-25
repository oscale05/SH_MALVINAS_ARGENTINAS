import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgIcon],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  menuOpen = signal(false);

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

  toggleMenu() { this.menuOpen.update(v => !v); }
  closeMenu() { this.menuOpen.set(false); }
  logout() {
    localStorage.removeItem('token');
    this.menuOpen.set(false);
    window.location.href = '/login';
  }
}

