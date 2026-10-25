import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-connection-banner',
  template: `
    @if (!online()) {
      <div class="offline-banner">Sin conexión - mostrando datos cacheados</div>
    }
  `,
  styles: [`
    .offline-banner {
      background: #fef3c7;
      color: #92400e;
      padding: 8px 16px;
      text-align: center;
      font-size: 14px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }
  `]
})
export class ConnectionBannerComponent implements OnInit {
  online = signal(navigator.onLine);

  ngOnInit() {
    window.addEventListener('online', () => this.online.set(true));
    window.addEventListener('offline', () => this.online.set(false));
  }
}
