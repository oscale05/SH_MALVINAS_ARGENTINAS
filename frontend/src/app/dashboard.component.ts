import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from './services/api.service';
import { BarChartComponent } from './bar-chart.component';

@Component({
  selector: 'app-dashboard',
  imports: [BarChartComponent],
  template: `
    <section>
      <h2>Dashboard</h2>
      <button type="button" (click)="load()">Cargar</button>
      <p>{{ status() }}</p>
      @if (data()) {
        <p>Filas: {{ data()!.rows }} | Total: {{ data()!.total }}</p>
        <app-bar-chart [data]="data()!.origenes" />
        <app-bar-chart [data]="data()!.ejes" />
        <app-bar-chart [data]="data()!.secretarias" />
        <app-bar-chart [data]="data()!.subsecretarias" />
        <app-bar-chart [data]="data()!.direcciones" />
      }
    </section>
  `
})
export class DashboardComponent implements OnInit {
  ngOnInit() { this.load(); }
  private api = inject(ApiService);
  status = signal('sin datos');
  data = signal<{ rows: number; total: number; origenes: Record<string, number>; ejes: Record<string, number>; secretarias: Record<string, number>; subsecretarias: Record<string, number>; direcciones: Record<string, number> } | null>(null);

  load() {
    this.status.set('cargando...');
    this.api.completo().subscribe({
      next: (res) => {
        this.status.set('ok');
        this.data.set(res);
      },
      error: () => this.status.set('error')
    });
  }
}
