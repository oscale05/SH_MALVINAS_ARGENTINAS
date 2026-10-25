import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterOutlet],
  template: `
    <nav>
      <a routerLink="/">Dashboard</a>
      <a routerLink="/login">Login</a>
    </nav>
    <main>
      <router-outlet />
    </main>
  `
})
export class LayoutComponent {}
