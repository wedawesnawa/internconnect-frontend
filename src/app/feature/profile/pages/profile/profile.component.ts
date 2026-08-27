import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { Profile, UpdateProfileRequest } from '../../models/profile.model';
import { AlertService } from '../../../../shared/services/alert.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ProfileCheckService } from '../../services/profile-check.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: Profile | null = null;
  isEditing: boolean = false;
  loading: boolean = false;
  isSaving: boolean = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // Form data untuk edit
  editData: UpdateProfileRequest = {
    nama: '',
    telp: '',
    bio: '',
    alamat: '',
    instansi: '',
    alamatInstansi: ''
  };

  constructor(
    private profileService: ProfileService,
    private alertService: AlertService,
    private authService: AuthService,
    private profileCheckService: ProfileCheckService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.profileService.getProfile().subscribe({
      next: (data: Profile) => {
        console.log('Profile loaded:', data);
        this.profile = data;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading profile:', error);
        // Jika profile belum ada, buat profile baru dengan data default
        if (error.status === 404) {
          this.createDefaultProfile();
        } else {
          this.alertService.error(error.error?.message || 'Failed to load profile');
        }
        this.loading = false;
      }
    });
  }

  createDefaultProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    const defaultData: UpdateProfileRequest = {
      nama: currentUser?.username || '',
      telp: '',
      bio: '',
      alamat: '',
      instansi: '',
      alamatInstansi: ''
    };

    this.profileService.createProfile(defaultData).subscribe({
      next: (data: Profile) => {
        console.log('Default profile created:', data);
        this.profile = data;
        this.alertService.success('Profile created successfully!');
      },
      error: (error: any) => {
        console.error('Error creating profile:', error);
        this.alertService.error(error.error?.message || 'Failed to create profile');
      }
    });
  }

  startEdit(): void {
    if (!this.profile) return;
    this.isEditing = true;
    this.editData = {
      nama: this.profile.nama || '',
      telp: this.profile.telp || '',
      bio: this.profile.bio || '',
      alamat: this.profile.alamat || '',
      instansi: this.profile.instansi || '',
      alamatInstansi: this.profile.alamatInstansi || ''
    };
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editData = {
      nama: '',
      telp: '',
      bio: '',
      alamat: '',
      instansi: '',
      alamatInstansi: ''
    };
    this.selectedFile = null;
    this.previewUrl = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadProfilePicture(): void {
    if (!this.selectedFile) return;

    this.isSaving = true;
    this.profileService.uploadProfilePicture(this.selectedFile).subscribe({
      next: (response) => {
        console.log('Profile picture uploaded:', response);
        if (this.profile) {
          this.profile.profileUrl = response.profileUrl;
        }
        this.alertService.success('Profile picture updated!');
        this.selectedFile = null;
        this.previewUrl = null;
        this.isSaving = false;
      },
      error: (error: any) => {
        console.error('Error uploading profile picture:', error);
        this.alertService.error(error.error?.message || 'Failed to upload profile picture');
        this.isSaving = false;
      }
    });
  }

  saveProfile(): void {
    if (!this.profile) return;

    this.isSaving = true;

    // Cek apakah ada perubahan
    const hasChanges = Object.keys(this.editData).some(key => {
      const k = key as keyof UpdateProfileRequest;
      return this.editData[k] !== (this.profile?.[k as keyof Profile] || '');
    });

    if (!hasChanges && !this.selectedFile) {
      this.alertService.warning('No changes to save');
      this.isSaving = false;
      return;
    }

    // Update profile data
    this.profileService.updateProfile(this.editData).subscribe({
      next: (data: Profile) => {
        console.log('Profile updated:', data);
        this.profile = data;
        this.isEditing = false;
        this.isSaving = false;
        this.alertService.success('Profile updated successfully!');

        // Upload profile picture jika ada
        if (this.selectedFile) {
          this.uploadProfilePicture();
        }
        this.profileCheckService.resetAlertHistory();
      },
      error: (error: any) => {
        console.error('Error updating profile:', error);
        this.alertService.error(error.error?.message || 'Failed to update profile');
        this.isSaving = false;
      }
    });
  }

  getInitials(): string {
    if (!this.profile?.username) return 'U';
    const names = this.profile.username.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  getProfileImage(): string {
    if (this.previewUrl) return this.previewUrl;
    if (this.profile?.profileUrl) {
      return `http://localhost:5000/${this.profile.profileUrl}`;
    }
    return '';
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}
