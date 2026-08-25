import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppState {
  isLoading: boolean;
  isSidebarOpen: boolean;
  currentRoute: string;
  breadcrumbs: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private state = new BehaviorSubject<AppState>({
    isLoading: false,
    isSidebarOpen: true,
    currentRoute: '',
    breadcrumbs: []
  });

  state$ = this.state.asObservable();

  setLoading(loading: boolean): void {
    this.state.next({ ...this.state.value, isLoading: loading });
  }

  setSidebarOpen(open: boolean): void {
    this.state.next({ ...this.state.value, isSidebarOpen: open });
  }

  toggleSidebar(): void {
    this.state.next({ ...this.state.value, isSidebarOpen: !this.state.value.isSidebarOpen });
  }

  setCurrentRoute(route: string): void {
    this.state.next({ ...this.state.value, currentRoute: route });
  }

  setBreadcrumbs(breadcrumbs: string[]): void {
    this.state.next({ ...this.state.value, breadcrumbs });
  }

  getCurrentState(): AppState {
    return this.state.value;
  }
}
