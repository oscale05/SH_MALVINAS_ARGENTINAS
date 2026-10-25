import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ApiService } from './services/api.service';
import { BarChartComponent } from './bar-chart.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [BarChartComponent, DecimalPipe],
  template: `
    <section>
      <h2>Dashboard</h2>
      <button type="button" (click)="load()" [disabled]="loading()">Cargar datos</button>
      @if (loading()) { <p class="loading">Cargando...</p> }
      @if (error()) { <p class="error">{{ error() }}</p> }
      @if (data()) {
        <div class="summary">
          <p><strong>Filas:</strong> {{ data()!.rows }} | <strong>Total:</strong> {{ data()!.total | number:'1.2-2' }}</p>
        </div>
        @if (hasData(data()!.origenes)) { <h3>Orígenes</h3> <app-bar-chart [data]="data()!.origenes" /> }
        @if (hasData(data()!.ejes)) { <h3>Ejes</h3> <app-bar-chart [data]="data()!.ejes" /> }
        @if (hasData(data()!.secretarias)) { <h3>Secretarías</h3> <app-bar-chart [data]="data()!.secretarias" /> }
        @if (hasData(data()!.subsecretarias)) { <h3>Subsecretarías</h3> <app-bar-chart [data]="data()!.subsecretarias" /> }
        @if (hasData(data()!.direcciones)) { <h3>Direcciones</h3> <app-bar-chart [data]="data()!.direcciones" /> }
        @if (hasData(data()!.concurrentes)) { <h3>Concurrentes</h3> <app-bar-chart [data]="data()!.concurrentes" /> }
      }
    </section>
  `,
  styles: [`.loading { color: #666; } .error { color: red; } .summary { margin: 8px 0; }`]
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
