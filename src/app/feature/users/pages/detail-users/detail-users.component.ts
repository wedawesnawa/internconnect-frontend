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
import { AuthService } from '../../../auth/services/auth.service';

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
  profilePictureUrl: string | null = null;
  isLoadingProfile: boolean = false;

  // Logbook data
  detailLogbooks: DetailLogbookResponse[] = [];
  kodeLogbook: string = '';
  loadingLogbooks: boolean = false;

  // Filter
  searchTerm: string = '';
  selectedStatus: string = '';

  // Verifikasi
  isVerifying: boolean = false;
  currentUserRole: string = '';

  // Download
  isDownloading: boolean = false;
  fileUrl: string | null = null;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private logbookService: LogbookService,
    private alertService: AlertService,
    private profileService: ProfileService,
    private relationService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    console.log('User from getCurrentUser():', user);
    console.log('User role:', user?.role);
    console.log('User username:', user?.username);
    console.log('Full user:', JSON.stringify(user, null, 2));

    // Ambil role dari localStorage langsung
    const userStr = localStorage.getItem('user');
    let userRole = 'User';
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        userRole = parsedUser.role || 'User';
        console.log('Role from localStorage:', userRole);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }

    // Set role dari localStorage
    this.currentUserRole = userRole;
    console.log('Current user role (set):', this.currentUserRole);

    // Coba dari AuthService juga
    this.currentUserRole = this.authService.getUserRole() || userRole;
    console.log('Current user role (from AuthService):', this.currentUserRole);

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

  // detail-users.component.ts - Update method loadUserProfileByUsername

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
        console.log('=== FULL PROFILE RESPONSE ===');
        console.log('Profile object:', profile);
        console.log('ProfilePictureUrl:', profile.profileUrl);
        console.log('ProfileUrl:', profile.profileUrl);
        console.log('FileUrl:', profile.fileUrl);

        this.userDetail = profile;

        // SET full URL dari response
        // Priority: profilePictureUrl (new) > profileUrl (old)
        if (profile.profileUrl) {
          this.profilePictureUrl = profile.profileUrl;
          console.log('Profile picture URL set to:', this.profilePictureUrl);
        } else if (profile.profileUrl) {
          this.profilePictureUrl = profile.profileUrl;
          console.log('Profile picture URL (legacy) set to:', this.profilePictureUrl);
        } else {
          console.log('No profile picture URL in response');
          this.profilePictureUrl = null;
        }

        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading user profile:', error);
        // ... error handling
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

  // PERBAIKI: Method untuk mendapatkan profile image
  getProfileImage(): string {
    // Priority: profilePictureUrl, userDetail.profileUrl, atau empty
    if (this.profilePictureUrl) {
      return this.profilePictureUrl;
    }
    if (this.userDetail?.profileUrl) {
      return this.userDetail.profileUrl;
    }
    return '';
  }

  downloadFile(fileUrl: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!fileUrl || fileUrl === '-' || fileUrl === 'null' || fileUrl === 'undefined' || fileUrl === '') {
      this.alertService.warning('No file available to download');
      return;
    }

    console.log('Downloading file from MinIO:', fileUrl);
    this.isDownloading = true;

    // Extract filename from path
    // let fileName = fileUrl;
    // if (fileUrl.includes('/')) {
    //   fileName = fileUrl.split('/').pop() || fileUrl;
    // }
    // if (fileUrl.includes('\\')) {
    //   fileName = fileUrl.split('\\').pop() || fileUrl;
    // }

    // Download dari MinIO melalui backend
    this.downloadFromMinIO(fileUrl);
  }

  /**
   * Download file from MinIO using backend API
   */
  downloadFromMinIO(fileName: string): void {
    console.log('Downloading from MinIO:', fileName);

    this.relationService.downloadFile(fileName).subscribe({
      next: (blob: Blob) => {
        console.log('File downloaded successfully from MinIO:', fileName);
        console.log('File size:', blob.size, 'bytes');
        console.log('File type:', blob.type);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);

        this.isDownloading = false;
        this.alertService.success('File downloaded successfully!');
      },
      error: (error: any) => {
        console.error('Download error from MinIO:', error);
        this.isDownloading = false;

        let errorMessage = 'Failed to download file. Please try again.';
        if (error.status === 404) {
          errorMessage = 'File not found in storage';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to download this file';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please contact administrator.';
        }
        this.alertService.error(errorMessage);
      }
    });
  }

  /**
   * Preview file URL (open in new tab)
   */
  previewFile(fileUrl: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!fileUrl || fileUrl === '-' || fileUrl === 'null' || fileUrl === 'undefined' || fileUrl === '') {
      this.alertService.warning('No file available to preview');
      return;
    }

    // Extract filename
    let fileName = fileUrl;
    if (fileUrl.includes('/')) {
      fileName = fileUrl.split('/').pop() || fileUrl;
    }
    if (fileUrl.includes('\\')) {
      fileName = fileUrl.split('\\').pop() || fileUrl;
    }

    // Open in new tab via backend
    const url = `http://localhost:5000/api/UserDetail/download-file/${encodeURIComponent(fileName)}`;
    window.open(url, '_blank');
  }

  /**
   * Get file name from path
   */
  getFileName(fileUrl: string): string {
    if (!fileUrl) return 'File';
    let fileName = fileUrl;
    if (fileUrl.includes('/')) {
      fileName = fileUrl.split('/').pop() || fileUrl;
    }
    if (fileUrl.includes('\\')) {
      fileName = fileUrl.split('\\').pop() || fileUrl;
    }
    return fileName;
  }

  /**
   * Get file icon based on extension
   */
  getFileIcon(fileUrl: string): string {
    if (!fileUrl) return '📄';
    const fileName = this.getFileName(fileUrl).toLowerCase();
    if (fileName.endsWith('.pdf')) return '📕';
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return '📘';
    if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) return '📊';
    if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png')) return '🖼️';
    if (fileName.endsWith('.zip') || fileName.endsWith('.rar')) return '📦';
    return '📄';
  }

  // PERBAIKI: Handle image error
  handleImageError(event: Event): void {
    console.log('Image failed to load, showing placeholder');
    this.profilePictureUrl = null;
    if (this.userDetail) {
      this.userDetail.profileUrl = '';
    }
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
      item.status === 'Completed' || item.status === 'Approved'
    ).length;
    return Math.round((completed / this.detailLogbooks.length) * 100);
  }

  canVerify(): boolean {
    const allowedRoles = ['Supervisor', 'Mentor', 'Admin'];
    const can = allowedRoles.includes(this.currentUserRole);
    return can;
  }

  getVerifiedCount(): number {
    return this.detailLogbooks.filter(item =>
      item.status === 'Approved' || item.statusAttend === 'Approved'
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
    // Cek apakah sudah diverifikasi
    if (item.status === 'Approved' || item.statusAttend === 'Approved') {
      this.alertService.info('This item is already verified');
      return;
    }

    // Cek izin
    if (!this.canVerify()) {
      this.alertService.warning('Only Supervisor and Mentor can verify logbook entries');
      return;
    }

    // Konfirmasi
    if (!confirm(`Are you sure you want to verify this activity on ${this.formatDate(item.date)}?`)) {
      return;
    }

    this.isVerifying = true;
    console.log('Verifying status for item:', item);

    this.logbookService.verifyDetailLogbook(item.id).subscribe({
      next: (response: any) => {
        console.log('Verification response:', response);
        this.alertService.success(`Activity on ${this.formatDate(item.date)} verified successfully!`);
        this.isVerifying = false;
        // Refresh data
        this.loadDetailLogbooks();
      },
      error: (error: any) => {
        console.error('Error verifying logbook:', error);
        let errorMessage = 'Failed to verify activity';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to verify this activity';
        }
        this.alertService.error(errorMessage);
        this.isVerifying = false;
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    const classes: { [key: string]: string } = {
      'Supervisor': 'bg-purple-100 text-purple-800',
      'Mentor': 'bg-blue-100 text-blue-800',
      'Admin': 'bg-red-100 text-red-800',
      'User': 'bg-gray-100 text-gray-800'
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
  }
}
