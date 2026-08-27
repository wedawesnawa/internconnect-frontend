import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AlertType } from '../components/alert/alert.component';

export interface Alert {
  id: number;
  type: AlertType;
  message: string;
  duration?: number;
  dismissible?: boolean;
  html?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alerts: Alert[] = [];
  private alertSubject = new BehaviorSubject<Alert[]>([]);
  alerts$ = this.alertSubject.asObservable();
  private idCounter = 0;

  show(type: AlertType, message: string, duration: number = 5000, html: boolean = false): void {
    console.log('=== ALERT SERVICE ===');
    console.log('Type:', type);
    console.log('Message:', message);
    console.log('HTML:', html);
    console.log('Duration:', duration);

    const alert: Alert = {
      id: ++this.idCounter,
      type,
      message,
      duration,
      dismissible: true,
      html: html // ← Pastikan ini tersimpan
    };

    this.alerts.push(alert);
    this.alertSubject.next([...this.alerts]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(alert.id);
      }, duration);
    }
  }

  success(message: string, duration: number = 5000, html: boolean = false): void {
    this.show('success', message, duration, html);
  }

  error(message: string, duration: number = 5000, html: boolean = false): void {
    this.show('error', message, duration, html);
  }

  warning(message: string, duration: number = 5000, html: boolean = false): void {
    this.show('warning', message, duration, html);
  }

  info(message: string, duration: number = 5000, html: boolean = false): void {
    this.show('info', message, duration, html);
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
