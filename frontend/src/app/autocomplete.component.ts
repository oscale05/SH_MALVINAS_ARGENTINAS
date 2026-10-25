import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface AutocompleteItem {
  codigo: string;
  imputacion: string;
  origen?: string;
}

@Component({
  selector: 'app-autocomplete',
  imports: [FormsModule],
  template: `
    <div class="autocomplete">
      <input
        [ngModel]="query()"
        (ngModelChange)="onInput($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
        placeholder="Buscar código, origen o concepto..."
        class="autocomplete-input"
        autocomplete="off"
      />
      @if (showDropdown() && filtered().length > 0) {
        <ul class="autocomplete-list">
          @for (item of filtered(); track item.codigo) {
            <li (mousedown)="select(item)">
              <div class="item-main">
                <strong>{{ item.codigo }}</strong>
                <span class="concepto">{{ item.imputacion }}</span>
              </div>
              @if (item.origen) { <span class="origin">{{ item.origen }}</span> }
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .autocomplete { position: relative; width: 100%; max-width: 400px; }
    .autocomplete-input { width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; }
    .autocomplete-list {
      position: absolute; top: 100%; left: 0; right: 0;
      background: white; border: 1px solid #e5e7eb; border-radius: 8px;
      max-height: 250px; overflow-y: auto; z-index: 1000; list-style: none; padding: 0; margin: 4px 0 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .autocomplete-list li { padding: 8px 12px; cursor: pointer; font-size: 14px; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .autocomplete-list li:hover { background: #f3f4f6; }
    .item-main { display: flex; flex-direction: column; gap: 2px; }
    .concepto { font-size: 12px; color: #6b7280; }
    .origin { font-size: 11px; color: #9ca3af; white-space: nowrap; }
  `]
})
export class AutocompleteComponent {
  @Input() items: AutocompleteItem[] = [];
  @Output() selected = new EventEmitter<string>();

  query = signal('');
  showDropdown = signal(false);
  filtered = signal<AutocompleteItem[]>([]);

  private matches(item: AutocompleteItem, q: string): boolean {
    return (
      item.codigo.toLowerCase().startsWith(q) ||
      item.imputacion.toLowerCase().startsWith(q) ||
      (item.origen || '').toLowerCase().includes(q)
    );
  }

  onInput(value: string) {
    this.query.set(value);
    const q = value.trim().toLowerCase();
    if (q === '') {
      this.filtered.set(this.items);
    } else {
      this.filtered.set(this.items.filter(i => this.matches(i, q)));
    }
    this.showDropdown.set(true);
  }

  onFocus() {
    const q = this.query().trim().toLowerCase();
    if (q === '') {
      this.filtered.set(this.items);
    } else {
      this.filtered.set(this.items.filter(i => this.matches(i, q)));
    }
    this.showDropdown.set(true);
  }

  onBlur() {
    setTimeout(() => this.showDropdown.set(false), 200);
  }

  select(item: AutocompleteItem) {
    this.query.set(item.codigo);
    this.showDropdown.set(false);
    this.selected.emit(item.codigo);
  }
}
