import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-gray-800 dark:text-white">404</h1>
        <h2 class="text-2xl font-semibold text-gray-600 dark:text-gray-300 mt-4">Page Not Found</h2>
        <p class="text-gray-500 dark:text-gray-400 mt-2">The page you are looking for does not exist.</p>
        <a
          routerLink="/"
          class="inline-block mt-6 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Home
        </a>
      </div>
    </div>
  `,
  styles: []
})
export class PageNotFoundComponent {}
