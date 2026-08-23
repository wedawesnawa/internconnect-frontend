import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import {
  RegisterRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  User,
  AuthState
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  });

  authState$ = this.authState.asObservable();

  constructor(private apiService: ApiService) {
    this.loadSession();
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    this.setLoading(true);
    this.clearError();

    return this.apiService.post<AuthResponse>('Account/register', data).pipe(
      tap((response: AuthResponse) => {
        this.setLoading(false);
        this.clearError();
        console.log('Registration successful:', response);
      }),
      catchError((error: any) => {
        this.setLoading(false);
        this.setError(error);
        return throwError(() => error);
      })
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    this.setLoading(true);
    this.clearError();

    return this.apiService.post<AuthResponse>('Account/login', data, { withCredentials: true }).pipe(
      tap((response: AuthResponse) => {
        console.log('Login response:', response);

        // Simpan user data ke localStorage
        if (response.user) {
          this.saveUser(response.user);
          this.updateAuthState(response.user, null, true);
          console.log('User saved to localStorage:', response.user);
        }

        this.setLoading(false);
        console.log('Login successful');
      }),
      catchError((error: any) => {
        this.setLoading(false);
        this.setError(error);
        return throwError(() => error);
      })
    );
  }

  async logout(): Promise<void> {
    try {
      await this.apiService.post('Account/logout', {}, { withCredentials: true }).toPromise();
      console.log('Logout successful from server');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Tetap hapus session lokal
      this.clearSession();
      this.updateAuthState(null, null, false);
    }
  }

  // Session Management
  private saveUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  private loadSession(): void {
    const userStr = localStorage.getItem('user');

    if (userStr) {
      try {
        const user: User = JSON.parse(userStr);
        this.updateAuthState(user, null, true);
        console.log('Session loaded from localStorage');
      } catch (e) {
        console.error('Error parsing user data:', e);
        this.clearSession();
      }
    } else {
      console.log('No session found in localStorage');
    }
  }

  private clearSession(): void {
    localStorage.removeItem('user');
    console.log('Session cleared');
  }

  // State Management
  private updateAuthState(user: User | null, token: string | null, isAuthenticated: boolean): void {
    this.authState.next({
      user,
      token,
      isAuthenticated,
      loading: this.authState.value.loading,
      error: this.authState.value.error
    });
    console.log('Auth state updated:', this.authState.value);
  }

  private setLoading(loading: boolean): void {
    this.authState.next({
      ...this.authState.value,
      loading
    });
  }

  private setError(error: any): void {
    let errorMessage = 'An error occurred';

    if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error.errors) {
        const errors = error.error.errors;
        const firstError = Object.values(errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      } else if (error.error.title) {
        errorMessage = error.error.title;
      }
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status === 401) {
      errorMessage = 'Invalid credentials';
    } else if (error.status === 500) {
      errorMessage = 'Internal server error';
    }

    this.authState.next({
      ...this.authState.value,
      error: errorMessage
    });
  }

  private clearError(): void {
    this.authState.next({
      ...this.authState.value,
      error: null
    });
  }

  // Getter Methods
  getToken(): string | null {
    return null;
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getUser();
  }

  getAuthState(): AuthState {
    return this.authState.value;
  }

  getCurrentUser(): User | null {
    return this.getUser();
  }

  updateUserProfile(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.authState.next({
      ...this.authState.value,
      user
    });
  }
}
