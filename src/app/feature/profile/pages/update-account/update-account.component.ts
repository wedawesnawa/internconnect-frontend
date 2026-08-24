import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { User, UserDetail } from '../../../auth/models/auth.model';

@Component({
  selector: 'app-update-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-account.component.html',
  styleUrl: './update-account.component.css'
})
export class UpdateAccountComponent implements OnInit {
  updateForm: FormGroup;
  user: User | null = null;
  userDetail: UserDetail | null = null;
  loading = false;
  successMessage = '';
  errorMessage = '';
  selectedFile: File | null = null;
  fileName = '';
  profileUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.updateForm = this.formBuilder.group({
      role: ['', [Validators.required]],
      instansi: ['', [Validators.required, Validators.minLength(3)]],
      agreeTerms: [false, [Validators.requiredTrue]]
    });
  }

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadUserDetail();
  }

  loadUserDetail(): void {
    this.authService.getUserDetail().subscribe({
      next: (response) => {
        console.log('User detail response:', response);
        this.userDetail = response.userDetail;
        this.profileUrl = response.profileUrl || '';

        if (this.userDetail?.instansi) {
          this.updateForm.patchValue({
            instansi: this.userDetail.instansi
          });
        }
      },
      error: (error) => {
        console.error('Error loading user detail:', error);
      }
    });
  }

  get f() {
    return this.updateForm.controls;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;
      console.log('File selected:', {
        name: this.selectedFile.name,
        size: this.selectedFile.size,
        type: this.selectedFile.type
      });
    }
  }

  onAgreeChange(value: string): void {
    const isAgreed = value === 'yes';
    this.updateForm.patchValue({ agreeTerms: isAgreed });
    this.updateForm.get('agreeTerms')?.updateValueAndValidity();
    console.log('Agree set to:', isAgreed);
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.updateForm.invalid) {
      Object.keys(this.updateForm.controls).forEach(key => {
        const control = this.updateForm.get(key);
        control?.markAsTouched();
      });

      if (this.updateForm.get('agreeTerms')?.invalid) {
        this.errorMessage = 'Please agree to the terms to continue.';
      }
      return;
    }

    this.loading = true;

    try {
      const formData = new FormData();
      formData.append('NewRole', this.updateForm.value.role);
      formData.append('Instansi', this.updateForm.value.instansi);

      if (this.selectedFile) {
        formData.append('File', this.selectedFile, this.selectedFile.name);
      }

      console.log('=== FORM DATA BEING SENT ===');
      formData.forEach((value, key) => {
        if (key === 'File') {
          console.log(`${key}: ${(value as File).name} (${(value as File).size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      });

      this.authService.updateUserRole(formData).subscribe({
        next: (response) => {
          console.log('Update success:', response);
          this.successMessage = '✅ Role updated successfully! Redirecting to login...';
          this.loading = false;

          // === LANGSUNG REDIRECT KE LOGIN ===
          setTimeout(() => {
            // Clear session
            this.authService.logout();
            // Redirect ke login
            this.router.navigate(['/auth/login'], {
              queryParams: {
                message: '✅ Role updated successfully. Please login again with your new role.'
              }
            });
          }, 1500);
        },
        error: (error) => {
          console.error('Update role error:', error);

          if (error.error && typeof error.error === 'object') {
            if (error.error.message) {
              this.errorMessage = error.error.message;
            } else if (error.error.errors) {
              const errors = error.error.errors;
              const errorMessages = Object.values(errors).flat();
              this.errorMessage = errorMessages.join('. ');
            } else {
              this.errorMessage = 'Failed to update role. Please try again.';
            }
          } else if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = 'Failed to update role. Please try again.';
          }

          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Error in onSubmit:', error);
      this.errorMessage = 'An unexpected error occurred. Please try again.';
      this.loading = false;
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
