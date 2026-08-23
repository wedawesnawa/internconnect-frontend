import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../feature/auth/services/auth.service';
import { User } from '../../../../feature/auth/models/auth.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  user: User | null = null;
  userInitial: string = 'U';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Ambil user data dari auth service
    this.user = this.authService.getCurrentUser();

    // Subscribe ke perubahan auth state
    this.authService.authState$.subscribe(state => {
      this.user = state.user;
      if (this.user?.username) {
        this.userInitial = this.user.username.charAt(0).toUpperCase();
      }
    });
  }

  get userUsername(): string {
    return this.user?.username || 'User';
  }

  get userRole(): string {
    return this.user?.role || '';
  }

  get userEmail(): string {
    return this.user?.email || '';
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToSettings(): void {
    this.router.navigate(['/setting']);
  }
}
