import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface MenuItem {
  path: string;
  label: string;
  icon: string;
  active?: boolean;
  children?: SubMenuItem[];
}

export interface SubMenuItem {
  path: string;
  label: string;
  active?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  currentUrl: string = '';

  menuItems: MenuItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: 'M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z'
    },
    {
      path: '/logbook',
      label: 'Logbook',
      icon: 'M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zm-1 4v2h-5V7h5zm-5 4h5v2h-5v-2zM4 19V5h7v14H4z',
    },
    {
      path: '/monev',
      label: 'Monev',
      icon: 'M9 21h12V3H3v18h6zm10-4v2h-6v-6h6v4zM15 5h4v6h-6V5h2zM5 7V5h6v6H5V7zm0 12v-6h6v6H5z',
    },
    {
      path: '/list-user',
      label: 'Users',
      icon: 'M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z'
    },
  ];

  constructor(private router: Router) {
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects || event.url;
      this.updateActiveStates();
    });
  }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.updateActiveStates();
  }

  updateActiveStates(): void {
    // Reset semua active states
    this.menuItems.forEach(item => {
      item.active = false;
      if (item.children) {
        item.children.forEach(child => {
          child.active = false;
        });
      }
    });

    // Set active berdasarkan current URL
    const currentPath = this.currentUrl.split('?')[0];

    this.menuItems.forEach(item => {
      // Cek apakah menu aktif (exact match atau parent)
      if (item.path === currentPath) {
        item.active = true;
      }

      // Cek children
      if (item.children) {
        item.children.forEach(child => {
          if (child.path === currentPath) {
            child.active = true;
            item.active = true; // Parent juga aktif
          }
        });
      }

      // Cek partial match untuk parent
      if (item.path !== '/' && currentPath.startsWith(item.path) && item.path !== '/logbook') {
        item.active = true;
      }

      // Special case untuk logbook (karena ada detail page)
      if (item.path === '/logbook' && currentPath.startsWith('/logbook/')) {
        item.active = true;
        if (item.children) {
          item.children.forEach(child => {
            if (child.path === '/logbook') {
              child.active = true;
            }
          });
        }
      }
    });
  }

  isActive(menuItem: MenuItem): boolean {
    return menuItem.active || false;
  }

  isChildActive(child: SubMenuItem): boolean {
    return child.active || false;
  }

  hasActiveChild(menuItem: MenuItem): boolean {
    if (!menuItem.children) return false;
    return menuItem.children.some(child => child.active);
  }

  toggleMenu(menuItem: MenuItem): void {
    // Toggle untuk expand/collapse jika memiliki children
    if (menuItem.children) {
      menuItem.active = !menuItem.active;
    }
  }
}
