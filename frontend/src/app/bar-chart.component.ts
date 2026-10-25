import { Component, Input, OnChanges, signal, computed } from '@angular/core';

@Component({
  selector: 'app-bar-chart',
  template: `
    <div class="chart-wrapper">
      @if (items.length === 0) {
        <p class="no-data">Sin datos</p>
      } @else {
        <svg [attr.viewBox]="'0 0 ' + width + ' ' + height" preserveAspectRatio="xMidYMid meet" class="chart-svg">
          @for (item of items; track item.label; let i = $index) {
            <g>
              <rect
                [attr.x]="i * barWidth + 4"
                [attr.y]="height - item.barH - 4"
                [attr.width]="barWidth - 8"
                [attr.height]="item.barH"
                [attr.fill]="colors[i % colors.length]"
                rx="4"
                class="bar"
                (mouseenter)="hovered.set(i)"
                (mouseleave)="hovered.set(-1)"
                (click)="selected.set(selected() === i ? -1 : i)"
              />
            </g>
          }
        </svg>
        @if (activeIndex() >= 0) {
          <div class="tooltip">
            <strong>{{ items[activeIndex()].label }}</strong>
            <span>{{ formatValue(items[activeIndex()].value) }}</span>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .chart-wrapper { width: 100%; max-width: 100%; position: relative; min-height: 120px; }
    .chart-svg { width: 100%; height: auto; min-height: 100px; max-width: 100%; display: block; }
    .bar { cursor: pointer; transition: opacity 0.15s; }
    .bar:hover { opacity: 0.75; }
    .no-data { color: #6b7280; font-style: italic; font-size: 14px; padding: 16px; }
    .tooltip {
      position: absolute; top: 4px; right: 4px;
      background: rgba(51, 65, 85, 0.95); color: white;
      padding: 6px 14px; border-radius: 6px; font-size: 12px;
      display: flex; flex-direction: column; gap: 2px; align-items: flex-end;
      pointer-events: none; z-index: 10; white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .tooltip strong { font-size: 13px; }
    @media (max-width: 480px) {
      .chart-svg { min-height: 80px; }
    }
  `]
})
export class BarChartComponent {
  @Input() data: Record<string, number> = {};
  width = 400;
  height = 160;
  colors = ['#324687', '#55a53c', '#4a5fa0', '#468a31', '#808cb3', '#373c5f'];

  hovered = signal(-1);
  selected = signal(-1);

  items: { label: string; value: number; barH: number }[] = [];

  activeIndex = computed(() => this.selected() >= 0 ? this.selected() : this.hovered());

  ngOnChanges() {
    this.computeItems();
    this.hovered.set(-1);
    this.selected.set(-1);
  }

  private computeItems() {
    const entries = Object.entries(this.data);
    if (entries.length === 0) { this.items = []; return; }
    const max = Math.max(...entries.map(([, v]) => v), 1);
    this.width = Math.max(300, entries.length * 70);
    this.items = entries.map(([label, value]) => ({
      label,
      value,
      barH: Math.max(4, (value / max) * (this.height - 50))
    }));
  }

  get barWidth() {
    return this.width / Math.max(this.items.length, 1);
  }

  formatValue(v: number): string {
    if (v >= 1e12) return (v / 1e12).toFixed(1).replace('.', ',') + ' T';
    if (v >= 1e9) return (v / 1e9).toFixed(1).replace('.', ',') + ' B';
    if (v >= 1e6) return (v / 1e6).toFixed(1).replace('.', ',') + ' M';
    if (v >= 1e3) return (v / 1e3).toFixed(1).replace('.', ',') + ' K';
    return v.toLocaleString('es-AR', { maximumFractionDigits: 0 });
  }
}
