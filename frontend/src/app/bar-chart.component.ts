import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bar-chart',
  template: `
    <svg [attr.width]="width" [attr.height]="height" role="img" aria-label="Gráfico de barras">
      @for (item of items; track item.label; let i = $index) {
        <rect [attr.x]="i * barWidth + 10" [attr.y]="height - item.value * item.scale" [attr.width]="barWidth - 4" [attr.height]="item.value * item.scale" fill="#3b82f6" />
        <text [attr.x]="i * barWidth + 10" [attr.y]="height - 4" font-size="10">{{ item.label }}</text>
      }
    </svg>
  `
})
export class BarChartComponent {
  @Input() data: Record<string, number> = {};
  width = 320;
  height = 120;

  get items() {
    const max = Math.max(...Object.values(this.data), 1);
    return Object.entries(this.data).map(([label, value]) => ({ label, value, scale: 100 / max }));
  }

  get barWidth() {
    const count = Math.max(Object.keys(this.data).length, 1);
    return this.width / count;
  }
}
