import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { RelationItem, RelationResponse } from '../../models/user.model';
import { AlertService } from '../../../../shared/services/alert.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-list-user',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list-user.component.html',
  styleUrls: ['./list-user.component.css']
})
export class ListUserComponent implements OnInit {
  // Data relasi
  receivedFromOthers: RelationItem[] = [];
  givenToOthers: RelationItem[] = [];
  loading: boolean = false;
  currentUser: string = '';

  // Tab aktif
  activeTab: 'received' | 'given' = 'received';

  constructor(
    private relationService: UserService,
    private alertService: AlertService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()?.username || '';
    console.log('Current user:', this.currentUser);
    this.loadRelations();
  }

  loadRelations(): void {
    this.loading = true;
    this.relationService.getRelations().subscribe({
      next: (response: RelationResponse) => {
        console.log('=== RELATIONS RESPONSE ===');
        console.log('Full response:', response);

        this.receivedFromOthers = response.receivedFromOthers || [];
        this.givenToOthers = response.givenToOthers || [];

        console.log('Received from others:', this.receivedFromOthers);
        console.log('Given to others:', this.givenToOthers);

        // Log detail setiap item di givenToOthers
        this.givenToOthers.forEach((item, index) => {
          console.log(`Given ${index + 1}:`, {
            content: item.content,
            sharedBy: item.sharedBy,
            kodeLogbook: item.kodeLogbook,
            allKeys: Object.keys(item),
            fullItem: item
          });
        });

        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading relations:', error);
        this.alertService.error(error.error?.message || 'Failed to load relations');
        this.loading = false;
      }
    });
  }

  switchTab(tab: 'received' | 'given'): void {
    this.activeTab = tab;
    console.log('Tab switched to:', tab);
    console.log('Current data:', this.getCurrentData());
  }

  /**
   * Mendapatkan username dari item relation
   * Untuk received: sharedBy adalah orang yang share
   * Untuk given: coba cari dari berbagai field
   */
  getUsernameFromItem(item: RelationItem): string {
    console.log('=== getUsernameFromItem ===');
    console.log('Item:', item);
    console.log('Active tab:', this.activeTab);

    // List field yang mungkin berisi username
    const possibleFields = ['sharedBy', 'sharedWith', 'username', 'to', 'recipient'];

    // Coba cari di semua field yang mungkin
    for (const field of possibleFields) {
      const value = (item as any)[field];
      if (value && typeof value === 'string' && value !== 'undefined' && value !== 'null') {
        console.log(`Found username in field "${field}":`, value);
        return value;
      }
    }

    // Jika tidak ditemukan, fallback
    if (this.activeTab === 'received') {
      console.log('No username found, using Unknown');
      return 'Unknown';
    } else {
      console.log('No username found for given, using Unknown');
      return 'Unknown';
    }
  }

  /**
   * Mendapatkan nama orang yang berinteraksi
   */
  getDisplayName(item: RelationItem): string {
    const username = this.getUsernameFromItem(item);
    console.log('Display name:', username);
    return username;
  }
  // getDisplayName(item: RelationItem): string {
  //   if (this.activeTab === 'received') {
  //     return item.sharedBy || 'Unknown';
  //   } else {
  //     // Untuk given, sharedBy seharusnya adalah penerima
  //     // Tapi jika tidak ada, gunakan sharedBy atau fallback
  //     return item.sharedBy || 'Unknown';
  //   }
  // }


  /**
   * Mendapatkan label untuk interaksi
   */
  getInteractionLabel(item: RelationItem): string {
    const name = this.getDisplayName(item);
    if (this.activeTab === 'received') {
      return `→ You (from ${name})`;
    } else {
      return `← You (to ${name})`;
    }
  }

  /**
   * Cek apakah username valid
   */
  isValidUsername(username: string): boolean {
    return !!(username &&
      username !== 'undefined' &&
      username !== 'null' &&
      username !== 'Unknown' &&
      username.trim() !== '');
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Ongoing': 'bg-green-100 text-green-800',
      'Completed': 'bg-blue-100 text-blue-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'On Progress': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getPermissionColor(permission: string): string {
    const colors: { [key: string]: string } = {
      'read': 'bg-blue-100 text-blue-700',
      'write': 'bg-green-100 text-green-700',
      'Read': 'bg-blue-100 text-blue-700',
      'Write': 'bg-green-100 text-green-700'
    };
    return colors[permission] || 'bg-gray-100 text-gray-700';
  }

  formatDate(date: string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateTime(date: string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTotalItems(): number {
    if (this.activeTab === 'received') {
      return this.receivedFromOthers.length;
    }
    return this.givenToOthers.length;
  }

  getCurrentData(): RelationItem[] {
    if (this.activeTab === 'received') {
      return this.receivedFromOthers;
    }
    return this.givenToOthers;
  }

  // Helper untuk debug
  hasGivenData(): boolean {
    return this.givenToOthers.length > 0;
  }
}
