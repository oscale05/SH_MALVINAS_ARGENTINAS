import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ApiService } from './services/api.service';
import { BarChartComponent } from './bar-chart.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [BarChartComponent, DecimalPipe],
  template: `
    <section class="dashboard">
      <div class="dashboard-header">
        <h2>Dashboard de Hacienda</h2>
        <button type="button" (click)="load()" [disabled]="loading()" class="btn-primary">
          {{ loading() ? 'Cargando...' : 'Actualizar' }}
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
      }
    </section>
  `,
  styles: [`
    .dashboard { padding: 0; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 16px 0; }
    .card { background: var(--color-surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px; text-align: center; }
    .card-label { display: block; font-size: 12px; color: var(--color-text-muted); text-transform: uppercase; }
    .card-value { display: block; font-size: 1.5rem; font-weight: 700; color: var(--color-primary); margin-top: 4px; }
    .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-top: 16px; }
    .chart-card { background: var(--color-surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px; }
    .chart-card h3 { margin-top: 0; }
    .error { color: var(--color-error); }
    .loading { color: var(--color-text-muted); font-style: italic; }
    @media (max-width: 600px) {
      .dashboard-header { flex-direction: column; align-items: stretch; }
      .dashboard-header button { width: 100%; }
    }
  `]
})
export class DashboardPageComponent implements OnInit {
  private api = inject(ApiService);
  loading = signal(false);
  error = signal('');
  data = signal<{ rows: number; total: number; origenes: Record<string, number>; ejes: Record<string, number>; secretarias: Record<string, number>; subsecretarias: Record<string, number>; direcciones: Record<string, number>; concurrentes: Record<string, number> } | null>(null);

  ngOnInit() { this.load(); }

  hasData(obj: Record<string, number>): boolean {
    return Object.keys(obj).length > 0;
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
}
