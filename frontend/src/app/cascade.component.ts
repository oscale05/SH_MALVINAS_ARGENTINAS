import { Component, inject, signal } from '@angular/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-cascade',
  template: `
    <section class="cascade">
      <h2>Efecto Cascada</h2>
      <div class="cascade-level">
        <h3>Nivel 1: Origen</h3>
        <div class="cascade-items">
          @for (item of origenes(); track item.key) {
            <button type="button" class="cascade-btn" (click)="selectOrigen(item.key)">{{ item.key }}: {{ item.value }}</button>
          }
        </div>
      </div>
      @if (selectedOrigen()) {
        <div class="cascade-level">
          <h3>Nivel 2: Eje ({{ selectedOrigen() }})</h3>
          <div class="cascade-items">
            @for (item of ejes(); track item.key) {
              <button type="button" class="cascade-btn" (click)="selectEje(item.key)">{{ item.key }}: {{ item.value }}</button>
            }
          </div>
        </div>
      }
      @if (selectedEje()) {
        <div class="cascade-level">
          <h3>Nivel 3: Secretaría ({{ selectedEje() }})</h3>
          <div class="cascade-items">
            @for (item of secretarias(); track item.key) {
              <button type="button" class="cascade-btn" (click)="selectSecretaria(item.key)">{{ item.key }}: {{ item.value }}</button>
            }
            @if (secretarias().length === 0) { <p class="no-data">Sin datos de secretaría</p> }
          </div>
        </div>
      }
      @if (selectedSecretaria()) {
        <div class="cascade-level">
          <h3>Nivel 4: Subsecretaría ({{ selectedSecretaria() }})</h3>
          <div class="cascade-items">
            @for (item of subsecretarias(); track item.key) {
              <button type="button" class="cascade-btn" (click)="selectSubsecretaria(item.key)">{{ item.key }}: {{ item.value }}</button>
            }
            @if (subsecretarias().length === 0) { <p class="no-data">Sin datos de subsecretaría</p> }
          </div>
        </div>
      }
      @if (selectedSubsecretaria()) {
        <div class="cascade-level">
          <h3>Nivel 5: Dirección ({{ selectedSubsecretaria() }})</h3>
          <div class="cascade-items">
            @for (item of direcciones(); track item.key) {
              <button type="button" class="cascade-btn" (click)="selectDireccion(item.key)">{{ item.key }}: {{ item.value }}</button>
            }
            @if (direcciones().length === 0) { <p class="no-data">Sin datos de dirección</p> }
          </div>
        </div>
      }
      @if (selectedDireccion()) {
        <div class="cascade-level">
          <h3>Nivel 6: Concepto ({{ selectedDireccion() }})</h3>
          <div class="cascade-items">
            @for (item of conceptos(); track item.key) {
              <button type="button" class="cascade-btn concepto" (click)="selectConcepto(item.key)">{{ item.key }}: {{ item.value }}</button>
            }
            @if (conceptos().length === 0) { <p class="no-data">Sin datos de concepto</p> }
          </div>
        </div>
      }
      @if (selectedConcepto()) {
        <div class="cascade-detail">
          <h3>Detalle: {{ selectedConcepto() }}</h3>
          <p>Seleccionado: {{ selectedConcepto() }}</p>
        </div>
      }
    </section>
  `,
  styles: [`
    .cascade { padding: 0; }
    .cascade-level { margin: 12px 0; padding: 12px; background: var(--color-surface); border-radius: var(--radius); box-shadow: var(--shadow); }
    .cascade-items { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .cascade-btn { background: var(--color-primary); color: white; border: none; padding: 6px 12px; border-radius: var(--radius); cursor: pointer; font-size: 13px; }
    .cascade-btn:hover { background: var(--color-primary-dark); }
    .cascade-btn.concepto { background: var(--color-secondary); }
    .cascade-detail { margin-top: 12px; padding: 12px; background: var(--color-bg); border-radius: var(--radius); }
    .no-data { color: var(--color-text-muted); font-style: italic; font-size: 13px; }
  `]
})
export class CascadeComponent {
  private api = inject(ApiService);
  origenes = signal<{ key: string; value: number }[]>([]);
  ejes = signal<{ key: string; value: number }[]>([]);
  secretarias = signal<{ key: string; value: number }[]>([]);
  subsecretarias = signal<{ key: string; value: number }[]>([]);
  direcciones = signal<{ key: string; value: number }[]>([]);
  conceptos = signal<{ key: string; value: number }[]>([]);

  selectedOrigen = signal<string | null>(null);
  selectedEje = signal<string | null>(null);
  selectedSecretaria = signal<string | null>(null);
  selectedSubsecretaria = signal<string | null>(null);
  selectedDireccion = signal<string | null>(null);
  selectedConcepto = signal<string | null>(null);

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
    // For conceptos, we'd need a specific endpoint; for now show the concepto lookup
    this.conceptos.set([]);
  }

  selectConcepto(key: string) {
    this.selectedConcepto.set(key);
  }
}
