import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { UserByRole } from '../../logbook/models/logbook.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apiService: ApiService) {}

  /**
   * Get users by role
   */
  getUsersByRole(role: string): Observable<UserByRole[]> {
    return this.apiService.get<UserByRole[]>(`User/by-role?role=${role}`, undefined, { withCredentials: true });
  }

  /**
   * Get all users
   */
  getUsers(params?: any): Observable<any> {
    return this.apiService.get('User', params, { withCredentials: true });
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): Observable<any> {
    return this.apiService.get(`User/${id}`, undefined, { withCredentials: true });
  }
}
