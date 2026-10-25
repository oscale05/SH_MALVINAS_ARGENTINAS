import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-autocomplete',
  imports: [FormsModule],
  template: `
    <div class="autocomplete">
      <input
        [ngModel]="query()"
        (ngModelChange)="onInput($event)"
        (focus)="showDropdown.set(true)"
        placeholder="Buscar código..."
        class="autocomplete-input"
      />
      @if (showDropdown() && filtered().length > 0) {
        <ul class="autocomplete-list">
          @for (item of filtered(); track item) {
            <li (click)="select(item)">{{ item }}</li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .autocomplete { position: relative; width: 100%; max-width: 300px; }
    .autocomplete-input { width: 100%; }
    .autocomplete-list {
      position: absolute; top: 100%; left: 0; right: 0;
      background: white; border: 1px solid #e5e7eb; border-radius: 8px;
      max-height: 200px; overflow-y: auto; z-index: 100; list-style: none; padding: 0; margin: 4px 0 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .autocomplete-list li { padding: 8px 12px; cursor: pointer; font-size: 14px; }
    .autocomplete-list li:hover { background: #f3f4f6; }
  `]
})
export class AutocompleteComponent {
  @Input() items: string[] = [];
  @Output() selected = new EventEmitter<string>();

  query = signal('');
  showDropdown = signal(false);
  filtered = signal<string[]>([]);

  onInput(value: string) {
    this.query.set(value);
    const q = value.toLowerCase();
    this.filtered.set(this.items.filter(i => i.toLowerCase().includes(q)));
    this.showDropdown.set(true);
  }

  select(item: string) {
    this.query.set(item);
    this.showDropdown.set(false);
    this.selected.emit(item);
  }
}
