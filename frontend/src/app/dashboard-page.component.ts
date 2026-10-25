import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ApiService } from './services/api.service';
import { BarChartComponent } from './bar-chart.component';
import { CascadeComponent } from './cascade.component';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-dashboard-page',
  imports: [BarChartComponent, DecimalPipe, NgIcon, CascadeComponent],
  template: `
    <section class="dashboard">
      <div class="dashboard-header">
        <h2>Dashboard de Hacienda</h2>
        <div class="user-bar">
          <span class="role-badge">{{ isOperador() ? 'Operador' : 'Observador' }}</span>
          <button type="button" class="btn-logout" (click)="logout()">Salir</button>
        </div>
      </div>
      <div class="dashboard-header">
        <button type="button" (click)="load()" [disabled]="loading()" class="btn-primary">
          <ng-icon name="heroArrowPath" /> {{ loading() ? 'Cargando...' : 'Actualizar' }}
        </button>
      </div>
      @if (error()) { <p class="error">{{ error() }}</p> }
      @if (loading() && !data()) { <p class="loading">Cargando datos...</p> }
      @if (data()) {
        <div class="summary-cards">
          <div class="card">
            <span class="card-label">Filas</span>
            <span class="card-value">{{ data()!.rows }}</span>
          </div>
          <div class="card">
            <span class="card-label">Total</span>
            <span class="card-value">{{ data()!.total | number:'1.0-0' }}</span>
          </div>
        </div>
        <div class="charts-grid">
          @if (hasData(data()!.origenes)) { <div class="chart-card"><h3>Orígenes</h3><app-bar-chart [data]="data()!.origenes" /></div> }
          @if (hasData(data()!.ejes)) { <div class="chart-card"><h3>Ejes</h3><app-bar-chart [data]="data()!.ejes" /></div> }
          @if (hasData(data()!.secretarias)) { <div class="chart-card"><h3>Secretarías</h3><app-bar-chart [data]="data()!.secretarias" /></div> }
          @if (hasData(data()!.subsecretarias)) { <div class="chart-card"><h3>Subsecretarías</h3><app-bar-chart [data]="data()!.subsecretarias" /></div> }
          @if (hasData(data()!.direcciones)) { <div class="chart-card"><h3>Direcciones</h3><app-bar-chart [data]="data()!.direcciones" /></div> }
          @if (hasData(data()!.concurrentes)) { <div class="chart-card"><h3>Concurrentes</h3><app-bar-chart [data]="data()!.concurrentes" /></div> }
        </div>
        <app-cascade />
        @if (ampliaciones().length > 0) {
          <div class="chart-card">
            <h3>Ampliaciones de Presupuesto</h3>
            @for (a of ampliaciones(); track a.codigo) {
              <p>{{ a.codigo }} - {{ a.concepto }}: {{ a.valor | number:'1.2-2' }} ({{ a.tipo }})</p>
            }
          </div>
        }
      }

      @if (isOperador()) {
        <div class="admin-panel">
          <h3>Administración</h3>
          <div class="admin-section">
            <h4>Carga de Excel</h4>
            <input type="file" (change)="onFileSelected($event)" />
            @if (uploadStatus()) { <p>{{ uploadStatus() }}</p> }
          </div>
          <div class="admin-section">
            <h4>Cambio de clave</h4>
            <input [value]="newPassword()" (input)="newPassword.set($any($event.target).value)" placeholder="nueva clave" type="password" />
            <button type="button" (click)="changePassword()">Cambiar clave</button>
            @if (passwordStatus()) { <p>{{ passwordStatus() }}</p> }
          </div>
        </div>
      }
    </section>
  `,
  styles: [`
    .dashboard { padding: 0; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 16px 0; }
    .card { background: var(--color-surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px; text-align: center; }
    .card-label { display: block; font-size: 12px; color: var(--color-text-muted); text-transform: uppercase; }
    .card-value { display: block; font-size: 1.2rem; font-weight: 700; color: var(--color-primary); margin-top: 4px; word-break: break-all; overflow-wrap: anywhere; }
    .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-top: 16px; }
    .chart-card { background: var(--color-surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px; }
    .chart-card h3 { margin-top: 0; }
    .error { color: var(--color-error); }
    .loading { color: var(--color-text-muted); font-style: italic; }
    .user-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .role-badge { background: var(--color-primary); color: white; padding: 2px 10px; border-radius: 12px; font-size: 12px; }
    .btn-logout { background: var(--color-error); padding: 4px 12px; font-size: 12px; }
    .admin-panel { background: var(--color-bg); border-radius: var(--radius); padding: 12px; margin: 12px 0; border: 1px solid var(--color-border); }
    .cascada-section { margin-top: 16px; padding: 12px; background: var(--color-surface); border-radius: var(--radius); box-shadow: var(--shadow); }
    .cascada-input { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .cascada-input input { flex: 1; max-width: none; }
    .concepto-result { margin-top: 8px; padding: 8px; background: var(--color-bg); border-radius: var(--radius); }
    .admin-section { margin: 8px 0; display: flex; flex-direction: column; gap: 8px; }
    @media (max-width: 600px) {
      .dashboard-header { flex-direction: column; align-items: stretch; }
      .dashboard-header button { width: 100%; }
      .card { padding: 10px; }
      .card-value { font-size: 1rem; word-break: break-all; }
      .summary-cards { grid-template-columns: 1fr 1fr; gap: 8px; }
    }
    @media (max-width: 360px) {
      .summary-cards { grid-template-columns: 1fr; }
      .card-value { font-size: 0.9rem; }
    }
  `]
})
export class DashboardPageComponent implements OnInit {
  private api = inject(ApiService);
  loading = signal(false);
  error = signal('');
  uploadStatus = signal('');
  passwordStatus = signal('');
  newPassword = signal('nueva123');
  data = signal<{ rows: number; total: number; origenes: Record<string, number>; ejes: Record<string, number>; secretarias: Record<string, number>; subsecretarias: Record<string, number>; direcciones: Record<string, number>; concurrentes: Record<string, number> } | null>(null);
  ampliaciones = signal<Array<{ codigo: string; concepto: string; tipo: string; valor: number }>>([]);
  conceptoCode = signal('');
  conceptoResult = signal<any>(null);

  isOperador = computed(() => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try { return JSON.parse(atob(token.split('.')[1])).role === 'operador'; } catch { return false; }
  });

  ngOnInit() { this.load(); this.loadAmpliaciones(); }

  hasData(obj: Record<string, number>): boolean {
    return Object.keys(obj).length > 0;
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  loadAmpliaciones() {
    this.api.ampliaciones().subscribe({
      next: (res) => this.ampliaciones.set(res.ampliaciones),
      error: () => {}
    });
  }

  lookupConcepto() {
    const code = this.conceptoCode();
    if (!code) return;
    this.api.concepto(code).subscribe({
      next: (res) => this.conceptoResult.set(res),
      error: () => this.conceptoResult.set({ error: 'No encontrado' })
    });
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.api.completo().subscribe({
      next: (res) => {
        this.loading.set(false);
        this.data.set(res);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Error al cargar datos del dashboard');
      }
    });
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

  changePassword() {
    this.api.changePassword(this.newPassword()).subscribe({
      next: () => this.passwordStatus.set('ok'),
      error: () => this.passwordStatus.set('error')
    });
  }
}
