import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

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
              <rect [attr.x]="i * barWidth + 4" [attr.y]="height - item.barH - 20" [attr.width]="barWidth - 8" [attr.height]="item.barH" [attr.fill]="colors[i % colors.length]" rx="4" />
              <text [attr.x]="i * barWidth + barWidth / 2" [attr.y]="height - 4" text-anchor="middle" font-size="9" fill="#6b7280">{{ truncate(item.label) }}</text>
              <text [attr.x]="i * barWidth + barWidth / 2" [attr.y]="height - item.barH - 24" text-anchor="middle" font-size="9" fill="#374151">{{ formatValue(item.value) }}</text>
            </g>
          }
        </svg>
      }
    </div>
  `,
  styles: [`
    .chart-wrapper { width: 100%; max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .chart-svg { width: 100%; height: auto; min-height: 100px; max-width: 100%; }
    .no-data { color: #6b7280; font-style: italic; font-size: 14px; }
    @media (max-width: 480px) {
      .chart-svg { min-height: 80px; }
    }
  `]
})
export class BarChartComponent implements OnChanges {
  @Input() data: Record<string, number> = {};
  width = 400;
  height = 160;
  colors = ['#324687', '#55a53c', '#4a5fa0', '#468a31', '#808cb3', '#373c5f'];

  items: { label: string; value: number; barH: number }[] = [];

  ngOnChanges(changes: SimpleChanges) {
    this.computeItems();
  }

  private computeItems() {
    const entries = Object.entries(this.data);
    if (entries.length === 0) { this.items = []; return; }
    const max = Math.max(...entries.map(([, v]) => v), 1);
    this.width = Math.max(300, entries.length * 60);
    this.items = entries.map(([label, value]) => ({
      label,
      value,
      barH: Math.max(4, (value / max) * (this.height - 40))
    }));
  }

  get barWidth() {
    return this.width / Math.max(this.items.length, 1);
  }

  truncate(label: string): string {
    return label.length > 12 ? label.substring(0, 10) + '..' : label;
  }

  formatValue(v: number): string {
    if (v >= 1e12) return (v / 1e12).toFixed(1).replace('.', ',') + 'T';
    if (v >= 1e9) return (v / 1e9).toFixed(1).replace('.', ',') + 'B';
    if (v >= 1e6) return (v / 1e6).toFixed(1).replace('.', ',') + 'M';
    if (v >= 1e3) return (v / 1e3).toFixed(1).replace('.', ',') + 'K';
    return v.toFixed(0);
  }
}
