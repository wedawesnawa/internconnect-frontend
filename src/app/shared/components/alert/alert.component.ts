import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit, OnDestroy {
  @Input() type: AlertType = 'info';
  @Input() message: string = '';
  @Input() dismissible: boolean = true;
  @Input() duration: number = 5000; // Auto dismiss after 5 seconds
  @Input() position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';
  @Output() close = new EventEmitter<void>();

  private timeoutId: any;
  isVisible: boolean = true;

  ngOnInit(): void {
    // Auto dismiss after duration
    if (this.duration > 0) {
      this.timeoutId = setTimeout(() => {
        this.dismiss();
      }, this.duration);
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  get alertClasses(): string {
    const baseClasses = 'p-4 mb-3 text-sm rounded-lg shadow-lg flex items-start justify-between min-w-[300px] max-w-md';
    const typeClasses = {
      success: 'text-green-800 bg-green-50 dark:bg-green-900/80 dark:text-green-300 border border-green-200 dark:border-green-700',
      error: 'text-red-800 bg-red-50 dark:bg-red-900/80 dark:text-red-300 border border-red-200 dark:border-red-700',
      warning: 'text-yellow-800 bg-yellow-50 dark:bg-yellow-900/80 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700',
      info: 'text-blue-800 bg-blue-50 dark:bg-blue-900/80 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
    };
    return `${baseClasses} ${typeClasses[this.type]}`;
  }

  get positionClasses(): string {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4'
    };
    return positions[this.position];
  }

  get icon(): string {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[this.type];
  }

  get progressColor(): string {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };
    return colors[this.type];
  }

  dismiss(): void {
    this.isVisible = false;
    this.close.emit();
  }

  onClose(): void {
    this.dismiss();
  }
}
