import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-teacher-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './teacher-profile.component.html',
  styleUrls: ['./teacher-profile.component.css'],
})
export class TeacherProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  teacherProfile: any = {};
  isLoading = true;
  isSaving = false;
  isChangingPassword = false;
  error = '';
  successMessage = '';
  passwordError = '';
  passwordSuccess = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10,12}$/)]],
      address: ['', Validators.required],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required, Validators.minLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  ngOnInit(): void {
    this.loadTeacherProfile();
  }

  loadTeacherProfile(): void {
    this.isLoading = true;

    // Get current teacher from auth service
    this.authService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          this.teacherProfile = user;
          this.profileForm.patchValue({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading teacher profile:', err);
        this.error = 'Failed to load your profile. Please try again.';
        this.isLoading = false;
      },
    });
  }

  onProfileSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isSaving = true;
    this.error = '';
    this.successMessage = '';

    // In a real implementation, this would call a service method to update the profile
    // For now, we'll just simulate success after a delay
    setTimeout(() => {
      this.isSaving = false;
      this.successMessage = 'Profile updated successfully!';
    }, 1000);
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    this.isChangingPassword = true;
    this.passwordError = '';
    this.passwordSuccess = '';

    // In a real implementation, this would call a service method to change the password
    // For now, we'll just simulate success after a delay
    setTimeout(() => {
      this.isChangingPassword = false;
      this.passwordSuccess = 'Password changed successfully!';
      this.passwordForm.reset();
    }, 1000);
  }

  // Custom validator for password matching
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
  }
}
