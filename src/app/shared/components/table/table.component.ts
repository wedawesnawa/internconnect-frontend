import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
}

export interface TableAction {
  label: string;
  icon?: string;
  class?: string;
  action: (item: any) => void;
  show?: (item: any) => boolean;
}

export interface TableConfig {
  columns: TableColumn[];
  actions?: TableAction[];
  showIndex?: boolean;
  indexLabel?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  showFilter?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent {
  @Input() data: any[] = [];
  @Input() config!: TableConfig;
  @Input() loading: boolean = false;
  @Input() totalItems: number = 0;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50, 100];

  @Output() pageChange = new EventEmitter<{ page: number; pageSize: number }>();
  @Output() search = new EventEmitter<string>();
  @Output() sort = new EventEmitter<{ key: string; direction: 'asc' | 'desc' }>();

  @ContentChild('customCell') customCell!: TemplateRef<any>;
  @ContentChild('customHeader') customHeader!: TemplateRef<any>;
  @ContentChild('customActions') customActions!: TemplateRef<any>;

  sortKey: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTerm: string = '';

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get visibleData(): any[] {
    return this.data;
  }

  // === TAMBAHKAN METHOD INI ===
  getTotalColumns(): number {
    let count = 0;
    if (this.config.showIndex) count++;
    count += this.config.columns.length;
    if (this.customHeader) count++;
    if (this.config.actions && this.config.actions.length > 0) count++;
    return count;
  }

  onSort(key: string): void {
    if (!this.config.columns.find(c => c.key === key)?.sortable) return;

    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }

    this.sort.emit({ key: this.sortKey, direction: this.sortDirection });
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize = parseInt(select.value);
    this.currentPage = 1;
    this.pageChange.emit({ page: this.currentPage, pageSize: this.pageSize });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.search.emit(this.searchTerm);
  }

  getSortIcon(key: string): string {
    if (this.sortKey !== key) return '↕';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  getAlignmentClass(align: string = 'left'): string {
    const classes = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };
    return classes[align as keyof typeof classes] || 'text-left';
  }

  getVisibleActions(item: any): TableAction[] {
    return this.config.actions?.filter(action =>
      !action.show || action.show(item)
    ) || [];
  }

  getCellValue(item: any, column: TableColumn): string {
    const value = item[column.key];
    return column.format ? column.format(value) : value;
  }

  getRowClass(item: any): string {
    return '';
  }
}
