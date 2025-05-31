import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-teacher-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './teacher-register.component.html',
  styleUrls: ['./teacher-register.component.css'],
})
export class TeacherRegisterComponent implements OnInit {
  teacherForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.teacherForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
        address: ['', [Validators.required, Validators.minLength(5)]],
        nationalId: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  ngOnInit(): void {}

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.teacherForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.teacherForm.controls).forEach((key) => {
        const control = this.teacherForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.teacherForm.value;

    this.authService.registerTeacher(formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage =
          response.message ||
          'Registration successful. We will review your application and contact you soon.';

        // Redirect to pending approval page after a short delay
        setTimeout(() => {
          this.router.navigate(['/teacher-pending']);
        }, 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage =
          error.error.message || 'Registration failed. Please try again.';
      },
    });
  }
}
