import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.model';
import { LogbookService } from '../../../logbook/services/logbook.service';
import { MonevService } from '../../../monev/services/monev.service';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: User | null = null;

  // Statistics
  totalLogbooks: number = 0;
  totalActivities: number = 0;
  totalMonev: number = 0;
  totalShared: number = 0;

  // Recent data
  recentLogbooks: any[] = [];
  recentActivities: any[] = [];

  loading: boolean = true;

  // Chart data (dummy untuk sekarang)
  chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [12, 19, 15, 22, 18, 8, 14]
  };

  constructor(
    private authService: AuthService,
    private logbookService: LogbookService,
    private monevService: MonevService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    console.log('Dashboard: User data:', this.user);

    if (this.user) {
      this.loadDashboardData();
    }
  }

  loadDashboardData(): void {
    this.loading = true;

    // Load logbooks
    this.logbookService.getMyLogbooks().subscribe({
      next: (logbooks) => {
        console.log('Logbooks loaded:', logbooks);
        this.totalLogbooks = logbooks?.length || 0;
        this.recentLogbooks = logbooks?.slice(0, 5) || [];

        // Load monev setelah logbooks
        this.loadMonevData();
      },
      error: (error) => {
        console.error('Error loading logbooks:', error);
        this.loadMonevData();
      }
    });
  }

  loadMonevData(): void {
    if (!this.user?.username) {
      this.loading = false;
      return;
    }

    this.monevService.getMonevWithLogbook(this.user.username).subscribe({
      next: (response) => {
        console.log('Monev data loaded:', response);
        this.totalMonev = response.totalData || 0;
        this.totalActivities = response.data?.length || 0;

        // Hitung total shared
        const sharedUsers = new Set();
        response.data?.forEach((item: any) => {
          if (item.sharedWith) {
            sharedUsers.add(item.sharedWith);
          }
        });
        this.totalShared = sharedUsers.size;

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading monev:', error);
        this.loading = false;
      }
    });
  }

  getWelcomeMessage(): string {
    if (!this.user) return 'Welcome!';

    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
    else if (hour >= 17) greeting = 'Good Evening';

    return `${greeting}, ${this.user.username || 'User'}!`;
  }

  getRoleBadgeClass(role: string): string {
    const classes: { [key: string]: string } = {
      'Admin': 'bg-purple-100 text-purple-800',
      'Mentor': 'bg-blue-100 text-blue-800',
      'Supervisor': 'bg-green-100 text-green-800',
      'Dosen Pembimbing': 'bg-indigo-100 text-indigo-800',
      'User': 'bg-gray-100 text-gray-800'
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Ongoing': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'On Progress': 'bg-purple-100 text-purple-800'
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
}
