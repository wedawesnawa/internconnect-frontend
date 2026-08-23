import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/auth.model';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  user: User | null = null;
  isAuthenticated: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe ke auth state
    this.authService.authState$.subscribe(state => {
      this.isAuthenticated = state.isAuthenticated;
      this.user = state.user;
    });

    // Cek langsung dari localStorage
    this.user = this.authService.getCurrentUser();
    this.isAuthenticated = !!this.user;
  }

  get userInitial(): string {
    return this.user?.username?.charAt(0)?.toUpperCase() || 'U';
  }

  get username(): string {
    return this.user?.username || 'User';
  }

  logout(): void {
    this.authService.logout();
    // Navigasi akan dihandle di service
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToSettings(): void {
    this.router.navigate(['/setting']);
  }
}
