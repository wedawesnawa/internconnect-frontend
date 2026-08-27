import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { MonevService } from '../../services/monev.service';
import { MonevWithLogbookItem } from '../../models/monev.model';
import { AlertService } from '../../../../shared/services/alert.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-monev',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule, CardComponent],
  templateUrl: './monev.component.html',
  styleUrl: './monev.component.css'
})
export class MonevComponent implements OnInit {
  // Data
  allMonevItems: MonevWithLogbookItem[] = [];
  filteredMonevItems: MonevWithLogbookItem[] = [];
  loading: boolean = false;
  totalItems: number = 0;

  // Calendar
  calendarOptions!: CalendarOptions;
  calendarEvents: any[] = [];
  currentUsername: string = '';

  // Current month/year
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();

  constructor(
    private monevService: MonevService,
    private alertService: AlertService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeCalendar();
    this.loadMonevData();
  }

  initializeCalendar(): void {
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      plugins: [dayGridPlugin, interactionPlugin],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth'
      },
      events: this.calendarEvents,
      dateClick: this.handleDateClick.bind(this),
      eventClick: this.handleEventClick.bind(this),
      datesSet: this.handleDatesSet.bind(this)
    };
  }

  loadMonevData(): void {
    // Ambil user yang sedang login
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.alertService.error('User not authenticated');
      return;
    }

    this.currentUsername = currentUser.username;
    if (!this.currentUsername) {
      this.alertService.error('Username not found');
      return;
    }

    this.loading = true;
    console.log('Loading monev for username:', this.currentUsername);

    this.monevService.getMonevWithLogbook(this.currentUsername).subscribe({
      next: (response) => {
        console.log('Monev data loaded:', response);
        this.allMonevItems = response.data || [];
        this.filterByCurrentMonth();
        this.updateCalendarEvents();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading monev:', error);
        this.alertService.error(error.error?.message || 'Failed to load monev data');
        this.allMonevItems = [];
        this.filteredMonevItems = [];
        this.totalItems = 0;
        this.loading = false;
      }
    });
  }

  // Filter data berdasarkan bulan dan tahun yang dipilih
  filterByMonth(month?: number, year?: number): void {
    const filterMonth = month !== undefined ? month : this.currentMonth;
    const filterYear = year !== undefined ? year : this.currentYear;

    this.currentMonth = filterMonth;
    this.currentYear = filterYear;

    this.filteredMonevItems = this.allMonevItems.filter(item => {
      const date = new Date(item.date);
      return date.getMonth() === filterMonth && date.getFullYear() === filterYear;
    });

    console.log(`Filtered ${this.filteredMonevItems.length} items for month ${filterMonth + 1}/${filterYear}`);
  }

  filterByCurrentMonth(): void {
    this.filterByMonth(this.currentMonth, this.currentYear);
  }

  updateCalendarEvents(): void {
    this.calendarEvents = this.filteredMonevItems.map(item => {
      const date = new Date(item.date);
      const dateStr = date.toISOString().split('T')[0];

      return {
        title: `📅 ${item.timeStart} - ${item.timeEnd}`,
        date: dateStr,
        extendedProps: {
          idMonev: item.idMonev,
          timeStart: item.timeStart,
          timeEnd: item.timeEnd,
          roomUrl: item.roomUrl,
          kodeLogbook: item.kodeLogbook,
        }
      };
    });

    if (this.calendarOptions) {
      this.calendarOptions.events = this.calendarEvents;
    }
  }

  // ============= CALENDAR EVENT HANDLERS =============

  handleDateClick(info: any): void {
    console.log('Tanggal dipilih:', info.dateStr);
    // this.selectedDate = info.dateStr;

    const monevForDate = this.filteredMonevItems.filter(item => {
      const itemDate = new Date(item.date).toISOString().split('T')[0];
      return itemDate === info.dateStr;
    });

    if (monevForDate.length > 0) {
      console.log('Monev found for date:', monevForDate);
    } else {
      console.log('No monev for this date');
    }
  }

  handleEventClick(info: any): void {
    console.log('Event dipilih:', info.event.title);
    const props = info.event.extendedProps;
    console.log('Event details:', props);
  }

  handleDatesSet(info: any): void {
    // Ketika user navigasi ke bulan lain, update filter
    const currentDate = info.view.currentStart;
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    console.log(`Calendar view changed to: ${month + 1}/${year}`);

    if (month !== this.currentMonth || year !== this.currentYear) {
      this.filterByMonth(month, year);
      this.updateCalendarEvents();
    }
  }

  // ============= HELPER METHODS =============

  getTimeDisplay(time: string): string {
    if (!time) return '-';
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Ongoing': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getUniqueLogbooks(): string[] {
    const logbooks = this.filteredMonevItems.map(item => item.kodeLogbook);
    return [...new Set(logbooks)];
  }

  getUniqueLogbookCount(): number {
    return this.getUniqueLogbooks().length;
  }
}
