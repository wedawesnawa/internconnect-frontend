import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { UserByRole } from '../../logbook/models/logbook.model';
import { RelationResponse } from '../models/user.model';

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

  getRelations(): Observable<RelationResponse> {
    console.log('=== GET RELATIONS ===');
    return this.apiService.get<RelationResponse>('Dosen/relation', undefined, { withCredentials: true });
  }

  downloadFile(fileName: string): Observable<Blob> {
    console.log('=== DOWNLOAD FILE FROM MINIO ===');
    console.log('File name:', fileName);
    console.log('Endpoint:', `UserDetail/download-file/${fileName}`);

    return this.apiService.getBlob(
      `UserDetail/download-file?filePath=${fileName}`,
      { withCredentials: true }
    );
  }

  getFileUrl(fileName: string): Observable<{ url: string }> {
    console.log('=== GET FILE URL FROM MINIO ===');
    console.log('File name:', fileName);
    console.log('Endpoint:', `UserDetail/file-url/${fileName}`);

    return this.apiService.get<{ url: string }>(
      `UserDetail/file-url?filePath=${fileName}`,
      undefined,
      { withCredentials: true }
    );
  }
}
