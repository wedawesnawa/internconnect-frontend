import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../feature/auth/services/auth.service';
import { User } from '../../../../feature/auth/models/auth.model';
import { ProfileService } from '../../../../feature/profile/services/profile.service';
import { Subscription } from 'rxjs';

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
export class HeaderComponent implements OnInit, OnDestroy {
  user: User | null = null;
  userInitial: string = 'U';
  profilePictureUrl: string | null = null;
  isLoadingProfile: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private profileService: ProfileService // Inject ProfileService
  ) {}

  ngOnInit(): void {
    // Ambil user data dari auth service
    this.user = this.authService.getCurrentUser();

    // Subscribe ke perubahan auth state
    this.subscriptions.add(
      this.authService.authState$.subscribe(state => {
        this.user = state.user;
        if (this.user?.username) {
          this.userInitial = this.user.username.charAt(0).toUpperCase();
          // Load profile picture saat user berubah
          this.loadProfilePicture();
        }
      })
    );

    // Load profile picture
    this.loadProfilePicture();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Load profile picture from MinIO
   */
  loadProfilePicture(): void {
    if (!this.user?.username) {
      return;
    }

    this.isLoadingProfile = true;

    // Coba ambil URL profile picture
    this.profileService.getProfilePictureUrl().subscribe({
      next: (response) => {
        console.log('Profile picture loaded in header:', response);
        this.profilePictureUrl = response.profileUrl;
        this.isLoadingProfile = false;
      },
      error: (error) => {
        console.error('Error loading profile picture in header:', error);
        // 404 berarti belum ada foto, tidak perlu error
        if (error.status !== 404) {
          console.error('Error loading profile picture:', error);
        }
        this.isLoadingProfile = false;
      }
    });
  }

  /**
   * Get profile image to display
   */
  getProfileImage(): string {
    return this.profilePictureUrl || '';
  }

  /**
   * Get user initial for placeholder
   */
  getInitials(): string {
    if (!this.user?.username) return 'U';
    const names = this.user.username.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
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
    this.router.navigate(['/']);
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
