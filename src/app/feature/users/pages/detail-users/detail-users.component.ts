import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LogbookService } from '../../../logbook/services/logbook.service';
import { DetailLogbookResponse } from '../../../logbook/models/logbook.model';
import { AlertService } from '../../../../shared/services/alert.service';
import { Profile } from '../../../profile/models/profile.model';
import { ProfileService } from '../../../profile/services/profile.service';
import { UserService } from '../../services/user.service';
import { RelationItem } from '../../models/user.model';

@Component({
  selector: 'app-detail-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './detail-users.component.html',
  styleUrls: ['./detail-users.component.css']
})
export class DetailUsersComponent implements OnInit {
  // User data
  username: string = '';
  userDetail: Profile | null = null;
  loading: boolean = false;

  // Logbook data
  detailLogbooks: DetailLogbookResponse[] = [];
  kodeLogbook: string = '';
  loadingLogbooks: boolean = false;

  // Filter
  searchTerm: string = '';
  selectedStatus: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private logbookService: LogbookService,
    private alertService: AlertService,
    private profileService: ProfileService,
    private relationService: UserService
  ) {}

  ngOnInit(): void {
    // Ambil parameter dari route
    this.route.params.subscribe(params => {
      this.kodeLogbook = params['kodeLogbook'] || params['id'] || '';
      console.log('=== DETAIL USERS INIT ===');
      console.log('KodeLogbook from route:', this.kodeLogbook);

      // Ambil username dari query params
      this.route.queryParams.subscribe(queryParams => {
        this.username = queryParams['username'] || '';
        console.log('Username from query params:', this.username);

        if (this.kodeLogbook) {
          // Load detail logbook
          this.loadDetailLogbooks();

          // Load user profile
          if (this.username) {
            this.loadUserProfileByUsername(this.username);
          } else {
            // Fallback: cari username dari relation
            this.loadUsernameFromRelation();
          }
        } else {
          this.alertService.error('Logbook not found');
        }
      });
    });
  }

  loadUsernameFromRelation(): void {
    this.relationService.getRelations().subscribe({
      next: (response) => {
        console.log('=== RELATION DATA ===');
        console.log('Response:', response);

        // Cari data dari receivedFromOthers berdasarkan kodeLogbook
        const found = response.receivedFromOthers?.find(
          (item: RelationItem) => item.kodeLogbook === this.kodeLogbook
        );

        if (found) {
          this.username = found.sharedBy || '';
          console.log('Found username from relation:', this.username);

          // Load profile menggunakan username
          if (this.username) {
            this.loadUserProfileByUsername(this.username);
          }
        } else {
          console.log('No relation data found for this kodeLogbook');
          // Buat userDetail minimal
          this.userDetail = {
            userId: 0,
            nama: 'User',
            telp: '',
            bio: '',
            alamat: '',
            instansi: '',
            alamatInstansi: '',
            profileUrl: '',
            fileUrl: null,
            username: 'User'
          };
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading relation data:', error);
        this.loading = false;
      }
    });
  }

  loadUserProfileByUsername(username: string): void {
    if (!username || username === 'undefined' || username === 'null' || username === '') {
      console.log('Invalid username, skipping profile load');
      this.userDetail = {
        userId: 0,
        nama: 'User',
        telp: '',
        bio: '',
        alamat: '',
        instansi: '',
        alamatInstansi: '',
        profileUrl: '',
        fileUrl: null,
        username: 'User'
      };
      this.loading = false;
      return;
    }

    this.loading = true;
    console.log('Loading user profile for username:', username);

    this.profileService.getProfileByUsername(username).subscribe({
      next: (profile: Profile) => {
        console.log('User profile loaded:', profile);
        this.userDetail = profile;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading user profile:', error);

        // Jika error, buat userDetail minimal dari username
        this.userDetail = {
          userId: 0,
          nama: username,
          telp: '',
          bio: '',
          alamat: '',
          instansi: '',
          alamatInstansi: '',
          profileUrl: '',
          fileUrl: null,
          username: username
        };

        if (error.status === 404) {
          this.alertService.info(`Profile for "${username}" not found, showing basic info`);
        } else {
          this.alertService.error(error.error?.message || 'Failed to load user profile');
        }
        this.loading = false;
      }
    });
  }

  loadDetailLogbooks(): void {
    if (!this.kodeLogbook) {
      console.log('No kodeLogbook, skip loading');
      this.detailLogbooks = [];
      return;
    }

    this.loadingLogbooks = true;
    console.log('Loading detail logbooks for kode:', this.kodeLogbook);

    this.logbookService.getDetailLogbooks(this.kodeLogbook).subscribe({
      next: (response: DetailLogbookResponse[]) => {
        console.log('=== DETAIL LOGBOOKS RESPONSE ===');
        console.log('Raw response:', response);
        console.log('Is array?', Array.isArray(response));
        console.log('Length:', response?.length);

        this.detailLogbooks = response || [];
        console.log('Assigned to detailLogbooks:', this.detailLogbooks);
        console.log('detailLogbooks length:', this.detailLogbooks.length);

        this.loadingLogbooks = false;
      },
      error: (error: any) => {
        console.error('Error loading detail logbooks:', error);

        if (error.status === 403) {
          this.alertService.warning('You do not have permission to view this user\'s logbook details');
        } else if (error.status === 404) {
          this.alertService.warning('Logbook not found');
        } else {
          this.alertService.error(error.error?.message || 'Failed to load activities');
        }

        this.detailLogbooks = [];
        this.loadingLogbooks = false;
      }
    });
  }

  // ============= HELPER METHODS =============

  getFilteredLogbooks(): DetailLogbookResponse[] {
    let filtered = this.detailLogbooks;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.deskripsi?.toLowerCase().includes(term) ||
        item.statusAttend?.toLowerCase().includes(term) ||
        item.kendala?.toLowerCase().includes(term)
      );
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(item =>
        item.status === this.selectedStatus ||
        item.statusAttend === this.selectedStatus
      );
    }

    return filtered;
  }

  getCompletionPercentage(): number {
    if (this.detailLogbooks.length === 0) return 0;
    const completed = this.detailLogbooks.filter(item =>
      item.status === 'Completed' || item.status === 'Verified'
    ).length;
    return Math.round((completed / this.detailLogbooks.length) * 100);
  }

  getVerifiedCount(): number {
    return this.detailLogbooks.filter(item =>
      item.status === 'Verified' || item.statusAttend === 'Verified'
    ).length;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Present': 'bg-green-100 text-green-800',
      'Absent': 'bg-red-100 text-red-800',
      'Late': 'bg-yellow-100 text-yellow-800',
      'Leave': 'bg-purple-100 text-purple-800',
      'On Progress': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Lagging': 'bg-red-100 text-red-800',
      'Verified': 'bg-blue-100 text-blue-800',
      'Hadir': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getAttendStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Present': 'bg-green-100 text-green-800',
      'Absent': 'bg-red-100 text-red-800',
      'Late': 'bg-yellow-100 text-yellow-800',
      'Leave': 'bg-purple-100 text-purple-800',
      'Verified': 'bg-blue-100 text-blue-800',
      'Hadir': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  formatTime(time: string): string {
    if (!time) return '-';
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  }

  goBack(): void {
    this.router.navigate(['/list-user']);
  }

  getStatusOptions(): string[] {
    const statuses = new Set<string>();
    this.detailLogbooks.forEach(item => {
      if (item.status) statuses.add(item.status);
      if (item.statusAttend) statuses.add(item.statusAttend);
    });
    return Array.from(statuses);
  }

  verifyStatus(item: DetailLogbookResponse): void {
    if (item.status === 'Verified' || item.statusAttend === 'Verified') {
      this.alertService.info('This item is already verified');
      return;
    }

    console.log('Verifying status for:', item);
    this.alertService.info(`Verifying activity on ${this.formatDate(item.date)}`);
    // TODO: Implement API call for verification
  }
}
