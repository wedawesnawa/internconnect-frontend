import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AlertType } from '../components/alert/alert.component';

export interface Alert {
  id: number;
  type: AlertType;
  message: string;
  duration?: number;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alerts: Alert[] = [];
  private alertSubject = new BehaviorSubject<Alert[]>([]);
  alerts$ = this.alertSubject.asObservable();
  private idCounter = 0;

  show(type: AlertType, message: string, duration: number = 5000, dismissible: boolean = true): void {
    const alert: Alert = {
      id: ++this.idCounter,
      type,
      message,
      duration,
      dismissible
    };

    this.alerts.push(alert);
    this.alertSubject.next([...this.alerts]);

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(alert.id);
      }, duration);
    }
  }

  success(message: string, duration: number = 5000): void {
    this.show('success', message, duration);
  }

  error(message: string, duration: number = 5000): void {
    this.show('error', message, duration);
  }

  warning(message: string, duration: number = 5000): void {
    this.show('warning', message, duration);
  }

  info(message: string, duration: number = 5000): void {
    this.show('info', message, duration);
  }

  dismiss(id: number): void {
    this.alerts = this.alerts.filter(alert => alert.id !== id);
    this.alertSubject.next([...this.alerts]);
  }

  clear(): void {
    this.alerts = [];
    this.alertSubject.next([]);
  }
}
