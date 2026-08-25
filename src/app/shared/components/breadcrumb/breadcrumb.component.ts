import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="flex px-5 py-3 text-gray-700 border border-gray-200 rounded-lg bg-gray-50" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-3">
        <li class="inline-flex items-center">
          <a routerLink="/dashboard" class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
            Dashboard
          </a>
        </li>
        <li *ngFor="let breadcrumb of breadcrumbs; let last = last">
          <div class="flex items-center">
            <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
            <span *ngIf="!last" class="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
              <a [routerLink]="breadcrumb.url">{{ breadcrumb.label }}</a>
            </span>
            <span *ngIf="last" class="ml-1 text-sm font-medium text-gray-500 md:ml-2">
              {{ breadcrumb.label }}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  `,
  styles: []
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.buildBreadcrumb();
    });
  }

  private buildBreadcrumb(): void {
    const url = this.router.url;
    const segments = url.split('/').filter(s => s);

    this.breadcrumbs = [];
    let currentUrl = '';

    segments.forEach((segment, index) => {
      currentUrl += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Skip auth routes
      if (segment === 'auth') return;

      let label = this.formatLabel(segment);
      this.breadcrumbs.push({
        label,
        url: isLast ? '' : currentUrl
      });
    });
  }

  private formatLabel(segment: string): string {
    const labels: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'logbook': 'Logbook',
      'profile': 'Profile',
      'setting': 'Settings',
      'users': 'Users',
      'monev': 'Monev'
    };
    return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  }
}
