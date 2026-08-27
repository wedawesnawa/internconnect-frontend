import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { RelationItem, RelationResponse } from '../../models/user.model';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-list-user',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list-user.component.html',
  styleUrl: './list-user.component.css'
})
export class ListUserComponent implements OnInit {
  // Data relasi
  receivedFromOthers: RelationItem[] = [];
  givenToOthers: RelationItem[] = [];
  loading: boolean = false;

  // Tab aktif
  activeTab: 'received' | 'given' = 'received';

  constructor(
    private relationService: UserService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadRelations();
  }

  loadRelations(): void {
    this.loading = true;
    this.relationService.getRelations().subscribe({
      next: (response: RelationResponse) => {
        console.log('Relations loaded:', response);
        this.receivedFromOthers = response.receivedFromOthers || [];
        this.givenToOthers = response.givenToOthers || [];
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
}
