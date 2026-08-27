import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
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
  @Input() duration: number = 5000;
  @Input() position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';
  @Input() html: boolean = false;
  @Output() close = new EventEmitter<void>();

  private timeoutId: any;
  private startTime: number = 0;
  private elapsedTime: number = 0;
  private isPaused: boolean = false;

  isVisible: boolean = true;
  progressWidth: number = 100;

  ngOnInit(): void {
    console.log('=== ALERT COMPONENT ===');
    console.log('Message:', this.message);
    console.log('HTML:', this.html);
    console.log('Duration:', this.duration);

    if (this.duration > 0) {
      this.startTime = Date.now();
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private startTimer(): void {
    this.clearTimer();
    this.startTime = Date.now() - this.elapsedTime;
    this.isPaused = false;

    // Update progress setiap 100ms
    this.timeoutId = setInterval(() => {
      if (!this.isPaused) {
        const now = Date.now();
        const elapsed = now - this.startTime;
        const remaining = Math.max(0, this.duration - elapsed);
        this.progressWidth = (remaining / this.duration) * 100;

        if (remaining <= 0) {
          this.dismiss();
        }
      }
    }, 100);
  }

  private clearTimer(): void {
    if (this.timeoutId) {
      clearInterval(this.timeoutId);
      this.timeoutId = null;
    }
  }

  pauseTimer(): void {
    if (this.duration > 0 && !this.isPaused) {
      this.isPaused = true;
      this.elapsedTime = Date.now() - this.startTime;
      this.clearTimer();
    }
  }

  resumeTimer(): void {
    if (this.duration > 0 && this.isPaused && this.isVisible) {
      this.isPaused = false;
      this.startTime = Date.now() - this.elapsedTime;
      this.startTimer();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isVisible) {
      this.dismiss();
    }
  }

  dismiss(): void {
    this.isVisible = false;
    this.clearTimer();

    // Tambahkan class exit sebelum emit
    setTimeout(() => {
      this.close.emit();
    }, 400);
  }

  onClose(): void {
    this.dismiss();
  }

  get alertClasses(): string {
    const baseClasses = 'p-4 mb-0 text-sm rounded-lg shadow-lg flex items-start justify-between min-w-[300px] max-w-md';
    const typeClasses = {
      success: 'text-green-800 bg-green-50 border border-green-200',
      error: 'text-red-800 bg-red-50 border border-red-200',
      warning: 'text-yellow-800 bg-yellow-50 border border-yellow-200',
      info: 'text-blue-800 bg-blue-50 border border-blue-200'
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
}
