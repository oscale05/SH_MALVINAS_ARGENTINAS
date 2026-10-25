import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-bar-chart',
  template: `
    <div class="chart-wrapper">
      @if (items.length === 0) {
        <p class="no-data">Sin datos</p>
      } @else {
        <div class="pie-container">
          <svg [attr.viewBox]="'0 0 ' + size + ' ' + size" class="pie-svg">
            @for (item of items; track item.label; let i = $index) {
              <path
                [attr.d]="item.path"
                [attr.fill]="colors[i % colors.length]"
                class="pie-slice"
                (mouseenter)="hovered = i"
                (mouseleave)="hovered = -1"
                (click)="selected = selected === i ? -1 : i"
              />
            }
            <!-- Center text -->
            <text [attr.x]="size/2" [attr.y]="size/2 - 6" text-anchor="middle" font-size="12" fill="#374151" font-weight="600">{{ totalLabel }}</text>
            <text [attr.x]="size/2" [attr.y]="size/2 + 10" text-anchor="middle" font-size="10" fill="#6b7280">{{ totalValue }}</text>
          </svg>
          @if (activeIndex >= 0) {
            <div class="pie-tooltip">
              <strong>{{ items[activeIndex].label }}</strong>
              <span>{{ formatValue(items[activeIndex].value) }} ({{ items[activeIndex].percent }}%)</span>
            </div>
          }
        </div>
        <div class="pie-legend">
          @for (item of items; track item.label; let i = $index) {
            <div class="legend-item" (mouseenter)="hovered = i" (mouseleave)="hovered = -1" (click)="selected = selected === i ? -1 : i">
              <span class="legend-color" [style.background]="colors[i % colors.length]"></span>
              <span class="legend-label">{{ item.label }}</span>
              <span class="legend-value">{{ formatValue(item.value) }} ({{ item.percent }}%)</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .chart-wrapper { width: 100%; max-width: 100%; }
    .pie-container { position: relative; width: 100%; max-width: 280px; margin: 0 auto; }
    .pie-svg { width: 100%; height: auto; }
    .pie-slice { cursor: pointer; transition: opacity 0.2s; stroke: white; stroke-width: 2; }
    .pie-slice:hover { opacity: 0.8; }
    .pie-tooltip {
      position: absolute; top: 4px; right: 4px;
      background: rgba(51, 65, 85, 0.95); color: white;
      padding: 6px 12px; border-radius: 6px; font-size: 12px;
      display: flex; flex-direction: column; gap: 2px; align-items: flex-end;
      pointer-events: none; z-index: 10; white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .pie-tooltip strong { font-size: 13px; }
    .pie-legend { margin-top: 12px; display: flex; flex-direction: column; gap: 4px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; padding: 2px 4px; border-radius: 4px; }
    .legend-item:hover { background: #f3f4f6; }
    .legend-color { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
    .legend-label { flex: 1; color: #374151; }
    .legend-value { color: #6b7280; font-size: 11px; white-space: nowrap; }
    .no-data { color: #6b7280; font-style: italic; font-size: 14px; padding: 16px; }
  `]
})
export class BarChartComponent implements OnChanges {
  @Input() data: Record<string, number> = {};
  size = 200;
  colors = ['#174b65', '#1a5977', '#1c688a', '#1d779d', '#1d87b0', '#1b97c3', '#18a7d7', '#10b8eb', '#00c9ff'];

  hovered = -1;
  selected = -1;

  items: { label: string; value: number; percent: string; path: string }[] = [];
  total = 0;
  totalLabel = '';
  totalValue = '';

  get activeIndex(): number {
    return this.selected >= 0 ? this.selected : this.hovered;
  }

  ngOnChanges() {
    this.computeItems();
  }

  private computeItems() {
    const entries = Object.entries(this.data);
    if (entries.length === 0) { this.items = []; this.total = 0; this.totalLabel = ''; this.totalValue = ''; return; }
    this.total = entries.reduce((sum, [, v]) => sum + v, 0);
    this.totalLabel = 'Total';
    this.totalValue = this.formatValue(this.total);
    let startAngle = -Math.PI / 2;
    this.items = entries.map(([label, value]) => {
      const percent = this.total > 0 ? ((value / this.total) * 100).toFixed(1) : '0';
      const angle = this.total > 0 ? (value / this.total) * 2 * Math.PI : 0;
      const endAngle = startAngle + angle;
      const path = this.arcPath(startAngle, endAngle);
      startAngle = endAngle;
      return { label, value, percent, path };
    });
  }

  private arcPath(startAngle: number, endAngle: number): string {
    const cx = this.size / 2;
    const cy = this.size / 2;
    const r = this.size / 2 - 4;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    if (endAngle - startAngle >= 2 * Math.PI - 0.001) {
      // Full circle
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
    }
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  formatValue(v: number): string {
    if (v >= 1e12) return (v / 1e12).toFixed(1).replace('.', ',') + ' T';
    if (v >= 1e9) return (v / 1e9).toFixed(1).replace('.', ',') + ' B';
    if (v >= 1e6) return (v / 1e6).toFixed(1).replace('.', ',') + ' M';
    if (v >= 1e3) return (v / 1e3).toFixed(1).replace('.', ',') + ' K';
    return v.toLocaleString('es-AR', { maximumFractionDigits: 0 });
  }
}
