import { initFlowbite } from 'flowbite';
import { ThemeService } from './core/services/theme.service';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertContainerComponent } from './shared/components/alert/alert-container.component';

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

  constructor(private themeService: ThemeService, private router: Router) {}

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
      }
    });
  }
}
