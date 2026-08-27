import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProfileService } from './profile.service';
import { Profile } from '../models/profile.model';
import { AlertService } from '../../../shared/services/alert.service';

export interface ProfileCompleteness {
  isComplete: boolean;
  missingFields: string[];
  completenessPercentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileCheckService {
  private profileSubject = new BehaviorSubject<Profile | null>(null);
  profile$ = this.profileSubject.asObservable();

  private completenessSubject = new BehaviorSubject<ProfileCompleteness>({
    isComplete: false,
    missingFields: [],
    completenessPercentage: 0
  });
  completeness$ = this.completenessSubject.asObservable();

  // Konfigurasi rate limiting
  private readonly MAX_ALERTS_PER_HOUR = 2;
  private readonly ALERT_WINDOW_MS = 60 * 60 * 1000; // 60 menit
  private readonly STORAGE_KEY = 'profile_alert_history';

  // Flag untuk menandai apakah alert sedang dalam proses
  private isAlertShowing: boolean = false;
  private alertShownThisSession: boolean = false;

  constructor(
    private profileService: ProfileService,
    private alertService: AlertService
  ) {}

  /**
   * Cek apakah alert boleh ditampilkan berdasarkan rate limiting
   */
  private canShowAlert(): boolean {
    // Jika alert sudah ditampilkan di session ini, jangan tampilkan lagi
    if (this.alertShownThisSession) {
      console.log('⚠️ Alert already shown this session. Skipping.');
      return false;
    }

    const history = this.getAlertHistory();
    const now = Date.now();

    // Filter alert dalam 60 menit terakhir
    const recentAlerts = history.filter(timestamp =>
      now - timestamp < this.ALERT_WINDOW_MS
    );

    console.log('=== ALERT RATE LIMITING ===');
    console.log('Recent alerts:', recentAlerts.length);
    console.log('Max allowed:', this.MAX_ALERTS_PER_HOUR);
    console.log('History:', recentAlerts);

    // Jika sudah mencapai batas, tidak boleh tampil
    if (recentAlerts.length >= this.MAX_ALERTS_PER_HOUR) {
      console.log('⚠️ Alert limit reached. Cannot show alert.');
      return false;
    }

    return true;
  }

  /**
   * Catat kemunculan alert
   */
  private recordAlert(): void {
    const history = this.getAlertHistory();
    const now = Date.now();

    // Tambahkan timestamp baru
    history.push(now);

    // Hapus data lama (lebih dari 60 menit)
    const recentAlerts = history.filter(timestamp =>
      now - timestamp < this.ALERT_WINDOW_MS
    );

    // Simpan ke localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentAlerts));

    // Set flag session
    this.alertShownThisSession = true;

    console.log('✅ Alert recorded. Total in last 60 min:', recentAlerts.length);
    console.log('Alert history:', recentAlerts);
  }

  /**
   * Ambil history alert dari localStorage
   */
  private getAlertHistory(): number[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];

      const history = JSON.parse(data);
      if (!Array.isArray(history)) return [];

      // Validasi: pastikan semua item adalah number (timestamp)
      return history.filter(item => typeof item === 'number');
    } catch (error) {
      console.error('Error reading alert history:', error);
      return [];
    }
  }

  /**
   * Reset history alert (untuk testing)
   */
  resetAlertHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.alertShownThisSession = false;
    this.isAlertShowing = false;
    console.log('🔄 Alert history reset');
  }

  checkProfileCompleteness(profile: Profile | null): ProfileCompleteness {
    const requiredFields: { key: keyof Profile; label: string }[] = [
      { key: 'nama', label: 'Full Name' },
      { key: 'telp', label: 'Phone Number' },
      { key: 'bio', label: 'Bio / About Me' },
      { key: 'alamat', label: 'Address' },
      { key: 'instansi', label: 'Institution' }
    ];

    const missingFields: string[] = [];
    let filledCount = 0;

    if (!profile) {
      return {
        isComplete: false,
        missingFields: requiredFields.map(f => f.label),
        completenessPercentage: 0
      };
    }

    requiredFields.forEach(field => {
      const value = profile[field.key];
      if (!value || value === '' || value === null || value === undefined) {
        missingFields.push(field.label);
      } else {
        filledCount++;
      }
    });

    const completenessPercentage = Math.round((filledCount / requiredFields.length) * 100);
    const isComplete = completenessPercentage === 100;

    return {
      isComplete,
      missingFields,
      completenessPercentage
    };
  }

  loadAndCheckProfile(): void {
    // Jika alert sedang dalam proses, skip
    if (this.isAlertShowing) {
      console.log('⏳ Alert is already in progress. Skipping.');
      return;
    }

    this.profileService.getProfile().subscribe({
      next: (profile: Profile) => {
        this.profileSubject.next(profile);
        const completeness = this.checkProfileCompleteness(profile);
        this.completenessSubject.next(completeness);

        // Hanya tampilkan alert jika profile tidak lengkap DAN boleh tampil
        if (!completeness.isComplete && this.canShowAlert()) {
          this.showProfileAlert(completeness);
          this.recordAlert();
        } else if (completeness.isComplete) {
          // Jika profile sudah lengkap, reset history
          this.resetAlertHistory();
          console.log('✅ Profile is complete. Alert history reset.');
        }
      },
      error: (error) => {
        console.error('Error loading profile for check:', error);
        if (error.status === 404 && this.canShowAlert()) {
          this.showNoProfileAlert();
          this.recordAlert();
        }
      }
    });
  }

  private showProfileAlert(completeness: ProfileCompleteness): void {
    this.isAlertShowing = true;

    const missingFieldsList = completeness.missingFields.join(', ');

    // Informasi sisa alert
    const history = this.getAlertHistory();
    const now = Date.now();
    const recentAlerts = history.filter(timestamp =>
      now - timestamp < this.ALERT_WINDOW_MS
    );
    const remainingAlerts = Math.max(0, this.MAX_ALERTS_PER_HOUR - recentAlerts.length);

    const htmlMessage = `
      <div class="flex flex-col gap-2">
        <div>
          <span class="font-semibold">Your profile is ${completeness.completenessPercentage}% complete.</span>
          <span class="text-yellow-700"> Please complete the following fields:</span>
        </div>
        <div class="text-sm text-yellow-700">
          📝 ${missingFieldsList}
        </div>
        <div class="mt-2 flex items-center gap-2">
          <a href="/profile" class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 no-underline">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
            Go to Profile
          </a>
          <span class="text-xs text-gray-500">
            (${remainingAlerts} reminder${remainingAlerts > 1 ? 's' : ''} left)
          </span>
        </div>
      </div>
    `;

    this.alertService.warning(htmlMessage, 8000, true);

    // Reset flag setelah alert selesai (setelah 8 detik)
    setTimeout(() => {
      this.isAlertShowing = false;
    }, 8000);
  }

  private showNoProfileAlert(): void {
    this.isAlertShowing = true;

    // Informasi sisa alert
    const history = this.getAlertHistory();
    const now = Date.now();
    const recentAlerts = history.filter(timestamp =>
      now - timestamp < this.ALERT_WINDOW_MS
    );
    const remainingAlerts = Math.max(0, this.MAX_ALERTS_PER_HOUR - recentAlerts.length);

    const htmlMessage = `
      <div class="flex flex-col gap-2">
        <div>
          <span class="font-semibold">Your profile is empty.</span>
          <span class="text-yellow-700"> Please complete your profile.</span>
        </div>
        <div class="mt-2 flex items-center gap-2">
          <a href="/profile" class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 no-underline">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
            Create Profile
          </a>
          <span class="text-xs text-gray-500">
            (${remainingAlerts} reminder${remainingAlerts > 1 ? 's' : ''} left)
          </span>
        </div>
      </div>
    `;

    this.alertService.warning(htmlMessage, 8000, true);

    setTimeout(() => {
      this.isAlertShowing = false;
    }, 8000);
  }

  /**
   * Reset session flag (dipanggil saat user login atau navigasi ke profile)
   */
  resetSessionFlag(): void {
    this.alertShownThisSession = false;
    this.isAlertShowing = false;
    console.log('🔄 Session flag reset');
  }

  getCurrentCompleteness(): ProfileCompleteness {
    return this.completenessSubject.value;
  }

  getCurrentProfile(): Profile | null {
    return this.profileSubject.value;
  }
}
