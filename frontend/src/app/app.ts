import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConnectionBannerComponent } from './connection-banner.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConnectionBannerComponent],
  template: `<app-connection-banner /><router-outlet />`
})
export class App {}
