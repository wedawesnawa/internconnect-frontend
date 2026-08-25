import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';

export const routes: Routes = [

  // =========================
  // PUBLIC ROUTES
  // =========================
  {
    path: '',
    loadComponent: () => import('./feature/landing/pages/landing-page/landing-page.component')
      .then(m => m.LandingPageComponent),
    pathMatch: 'full'
  },
  {
    path: 'update-account',
    loadComponent: () => import('./feature/profile/pages/update-account/update-account.component')
      .then(m => m.UpdateAccountComponent),
    data: { title: 'Update Account' }
  },

  // =========================
  // AUTH ROUTES (LAZY LOADING)
  // =========================
  {
    path: 'auth',
    loadChildren: () => import('./feature/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // =========================
  // MAIN APPLICATION (PROTECTED)
  // =========================
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component')
    .then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./feature/dashboard/pages/dashboard/dashboard.component')
          .then(m => m.DashboardComponent),
        data: { title: 'Dashboard' }
      },
      {
        path: 'logbook',
        loadChildren: () => import('./feature/logbook/logbook.routes').then(m => m.LOGBOOK_ROUTES)
      },
      {
        path: 'monev',
        loadComponent: () => import('./feature/monev/pages/monev/monev.component')
          .then(m => m.MonevComponent),
        data: { title: 'Monev' }
      },
      {
        path: 'monev/:id',
        loadComponent: () => import('./feature/monev/pages/detail-monev/detail-monev.component')
          .then(m => m.DetailMonevComponent),
        data: { title: 'Detail Monev' }
      },
      {
        path: 'profile',
        loadComponent: () => import('./feature/profile/pages/profile/profile.component')
          .then(m => m.ProfileComponent),
        data: { title: 'Profile' }
      },
      // {
      //   path: 'update-account',
      //   loadComponent: () => import('./feature/profile/pages/update-account/update-account.component')
      //     .then(m => m.UpdateAccountComponent),
      //   data: { title: 'Update Account' }
      // },
      {
        path: 'setting',
        loadComponent: () => import('./feature/settings/pages/setting/setting.component')
          .then(m => m.SettingComponent),
        data: { title: 'Settings' }
      },
      {
        path: 'list-user',
        loadComponent: () => import('./feature/users/pages/list-user/list-user.component')
          .then(m => m.ListUserComponent),
        data: { title: 'Users' }
      },
      {
        path: 'list-user/:id',
        loadComponent: () => import('./feature/users/pages/detail-users/detail-users.component')
          .then(m => m.DetailUsersComponent),
        data: { title: 'User Detail' }
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // =========================
  // NOT FOUND
  // =========================
  {
    path: '404',
    loadComponent: () => import('./shared/pages/page-not-found/page-not-found.component')
      .then(m => m.PageNotFoundComponent)
  },
  {
    path: '**',
    redirectTo: '404'
  }
];
