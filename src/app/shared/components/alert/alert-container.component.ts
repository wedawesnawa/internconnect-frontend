import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './alert.component';
import { AlertService, Alert } from '../../services/alert.service';

@Component({
  selector: 'app-alert-container',
  standalone: true,
  imports: [CommonModule, AlertComponent],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-md w-full pointer-events-none">
      <app-alert
        *ngFor="let alert of alerts"
        [type]="alert.type"
        [message]="alert.message"
        [duration]="alert.duration || 5000"
        [dismissible]="alert.dismissible !== false"
        (close)="dismiss(alert.id)"
        class="pointer-events-auto">
      </app-alert>
    </div>
  `,
  styles: [`
    .pointer-events-none {
      pointer-events: none;
    }
    .pointer-events-auto {
      pointer-events: auto;
    }
  `]
})
export class AlertContainerComponent implements OnInit {
  alerts: Alert[] = [];

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.alertService.alerts$.subscribe(alerts => {
      this.alerts = alerts;
    });
  }

  dismiss(id: number): void {
    this.alertService.dismiss(id);
  }
}
