import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Profile, UpdateProfileRequest } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private apiService: ApiService) {}

  /**
   * Get user profile
   * GET /UserDetail
   */
  getProfile(): Observable<Profile> {
    console.log('=== GET PROFILE ===');
    return this.apiService.get<Profile>('UserDetail', undefined, { withCredentials: true });
  }

  getProfileByUsername(username: string): Observable<Profile> {
    console.log('=== GET PROFILE BY USERNAME ===');
    console.log('Username:', username);
    console.log('Endpoint:', `UserDetail/${username}`);

    return this.apiService.get<Profile>(
      `UserDetail/${username}`,
      undefined,
      { withCredentials: true }
    );
  }

  /**
   * Create new profile
   * POST /UserDetail
   */
  createProfile(data: UpdateProfileRequest): Observable<Profile> {
    console.log('=== CREATE PROFILE ===');
    console.log('Data:', data);
    return this.apiService.post<Profile>('UserDetail', data, { withCredentials: true });
  }

  /**
   * Update profile
   * PUT /UserDetail
   */
  updateProfile(data: UpdateProfileRequest): Observable<Profile> {
    console.log('=== UPDATE PROFILE ===');
    console.log('Data:', data);
    return this.apiService.put<Profile>('UserDetail', data, { withCredentials: true });
  }

  /**
   * Upload profile picture
   * POST /UserDetail/upload-profile-picture
   */
  updateProfilePicture(file: File): Observable<{ profileUrl: string; message: string; path: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    console.log('=== UPDATE PROFILE PICTURE ===');
    console.log('File:', file.name);
    console.log('File size:', file.size, 'bytes');
    console.log('File type:', file.type);

    // UBAH: dari POST ke PUT
    return this.apiService.putFormData<{ profileUrl: string; message: string; path: string }>(
      'UserDetail/upload-profile-picture',
      formData,
      { withCredentials: true }
    );
  }
  getProfilePictureUrl(): Observable<{ profileUrl: string }> {
    console.log('=== GET PROFILE PICTURE URL ===');
    return this.apiService.get<{ profileUrl: string }>(
      'UserDetail/profile-picture-url',
      undefined,
      { withCredentials: true }
    );
  }
}
