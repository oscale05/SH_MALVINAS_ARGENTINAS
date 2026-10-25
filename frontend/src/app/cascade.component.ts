import { Component, inject, signal } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-cascade',
  imports: [DecimalPipe],
  template: `
    <section class="cascade">
      <h3>Efecto Cascada (Macro → Micro)</h3>
      <div class="cascade-level">
        <span class="level-label">Nivel 1: Origen</span>
        <div class="cascade-items">
          @for (item of origenes(); track item.key) {
            <button type="button" class="cascade-btn" [class.active]="selectedOrigen() === item.key" (click)="selectOrigen(item.key)">{{ item.key }}: {{ item.value | number:'1.0-0' }}</button>
          }
          @if (origenes().length === 0) { <p class="no-data">Sin datos</p> }
        </div>
      </div>
      @if (selectedOrigen()) {
        <div class="cascade-level">
          <span class="level-label">Nivel 2: Eje</span>
          <div class="cascade-items">
            @for (item of ejes(); track item.key) {
              <button type="button" class="cascade-btn" [class.active]="selectedEje() === item.key" (click)="selectEje(item.key)">{{ item.key }}: {{ item.value | number:'1.0-0' }}</button>
            }
            @if (ejes().length === 0) { <p class="no-data">Sin datos</p> }
          </div>
        </div>
      }
      @if (selectedEje()) {
        <div class="cascade-level">
          <span class="level-label">Nivel 3: Secretaría</span>
          <div class="cascade-items">
            @for (item of secretarias(); track item.key) {
              <button type="button" class="cascade-btn" [class.active]="selectedSecretaria() === item.key" (click)="selectSecretaria(item.key)">{{ item.key }}: {{ item.value | number:'1.0-0' }}</button>
            }
            @if (secretarias().length === 0) { <p class="no-data">Sin datos</p> }
          </div>
        </div>
      }
      @if (selectedSecretaria()) {
        <div class="cascade-level">
          <span class="level-label">Nivel 4: Subsecretaría</span>
          <div class="cascade-items">
            @for (item of subsecretarias(); track item.key) {
              <button type="button" class="cascade-btn" [class.active]="selectedSubsecretaria() === item.key" (click)="selectSubsecretaria(item.key)">{{ item.key }}: {{ item.value | number:'1.0-0' }}</button>
            }
            @if (subsecretarias().length === 0) { <p class="no-data">Sin datos</p> }
          </div>
        </div>
      }
      @if (selectedSubsecretaria()) {
        <div class="cascade-level">
          <span class="level-label">Nivel 5: Dirección</span>
          <div class="cascade-items">
            @for (item of direcciones(); track item.key) {
              <button type="button" class="cascade-btn" [class.active]="selectedDireccion() === item.key" (click)="selectDireccion(item.key)">{{ item.key }}: {{ item.value | number:'1.0-0' }}</button>
            }
            @if (direcciones().length === 0) { <p class="no-data">Sin datos</p> }
          </div>
        </div>
      }
      @if (selectedDireccion()) {
        <div class="cascade-level">
          <span class="level-label">Nivel 6: Concepto</span>
          <div class="cascade-input">
            <input [value]="conceptoCode()" (input)="conceptoCode.set($any($event.target).value)" placeholder="Código (ej: 1.1.4.01)" />
            <button type="button" class="cascade-btn" (click)="lookupConcepto()">Buscar</button>
          </div>
          @if (conceptoResult()) {
            <div class="concepto-result">
              <p><strong>{{ conceptoResult().codigo }}</strong> - {{ conceptoResult().imputacion }}</p>
              <p>Presupuesto: {{ conceptoResult().presupuesto }} | Total: {{ conceptoResult().total }}</p>
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .cascade { padding: 12px; background: var(--color-surface); border-radius: var(--radius); box-shadow: var(--shadow); margin-top: 16px; }
    .cascade-level { margin: 8px 0; }
    .level-label { font-weight: 600; color: var(--color-primary); font-size: 14px; }
    .cascade-items { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
    .cascade-btn { background: var(--color-primary); color: white; border: none; padding: 6px 12px; border-radius: var(--radius); cursor: pointer; font-size: 12px; transition: all 0.2s; }
    .cascade-btn:hover { background: var(--color-primary-dark); }
    .cascade-btn.active { background: var(--color-secondary); }
    .cascade-input { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-top: 8px; }
    .cascade-input input { flex: 1; max-width: none; min-width: 150px; }
    .concepto-result { margin-top: 8px; padding: 8px; background: var(--color-bg); border-radius: var(--radius); }
    .no-data { color: var(--color-text-muted); font-style: italic; font-size: 13px; margin: 4px 0; }
  `]
})
export class CascadeComponent {
  private api = inject(ApiService);
  origenes = signal<{ key: string; value: number }[]>([]);
  ejes = signal<{ key: string; value: number }[]>([]);
  secretarias = signal<{ key: string; value: number }[]>([]);
  subsecretarias = signal<{ key: string; value: number }[]>([]);
  direcciones = signal<{ key: string; value: number }[]>([]);

  selectedOrigen = signal<string | null>(null);
  selectedEje = signal<string | null>(null);
  selectedSecretaria = signal<string | null>(null);
  selectedSubsecretaria = signal<string | null>(null);
  selectedDireccion = signal<string | null>(null);
  selectedConcepto = signal<string | null>(null);
  conceptoCode = signal('');
  conceptoResult = signal<any>(null);

  constructor() {
    this.api.macro().subscribe({
      next: (res) => {
        this.origenes.set(Object.entries(res.totals_by_origin).map(([k, v]) => ({ key: k, value: v })));
      },
      error: () => {}
    });
  }

  selectOrigen(key: string) {
    this.selectedOrigen.set(key);
    this.selectedEje.set(null);
    this.selectedSecretaria.set(null);
    this.selectedSubsecretaria.set(null);
    this.selectedDireccion.set(null);
    this.selectedConcepto.set(null);
    this.ejes.set([]);
    this.secretarias.set([]);
    this.subsecretarias.set([]);
    this.direcciones.set([]);
    this.api.eje().subscribe({
      next: (res) => {
        this.ejes.set(Object.entries(res.totals_by_eje).map(([k, v]) => ({ key: k, value: v })));
      },
      error: () => {}
    });
  }

  selectEje(key: string) {
    this.selectedEje.set(key);
    this.selectedSecretaria.set(null);
    this.selectedSubsecretaria.set(null);
    this.selectedDireccion.set(null);
    this.selectedConcepto.set(null);
    this.secretarias.set([]);
    this.subsecretarias.set([]);
    this.direcciones.set([]);
    this.api.secretaria().subscribe({
      next: (res) => {
        this.secretarias.set(Object.entries(res.totals_by_secretaria).map(([k, v]) => ({ key: k, value: v })));
      },
      error: () => {}
    });
  }

  selectSecretaria(key: string) {
    this.selectedSecretaria.set(key);
    this.selectedSubsecretaria.set(null);
    this.selectedDireccion.set(null);
    this.selectedConcepto.set(null);
    this.subsecretarias.set([]);
    this.direcciones.set([]);
    this.api.subsecretaria().subscribe({
      next: (res) => {
        this.subsecretarias.set(Object.entries(res.totals_by_subsecretaria).map(([k, v]) => ({ key: k, value: v })));
      },
      error: () => {}
    });
  }

  selectSubsecretaria(key: string) {
    this.selectedSubsecretaria.set(key);
    this.selectedDireccion.set(null);
    this.selectedConcepto.set(null);
    this.direcciones.set([]);
    this.api.direccion().subscribe({
      next: (res) => {
        this.direcciones.set(Object.entries(res.totals_by_direccion).map(([k, v]) => ({ key: k, value: v })));
      },
      error: () => {}
    });
  }

  selectDireccion(key: string) {
    this.selectedDireccion.set(key);
    this.selectedConcepto.set(null);
  }

  lookupConcepto() {
    const code = this.conceptoCode();
    if (!code) return;
    this.api.concepto(code).subscribe({
      next: (res) => this.conceptoResult.set(res),
      error: () => this.conceptoResult.set({ error: 'No encontrado' })
    });
  }
}
