import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AlertService } from '../../../../shared/services/alert.service';
import { LogbookService } from '../../services/logbook.service';
import {
  LogbookResponse,
  LogbookDetailResponse,
  CreateDetailLogbookRequest,
  DetailLogbookResponse,
  DetailLogbookStatus,
  UserByRole,
  CreateSharedRequest,
  SharedResponse
} from '../../models/logbook.model';
import { UserService } from '../../../users/services/user.service';

@Component({
  selector: 'app-detail-logbook',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    FullCalendarModule,
    ModalComponent
  ],
  templateUrl: './detail-logbook.component.html',
  styleUrls: ['./detail-logbook.component.css']
})
export class DetailLogbookComponent implements OnInit, AfterViewInit {
  kodeLogbook: string = '';
  logbook: LogbookResponse | null = null;
  loading: boolean = true;
  errorMessage: string = '';
  detailLogbooks: DetailLogbookResponse[] = [];

  calendarOptions: any;
  selectedDate: string = '';
  calendarInitialized: boolean = false;

  // Share Modal
  isShareModalOpen: boolean = false;
  shareStep: 'select-role' | 'select-user' = 'select-role';
  shareData = {
    selectedRole: '',
    selectedUsername: '',
    permission: 'read'
  };
  usersByRole: UserByRole[] = [];
  sharedUsers: SharedResponse[] = []; // Tambahkan ini
  isLoadingUsers: boolean = false;
  isSharing: boolean = false;
  isLoadingShared: boolean = false;

  // Single Activity Modal (Create/View)
  isActivityModalOpen: boolean = false;
  isEditMode: boolean = false;
  selectedActivityId: number | null = null;

  activityForm = {
    date: '',
    deskripsi: '',
    kendala: '',
    statusAttend: 'Present',
    timeStart: '',
    timeEnd: '',
    status: 'On Progress'
  };

  isSubmittingActivity: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    private router: Router,
    private logbookService: LogbookService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.kodeLogbook = params['kodeLogbook'] || params['id'];
      console.log('KodeLogbook from route:', this.kodeLogbook);

      if (this.kodeLogbook) {
        this.loadLogbookDetail();
        this.loadDetailLogbooks();
        this.loadSharedUsers();
      } else {
        this.errorMessage = 'Logbook code not found';
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    // Custom button sudah dihandle melalui headerToolbar di calendarOptions
  }

  loadLogbookDetail(): void {
    this.loading = true;
    this.errorMessage = '';
    this.calendarInitialized = false;

    this.logbookService.getLogbookByKode(this.kodeLogbook).subscribe({
      next: (response: LogbookDetailResponse) => {
        console.log('Logbook detail loaded:', response);
        this.logbook = response.data;
        this.loading = false;
        setTimeout(() => {
          this.initializeCalendar();
        }, 100);
      },
      error: (error: any) => {
        console.error('Error loading logbook detail:', error);
        this.errorMessage = error.error?.message || 'Failed to load logbook detail';
        this.loading = false;
        this.alertService.error(this.errorMessage);
      }
    });
  }

  loadDetailLogbooks(): void {
    console.log('Loading detail logbooks for kode:', this.kodeLogbook);
    this.logbookService.getDetailLogbooks(this.kodeLogbook).subscribe({
      next: (response: DetailLogbookResponse[]) => {
        console.log('Detail logbooks loaded:', response);
        this.detailLogbooks = response || [];
        console.log('Number of activities:', this.detailLogbooks.length);

        // Log setiap date untuk debugging
        this.detailLogbooks.forEach((detail: DetailLogbookResponse) => {
          console.log('Activity date raw:', detail.date, 'Formatted:', this.formatDateForDisplay(detail.date));
        });

        if (this.calendarInitialized) {
          this.initializeCalendar();
        }
      },
      error: (error: any) => {
        console.error('Error loading detail logbooks:', error);
        this.alertService.error('Failed to load activities');
      }
    });
  }

  // ============= FORMAT DATE HELPER =============

  /**
   * Format date untuk display di calendar (YYYY-MM-DD)
   * Mengatasi masalah timezone
   */
  private formatDateForCalendar(dateStr: string): string {
    if (!dateStr) return '';

    // Parse date string
    const date = new Date(dateStr);

    // Get local date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * Format date untuk display di UI
   */
  private formatDateForDisplay(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Format date untuk input type date
   */
  private formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get start of day in local timezone
   */
  private getStartOfDay(dateStr: string): string {
    const date = new Date(dateStr);
    // Set to start of day (00:00:00) local time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  initializeCalendar(): void {
    if (!this.logbook || this.calendarInitialized) return;

    const events: any[] = [];

    // Parse dates dengan format yang benar
    const startDateStr = this.formatDateForCalendar(this.logbook.dateStart);
    const endDateStr = this.formatDateForCalendar(this.logbook.dateEnd);

    console.log('Calendar date range:', startDateStr, 'to', endDateStr);

    // Add existing detail logbooks to calendar
    this.detailLogbooks.forEach((detail: DetailLogbookResponse) => {
      // Format date dengan benar (tanpa timezone offset)
      const dateStr = this.formatDateForCalendar(detail.date);
      console.log('Adding event for date:', dateStr);

      const startTime = detail.timeStart || '08:00:00';
      const endTime = detail.timeEnd || '17:00:00';

      events.push({
        id: `detail-${detail.id}`,
        title: detail.statusAttend || 'Activity',
        start: `${dateStr}T${startTime}`,
        end: `${dateStr}T${endTime}`,
        description: detail.deskripsi || 'Activity',
        className: this.getEventColor(detail.statusAttend),
        extendedProps: {
          detailId: detail.id,
          status: detail.status,
          isDetail: true
        }
      });
    });

    // Generate default events for date range (if no detail exists)
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    console.log('Generating default events from:', startDate, 'to:', endDate);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      // Skip weekend (Saturday = 6, Sunday = 0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Check if date already has detail
        const hasDetail = this.detailLogbooks.some((detail: DetailLogbookResponse) =>
          this.formatDateForCalendar(detail.date) === dateStr
        );

        if (!hasDetail) {
          events.push({
            title: 'No Activity',
            start: `${dateStr}T08:00:00`,
            end: `${dateStr}T17:00:00`,
            description: 'No activity recorded',
            className: 'bg-gray-300 text-gray-500',
            isDefault: true
          });
        }
      }
    }

    console.log('Total events:', events.length);
    console.log('Detail events:', events.filter((e: any) => e.extendedProps?.isDetail).length);
    console.log('Default events:', events.filter((e: any) => e.isDefault).length);

    this.calendarOptions = {
      plugins: [
        dayGridPlugin,
        timeGridPlugin,
        listPlugin,
        interactionPlugin
      ],

      initialView: 'dayGridMonth',

      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek shareButton'
      },

      customButtons: {
        shareButton: {
          text: '🔗 Share',
          hint: 'Share this logbook',
          click: () => {
            this.openShareModal();
          }
        }
      },

      editable: true,
      selectable: true,
      events: events,
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      },
      dateClick: this.handleDateClick.bind(this),
      eventClick: this.handleEventClick.bind(this)
    };

    this.calendarInitialized = true;
    console.log('Calendar initialized with events:', events.length);
  }

  handleDateClick(arg: any) {
    this.selectedDate = arg.dateStr;

    // Cek apakah tanggal sudah memiliki aktivitas
    const existingActivity = this.detailLogbooks.find((detail: DetailLogbookResponse) =>
      this.formatDateForCalendar(detail.date) === arg.dateStr
    );

    if (existingActivity) {
      this.viewActivityDetail(existingActivity.id);
    } else {
      this.openCreateActivityModal(arg.dateStr);
    }
  }

  handleEventClick(arg: any) {
    const event = arg.event;

    if (event.extendedProps?.isDetail && event.extendedProps?.detailId) {
      const detailId = event.extendedProps.detailId;
      this.viewActivityDetail(detailId);
      return;
    }

    if (event.extendedProps?.isDefault) {
      this.selectedDate = event.startStr.split('T')[0];
      this.openCreateActivityModal(this.selectedDate);
    }
  }

  // ============= SINGLE ACTIVITY MODAL METHODS =============

  openCreateActivityModal(date?: string): void {
    this.isEditMode = false;
    this.selectedActivityId = null;
    this.activityForm = {
      date: date || new Date().toISOString().split('T')[0],
      deskripsi: '',
      kendala: '',
      statusAttend: 'Present',
      timeStart: '',
      timeEnd: '',
      status: 'On Progress'
    };
    this.isActivityModalOpen = true;
  }

  viewActivityDetail(id: number): void {
    this.loading = true;
    this.logbookService.getDetailLogbookById(id).subscribe({
      next: (response: DetailLogbookResponse) => {
        console.log('Activity detail loaded:', response);
        this.isEditMode = true;
        this.selectedActivityId = response.id;

        // Format date untuk input (YYYY-MM-DD)
        const dateStr = this.formatDateForInput(response.date);

        this.activityForm = {
          date: dateStr,
          deskripsi: response.deskripsi || '',
          kendala: response.kendala || '',
          statusAttend: response.statusAttend || 'Present',
          timeStart: this.formatTimeForInput(response.timeStart),
          timeEnd: this.formatTimeForInput(response.timeEnd),
          status: response.status || 'On Progress'
        };

        this.isActivityModalOpen = true;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading activity detail:', error);
        this.alertService.error(error.error?.message || 'Failed to load activity detail');
        this.loading = false;
      }
    });
  }

  closeActivityModal(): void {
    this.isActivityModalOpen = false;
    this.isEditMode = false;
    this.selectedActivityId = null;
    this.isSubmittingActivity = false;
    this.activityForm = {
      date: '',
      deskripsi: '',
      kendala: '',
      statusAttend: 'Present',
      timeStart: '',
      timeEnd: '',
      status: 'On Progress'
    };
  }

  onSubmitActivity(): void {
    if (!this.activityForm.deskripsi) {
      this.alertService.error('Please enter description');
      return;
    }

    if (!this.activityForm.timeStart) {
      this.alertService.error('Please enter start time');
      return;
    }

    if (!this.activityForm.timeEnd) {
      this.alertService.error('Please enter end time');
      return;
    }

    this.isSubmittingActivity = true;

    const timeStartFormatted = this.formatTimeToTimeSpan(this.activityForm.timeStart);
    const timeEndFormatted = this.formatTimeToTimeSpan(this.activityForm.timeEnd);

    // Format date dengan benar (ISO string)
    const dateObj = new Date(this.activityForm.date);
    const dateFormatted = dateObj.toISOString();

    const requestData = {
      date: dateFormatted,
      deskripsi: this.activityForm.deskripsi,
      kendala: this.activityForm.kendala || '',
      statusAttend: this.activityForm.statusAttend,
      timeStart: timeStartFormatted,
      timeEnd: timeEndFormatted,
      status: this.activityForm.status
    };

    if (this.isEditMode && this.selectedActivityId) {
      console.log('Updating detail logbook:', requestData);
      this.logbookService.updateDetailLogbook(this.selectedActivityId, requestData).subscribe({
        next: (response: DetailLogbookResponse) => {
          console.log('Detail logbook updated:', response);
          this.alertService.success('Activity updated successfully!');
          this.isSubmittingActivity = false;
          this.closeActivityModal();
          this.loadDetailLogbooks();
          setTimeout(() => {
            this.initializeCalendar();
          }, 200);
        },
        error: (error: any) => {
          console.error('Error updating activity:', error);
          this.handleActivityError(error);
          this.isSubmittingActivity = false;
        }
      });
    } else {
      console.log('Creating detail logbook:', requestData);
      this.logbookService.createDetailLogbook(this.kodeLogbook, requestData).subscribe({
        next: (response: DetailLogbookResponse) => {
          console.log('Detail logbook created:', response);
          this.alertService.success('Activity created successfully!');
          this.isSubmittingActivity = false;
          this.closeActivityModal();
          this.loadDetailLogbooks();
          setTimeout(() => {
            this.initializeCalendar();
          }, 200);
        },
        error: (error: any) => {
          console.error('Error creating activity:', error);
          this.handleActivityError(error);
          this.isSubmittingActivity = false;
        }
      });
    }
  }

  private handleActivityError(error: any): void {
    let errorMessage = 'Failed to save activity';
    if (error.error?.errors) {
      const errors = error.error.errors;
      const errorMessages = Object.values(errors).flat();
      errorMessage = errorMessages.join('. ');
    } else if (error.error?.title) {
      errorMessage = error.error.title;
    } else if (error.message) {
      errorMessage = error.message;
    }
    this.alertService.error(errorMessage);
  }

  private formatTimeToTimeSpan(time: string): string {
    const parts = time.split(':');
    const hours = parts[0].padStart(2, '0');
    const minutes = parts[1].padStart(2, '0');
    return `${hours}:${minutes}:00`;
  }

  private formatTimeForInput(time: string): string {
    if (!time) return '';
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  }

  // ============= SHARE MODAL METHODS =============
  openShareModal(): void {
    console.log('=== OPEN SHARE MODAL ===');
    console.log('KodeLogbook:', this.kodeLogbook);
    console.log('Logbook data:', this.logbook);

    this.isShareModalOpen = true;
    this.shareStep = 'select-role';
    this.shareData = {
      selectedRole: '',
      selectedUsername: '',
      permission: 'Read'
    };
    this.usersByRole = [];
    console.log('Share modal opened, step: select-role');
    this.loadSharedUsers();
  }

  closeShareModal(): void {
    console.log('=== CLOSE SHARE MODAL ===');
    this.isShareModalOpen = false;
    this.shareStep = 'select-role';
    this.isSharing = false;
    this.isLoadingUsers = false;
    this.shareData = {
      selectedRole: '',
      selectedUsername: '',
      permission: 'Read'
    };
    this.usersByRole = [];
    console.log('Share modal closed');
  }

  loadSharedUsers(): void {
    this.isLoadingShared = true;
    console.log('Loading shared users for kode:', this.kodeLogbook);

    this.logbookService.getSharedLogbooks(this.kodeLogbook).subscribe({
      next: (response: SharedResponse[]) => {
        console.log('Shared users loaded:', response);
        this.sharedUsers = response || [];
        this.isLoadingShared = false;
        console.log('Total shared users:', this.sharedUsers.length);
      },
      error: (error: any) => {
        console.error('Error loading shared users:', error);
        // Jika error 404 atau 500, set array kosong
        this.sharedUsers = [];
        this.isLoadingShared = false;
      }
    });
  }

  // Pilih role, lalu load users berdasarkan role
  selectRole(role: string): void {
    console.log('=== SELECT ROLE ===');
    console.log('Selected role:', role);
    console.log('KodeLogbook:', this.kodeLogbook);

    this.shareData.selectedRole = role;
    this.isLoadingUsers = true;
    console.log('Loading users with role:', role);

    this.userService.getUsersByRole(role).subscribe({
      next: (users: UserByRole[]) => {
        console.log('=== USERS LOADED ===');
        console.log('Role:', role);
        console.log('Users found:', users);
        console.log('Total users:', users.length);

        // Log detail setiap user
        users.forEach((user, index) => {
          console.log(`User ${index + 1}:`, {
            username: user.username,
            role: user.role
          });
        });

        this.usersByRole = users;
        this.isLoadingUsers = false;
        this.shareStep = 'select-user';
        console.log('Step changed to: select-user');
      },
      error: (error: any) => {
        console.error('=== ERROR LOADING USERS ===');
        console.error('Role:', role);
        console.error('Error:', error);
        this.alertService.error('Failed to load users');
        this.isLoadingUsers = false;
      }
    });
  }

  removeSharedUser(idShared: number): void {
    console.log('=== REMOVE SHARED USER ===');
    console.log('ID Shared:', idShared);
    console.log('KodeLogbook:', this.kodeLogbook);

    if (confirm('Are you sure you want to remove this user\'s access?')) {
      console.log('User confirmed deletion');
      this.isLoadingShared = true;

      this.logbookService.deleteSharedLogbook(this.kodeLogbook, idShared).subscribe({
        next: (response: any) => {
          console.log('=== DELETE SUCCESS ===');
          console.log('Response:', response);
          this.alertService.success('User access removed successfully!');
          this.loadSharedUsers(); // Refresh list
        },
        error: (error: any) => {
          console.error('=== DELETE ERROR ===');
          console.error('Error:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);

          if (error.error) {
            console.error('Error body:', error.error);
          }

          let errorMessage = 'Failed to remove user access';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.alertService.error(errorMessage);
          this.isLoadingShared = false;
        }
      });
    } else {
      console.log('User cancelled deletion');
    }
  }

  // Pilih user yang akan di-share
  selectUser(username: string): void {
    console.log('=== SELECT USER ===');
    console.log('Selected username:', username);
    console.log('Current selected role:', this.shareData.selectedRole);
    console.log('Available users:', this.usersByRole);

    this.shareData.selectedUsername = username;

    // Cari user yang dipilih
    const selectedUser = this.usersByRole.find(u => u.username === username);
    console.log('Selected user details:', selectedUser);
  }

  isUserSelected(username: string): boolean {
    const isSelected = this.shareData.selectedUsername === username;
    if (isSelected) {
      console.log('User is selected:', username);
    }
    return isSelected;
  }

  goBackToRoleSelection(): void {
    console.log('=== GO BACK TO ROLE SELECTION ===');
    console.log('Current step:', this.shareStep);
    this.shareStep = 'select-role';
    this.usersByRole = [];
    this.shareData.selectedUsername = '';
    console.log('Step changed to: select-role');
  }

  onSubmitShare(): void {
    console.log('=== SUBMIT SHARE ===');
    console.log('KodeLogbook:', this.kodeLogbook);
    console.log('Share Data:', {
      selectedUsername: this.shareData.selectedUsername,
      permission: this.shareData.permission
    });

    // Validasi
    if (!this.shareData.selectedUsername) {
      console.warn('Validation failed: No user selected');
      this.alertService.error('Please select a user');
      return;
    }


    console.log('Validation passed, preparing payload...');
    this.isSharing = true;

    // Prepare payload
    const sharePayload: CreateSharedRequest = {
      sharedWith: this.shareData.selectedUsername,
      permission: this.shareData.permission || 'Read'
    };

    console.log('=== SHARE PAYLOAD ===');
    console.log('Endpoint:', `Shared/${this.kodeLogbook}/create`);
    console.log('Payload:', sharePayload);
    console.log('Payload as JSON:', JSON.stringify(sharePayload, null, 2));

    this.logbookService.shareLogbook(this.kodeLogbook, sharePayload).subscribe({
      next: (response: SharedResponse) => {
        console.log('=== SHARE SUCCESS ===');
        console.log('Response:', response);
        console.log('Shared to:', response.sharedWith);
        console.log('Permission:', response.permission);
        console.log('Shared by:', response.sharedBy);
        console.log('Created at:', response.createdAt);

        this.alertService.success(`Logbook shared successfully to ${this.shareData.selectedUsername}!`);
        this.isSharing = false;
        this.closeShareModal();
        console.log('Share modal closed after success');
      },
      error: (error: any) => {
        console.error('=== SHARE ERROR ===');
        console.error('Error object:', error);
        console.error('Error status:', error.status);
        console.error('Error status text:', error.statusText);
        console.error('Error message:', error.message);

        if (error.error) {
          console.error('Error response body:', error.error);
          if (typeof error.error === 'object') {
            console.error('Error details:', JSON.stringify(error.error, null, 2));
          }
        }

        let errorMessage = 'Failed to share logbook';
        if (error.error?.message) {
          errorMessage = error.error.message;
          console.log('Using error message from server:', errorMessage);
        } else if (error.message) {
          errorMessage = error.message;
          console.log('Using error message from error object:', errorMessage);
        }

        this.alertService.error(errorMessage);
        this.isSharing = false;
        console.log('Share failed, error state reset');
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Ongoing': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Lagging': 'bg-red-100 text-red-800',
      'On Progress': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getEventColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Present': 'bg-green-500 text-white',
      'Absent': 'bg-red-500 text-white',
      'Late': 'bg-yellow-500 text-white',
      'Leave': 'bg-purple-500 text-white',
      'Hadir': 'bg-green-500 text-white'
    };
    return colors[status] || 'bg-blue-500 text-white';
  }

  getAttendStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Present': 'bg-green-100 text-green-800',
      'Absent': 'bg-red-100 text-red-800',
      'Late': 'bg-yellow-100 text-yellow-800',
      'Leave': 'bg-purple-100 text-purple-800',
      'Hadir': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  goBack(): void {
    this.router.navigate(['/logbook']);
  }

  formatDate(date: string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
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
}
