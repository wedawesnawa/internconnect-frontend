import { initFlowbite } from 'flowbite';
import { ThemeService } from './core/services/theme.service';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertContainerComponent } from './shared/components/alert/alert-container.component';
import { ProfileCheckService } from './feature/profile/services/profile-check.service';
import { AuthService } from './feature/auth/services/auth.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, AlertContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  title = 'web-app';
  isLoading = false;

  constructor(
    private themeService: ThemeService,
    private router: Router,
    private profileCheckService: ProfileCheckService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    initFlowbite();

    const htmlElement = document.documentElement;
    htmlElement.classList.add('dark');

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isLoading = false;
        // Check profile setelah navigasi selesai
        if (this.authService.isAuthenticated()) {
          // Jangan cek di halaman profile
          const currentUrl = this.router.url;
          if (!currentUrl.includes('/profile')) {
            this.profileCheckService.resetSessionFlag();
            this.profileCheckService.loadAndCheckProfile();
          }
        }
      }
    });
    if (this.authService.isAuthenticated()) {
      setTimeout(() => {
        const currentUrl = this.router.url;
        if (!currentUrl.includes('/profile')) {
          this.profileCheckService.loadAndCheckProfile();
        }
      }, 1000);
    }
  }
}
