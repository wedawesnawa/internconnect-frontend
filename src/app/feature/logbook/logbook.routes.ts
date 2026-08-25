import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const LOGBOOK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/logbook/logbook.component').then(m => m.LogbookComponent),
    canActivate: [AuthGuard]
  },
  {
    path: ':kodeLogbook',
    loadComponent: () => import('./pages/detail-logbook/detail-logbook.component').then(m => m.DetailLogbookComponent),
    canActivate: [AuthGuard]
  }
];
