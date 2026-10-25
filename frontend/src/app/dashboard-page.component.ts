import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ApiService } from './services/api.service';
import { BarChartComponent } from './bar-chart.component';
import { AutocompleteComponent } from './autocomplete.component';
import { CascadeComponent } from './cascade.component';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-dashboard-page',
  imports: [BarChartComponent, DecimalPipe, NgIcon, CascadeComponent, AutocompleteComponent],
  template: `
    <section class="dashboard">
      <div class="dashboard-header">
        <h2>Dashboard de Hacienda</h2>
      </div>
      <div class="dashboard-header">
        <input type="date" [value]="selectedDate()" (change)="onDateChange($event)" class="date-filter" />
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
          @if (hasData(data()!.origenes)) { <div class="chart-card clickable" (click)="openDetail('Orígenes', data()!.origenes)"><h3>Orígenes</h3><app-bar-chart [data]="data()!.origenes" /></div> }
          @if (hasData(data()!.ejes)) { <div class="chart-card clickable" (click)="openDetail('Ejes', data()!.ejes)"><h3>Ejes</h3><app-bar-chart [data]="data()!.ejes" /></div> }
          @if (hasData(data()!.secretarias)) { <div class="chart-card clickable" (click)="openDetail('Secretarías', data()!.secretarias)"><h3>Secretarías</h3><app-bar-chart [data]="data()!.secretarias" /></div> }
          @if (hasData(data()!.subsecretarias)) { <div class="chart-card clickable" (click)="openDetail('Subsecretarías', data()!.subsecretarias)"><h3>Subsecretarías</h3><app-bar-chart [data]="data()!.subsecretarias" /></div> }
          @if (hasData(data()!.direcciones)) { <div class="chart-card clickable" (click)="openDetail('Direcciones', data()!.direcciones)"><h3>Direcciones</h3><app-bar-chart [data]="data()!.direcciones" /></div> }
          @if (hasData(data()!.concurrentes)) { <div class="chart-card clickable" (click)="openDetail('Concurrentes', data()!.concurrentes)"><h3>Concurrentes</h3><app-bar-chart [data]="data()!.concurrentes" /></div> }
        </div>
        @if (selectedDetail()) {
          <div class="detail-modal" (click)="closeDetail()">
            <div class="detail-content" (click)="$event.stopPropagation()">
              <h3>{{ selectedDetail()!.title }}</h3>
              <table class="detail-table">
                <thead><tr><th>Concepto</th><th>Total</th></tr></thead>
                <tbody>
                  @for (item of detailEntries(); track item.key) {
                    <tr><td>{{ item.key }}</td><td>{{ item.value | number:'1.2-2' }}</td></tr>
                  }
                </tbody>
                <tfoot><tr><td><strong>Total</strong></td><td><strong>{{ detailTotal() | number:'1.2-2' }}</strong></td></tr></tfoot>
              </table>
              <button type="button" (click)="closeDetail()">Cerrar</button>
            </div>
          </div>
        }
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

      @if (isAdministrador()) {
        <div class="admin-panel">
          <h3>Administración</h3>
          <div class="admin-section">
            <h4>Carga de Excel</h4>
            <input type="file" (change)="onFileSelected($event)" />
            @if (uploadStatus()) { <p>{{ uploadStatus() }}</p> }
          </div>
          <div class="admin-section">
            <h4>Alta de Tasa</h4>
            <input [value]="newCodigo()" (input)="newCodigo.set($any($event.target).value)" placeholder="Código" />
            <input [value]="newImputacion()" (input)="newImputacion.set($any($event.target).value)" placeholder="Imputación" />
            <input [value]="newTotal()" (input)="newTotal.set($any($event.target).value)" placeholder="Total" type="number" />
            <button type="button" (click)="createTasa()">Crear Tasa</button>
            @if (crudStatus()) { <p>{{ crudStatus() }}</p> }
          </div>
          <div class="admin-section">
            <h4>Baja de Tasa</h4>
            <app-autocomplete [items]="conceptCodes()" (selected)="deleteCodigo.set($event)" />
            @if (deleteCodigo()) { <p class="selected-code">Seleccionado: {{ deleteCodigo() }}</p> }
            <button type="button" (click)="deleteTasa()" class="btn-danger">Eliminar Tasa</button>
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
    .chart-card { background: var(--color-surface); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
    .chart-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .chart-card h3 { margin-top: 0; }
    .detail-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
    .detail-content { background: white; border-radius: var(--radius); padding: 24px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; }
    .detail-table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    .detail-table th, .detail-table td { padding: 8px; border-bottom: 1px solid var(--color-border); text-align: left; }
    .detail-table th { font-weight: 600; color: var(--color-primary); }
    .detail-content button { margin-top: 12px; }
    .error { color: var(--color-error); }
    .loading { color: var(--color-text-muted); font-style: italic; }
    .user-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    .role-badge { background: var(--color-primary); color: white; padding: 2px 10px; border-radius: 12px; font-size: 12px; }
    .btn-logout { background: var(--color-error); padding: 4px 12px; font-size: 12px; }
    .btn-danger { background: var(--color-error); }
    .admin-panel { background: var(--color-bg); border-radius: var(--radius); padding: 12px; margin: 12px 0; border: 1px solid var(--color-border); }
    .cascada-section { margin-top: 16px; padding: 12px; background: var(--color-surface); border-radius: var(--radius); box-shadow: var(--shadow); }
    .cascada-input { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .cascada-input input { flex: 1; max-width: none; }
    .concepto-result { margin-top: 8px; padding: 8px; background: var(--color-bg); border-radius: var(--radius); }
    .admin-section { margin: 8px 0; display: flex; flex-direction: column; gap: 8px; }
    .select-full { width: 100%; max-width: 100%; padding: 8px; border: 1px solid var(--color-border); border-radius: var(--radius); }
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
  crudStatus = signal('');
  newCodigo = signal('');
  newImputacion = signal('');
  newTotal = signal('');
  deleteCodigo = signal('');
  conceptCodes = signal<Array<{ codigo: string; imputacion: string }>>([]);
  data = signal<{ rows: number; total: number; origenes: Record<string, number>; ejes: Record<string, number>; secretarias: Record<string, number>; subsecretarias: Record<string, number>; direcciones: Record<string, number>; concurrentes: Record<string, number> } | null>(null);
  selectedDetail = signal<{ title: string; data: Record<string, number> } | null>(null);
  ampliaciones = signal<Array<{ codigo: string; concepto: string; tipo: string; valor: number }>>([]);
  conceptoCode = signal('');
  selectedDate = signal<string>(new Date().toISOString().split('T')[0]);
  uploadId = signal<number | undefined>(undefined);
  conceptoResult = signal<any>(null);

  isAdministrador = computed(() => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try { return JSON.parse(atob(token.split('.')[1])).role === 'administrador'; } catch { return false; }
  });

  ngOnInit() { this.load(); this.loadAmpliaciones(); this.loadConceptCodes(); }

  hasData(obj: Record<string, number>): boolean {
    return Object.keys(obj).length > 0;
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

  createTasa() {
    this.api.createTasa({ codigo: this.newCodigo(), imputacion: this.newImputacion(), total: +this.newTotal() }).subscribe({
      next: () => { this.crudStatus.set('Tasa creada'); this.load(); },
      error: () => this.crudStatus.set('Error al crear')
    });
  }

  deleteTasa() {
    const codigo = this.deleteCodigo();
    if (!codigo) return;
    if (!confirm(`¿Está seguro de eliminar la tasa ${codigo}?`)) return;
    this.api.deleteTasa(codigo).subscribe({
      next: () => { this.crudStatus.set('Tasa eliminada'); this.load(); this.loadConceptCodes(); },
      error: () => this.crudStatus.set('Error al eliminar')
    });
  }

  openDetail(title: string, data: Record<string, number>) {
    this.selectedDetail.set({ title, data });
  }

  closeDetail() {
    this.selectedDetail.set(null);
  }

  detailEntries(): { key: string; value: number }[] {
    const d = this.selectedDetail();
    if (!d) return [];
    return Object.entries(d.data).map(([key, value]) => ({ key, value })).sort((a, b) => b.value - a.value);
  }

  detailTotal(): number {
    const d = this.selectedDetail();
    if (!d) return 0;
    return Object.values(d.data).reduce((sum, v) => sum + v, 0);
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedDate.set(input.value);
    this.load();
  }

  loadConceptCodes() {
    this.api.conceptos().subscribe({
      next: (res) => this.conceptCodes.set(res.items.map((i: any) => ({ codigo: i.codigo, imputacion: i.imputacion }))),
      error: () => {}
    });
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    const d = new Date(this.selectedDate());
    const mes = d.getMonth() + 1;
    const anio = d.getFullYear();
    this.api.macro(undefined, mes, anio).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.data.set({ rows: res.rows, total: res.total, origenes: res.totals_by_origin, ejes: {}, secretarias: {}, subsecretarias: {}, direcciones: {}, concurrentes: {} });
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Error al cargar datos del dashboard');
      }
    });
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

}
