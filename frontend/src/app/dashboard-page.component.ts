import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ApiService } from './services/api.service';
import { BarChartComponent } from './bar-chart.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [BarChartComponent],
  template: `
    <section>
      <h2>Dashboard</h2>
      <button type="button" (click)="checkHealth()">Verificar backend</button>
      <p>{{ status() }}</p>

      @if (isOperador()) {
        <input [value]="username()" (input)="username.set($any($event.target).value)" placeholder="usuario" />
        <input [value]="password()" (input)="password.set($any($event.target).value)" placeholder="clave" type="password" />
        <button type="button" (click)="login()">Login</button>
        <button type="button" (click)="logout()">Logout</button>
        <p>{{ loginStatus() }}</p>
        <input type="file" (change)="onFileSelected($event)" />
        <p>{{ uploadStatus() }}</p>
        <input [value]="newPassword()" (input)="newPassword.set($any($event.target).value)" placeholder="nueva clave" type="password" />
        <button type="button" (click)="changePassword()">Cambiar clave</button>
        <p>{{ passwordStatus() }}</p>
      }

      <input [value]="uploadId() ?? ''" (input)="uploadId.set($any($event.target).value ? +$any($event.target).value : undefined)" placeholder="upload_id (opcional)" />
      <button type="button" (click)="loadMacro()">Cargar macro</button>
      <p>{{ macroStatus() }}</p>
      <app-bar-chart [data]="macroData()" />

      <button type="button" (click)="loadCompleto()">Cargar completo</button>
      <p>{{ completoStatus() }}</p>

      <button type="button" (click)="loadSummary()">Cargar summary</button>
      <p>{{ summaryStatus() }}</p>

      <button type="button" (click)="loadHealth()">Health full</button>
      <p>{{ healthStatus() }}</p>

      <a [href]="api.exportCsvUrl(uploadId())" target="_blank">Exportar CSV</a>
    </section>
  `
})
export class DashboardPageComponent implements OnInit {
  api = inject(ApiService);
  status = signal('sin consultar');
  uploadStatus = signal('sin cargar');
  macroStatus = signal('sin datos');
  macroData = signal<Record<string, number>>({});
  completoStatus = signal('sin datos');
  summaryStatus = signal('sin datos');
  healthStatus = signal('sin datos');
  loginStatus = signal('sin login');
  username = signal('operador');
  password = signal('operador123');
  uploadId = signal<number | undefined>(undefined);
  newPassword = signal('nueva123');
  passwordStatus = signal('sin cambiar');

  isOperador = computed(() => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'operador';
    } catch {
      return false;
    }
  });

  ngOnInit() { this.loadCompleto(); }

  checkHealth() {
    this.api.health().subscribe({
      next: (res) => this.status.set(res.status + ' / ' + res.env),
      error: () => this.status.set('error')
    });
  }

  login() {
    this.api.login(this.username(), this.password()).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.loginStatus.set('ok');
      },
      error: () => this.loginStatus.set('error')
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.loginStatus.set('logout');
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadStatus.set('cargando...');
    this.api.upload(file).subscribe({
      next: (res) => this.uploadStatus.set(`ok: ${res.rows} filas`),
      error: () => this.uploadStatus.set('error')
    });
  }

  loadMacro() {
    this.api.macro(this.uploadId()).subscribe({
      next: (res) => {
        this.macroStatus.set(JSON.stringify(res.totals_by_origin));
        this.macroData.set(res.totals_by_origin);
      },
      error: () => this.macroStatus.set('error')
    });
  }

  loadCompleto() {
    this.api.completo().subscribe({
      next: (res) => this.completoStatus.set(`${res.rows} filas / ${res.total}`),
      error: () => this.completoStatus.set('error')
    });
  }

  loadSummary() {
    this.api.summary().subscribe({
      next: (res) => this.summaryStatus.set(`${res.uploads} uploads / ${res.users} users / ${res.ingresos} ingresos`),
      error: () => this.summaryStatus.set('error')
    });
  }

  loadHealth() {
    this.api.healthFull().subscribe({
      next: (res) => this.healthStatus.set(JSON.stringify(res.checks)),
      error: () => this.healthStatus.set('error')
    });
  }

  changePassword() {
    this.api.changePassword(this.newPassword()).subscribe({
      next: () => this.passwordStatus.set('ok'),
      error: () => this.passwordStatus.set('error')
    });
  }
}
