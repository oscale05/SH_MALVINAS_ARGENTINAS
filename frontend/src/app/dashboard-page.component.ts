import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from './services/api.service';
import { BarChartComponent } from './bar-chart.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [BarChartComponent],
  template: `
    <section>
      <h2>Dashboard</h2>
      <button type="button" (click)="load()" [disabled]="loading()">Cargar</button>
      @if (loading()) { <p>Cargando...</p> }
      @if (error()) { <p class="error">{{ error() }}</p> }
      @if (data()) {
        <p>Filas: {{ data()!.rows }} | Total: {{ data()!.total }}</p>
        @if (Object.keys(data()!.origenes).length) { <h3>Orígenes</h3> <app-bar-chart [data]="data()!.origenes" /> }
        @if (Object.keys(data()!.ejes).length) { <h3>Ejes</h3> <app-bar-chart [data]="data()!.ejes" /> }
        @if (Object.keys(data()!.secretarias).length) { <h3>Secretarías</h3> <app-bar-chart [data]="data()!.secretarias" /> }
        @if (Object.keys(data()!.subsecretarias).length) { <h3>Subsecretarías</h3> <app-bar-chart [data]="data()!.subsecretarias" /> }
        @if (Object.keys(data()!.direcciones).length) { <h3>Direcciones</h3> <app-bar-chart [data]="data()!.direcciones" /> }
        @if (Object.keys(data()!.concurrentes).length) { <h3>Concurrentes</h3> <app-bar-chart [data]="data()!.concurrentes" /> }
      }
    </section>
  `,
  styles: [`.error { color: red; }`]
})
export class DashboardPageComponent implements OnInit {
  private api = inject(ApiService);
  loading = signal(false);
  error = signal('');
  data = signal<{ rows: number; total: number; origenes: Record<string, number>; ejes: Record<string, number>; secretarias: Record<string, number>; subsecretarias: Record<string, number>; direcciones: Record<string, number>; concurrentes: Record<string, number> } | null>(null);
  Object = Object;

  ngOnInit() { this.load(); }

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
        this.error.set('Error al cargar datos');
      }
    });
  }
}
