import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.model';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AlertComponent // ← Pastikan ini ada
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  returnUrl: string = '/dashboard';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Tampilkan pesan dari query params
    const message = this.route.snapshot.queryParams['message'];
    if (message) {
      this.successMessage = message;
      this.router.navigate([], {
        queryParams: {},
        replaceUrl: true
      });
    }

    if (this.authService.getUser()) {
      console.log('Login: User already logged in, redirecting to dashboard');
      this.router.navigate(['/dashboard']);
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const loginData: LoginRequest = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    console.log('Login: Attempting login with:', loginData);
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Login: Success, redirecting to:', this.returnUrl);
        this.loading = false;
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        console.error('Login: Error:', error);
        this.loading = false;
        this.errorMessage = error.message || 'Login failed. Please try again.';
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
