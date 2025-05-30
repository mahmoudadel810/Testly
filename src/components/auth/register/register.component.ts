import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  registerCompleted = false;
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            this.usernameValidator(),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            this.passwordValidator(),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  usernameValidator() {
    return (control: any) => {
      let username = control.value;
      if (username && username.startsWith(' ')) {
        username = username.trimStart();
        control.setValue(username, { emitEvent: false });
      }
      if (!username || username.length === 0) {
        return { invalidUsername: true };
      }
      if (username.length < 3) {
        return { invalidUsername: true };
      }
      const validChars = /^[a-zA-Z0-9@#_][a-zA-Z0-9@#_\s]*$/;
      if (!validChars.test(username)) {
        return { invalidUsername: true };
      }

      return null;
    };
  }

  passwordValidator() {
    return (control: any) => {
      const password = control.value;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      if (!hasUpperCase || !hasNumber || !hasSymbol) {
        return { invalidPassword: true };
      }
      return null;
    };
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  showErrorAlert(title: string, message: string): void {
    this.toastr.error(message, title, {
      timeOut: 5000,
      closeButton: true,
      progressBar: true,
    });
  }

  showSuccessAlert(message: string): void {
    this.toastr.success(message, 'Success', {
      timeOut: 5000,
      closeButton: true,
      progressBar: true,
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach((key) => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;

    const userData = {
      username: this.registerForm.get('username')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
      cpass: this.registerForm.get('confirmPassword')?.value,
    };

    const apiTimeout = setTimeout(() => {
      this.isLoading = false;
      this.showErrorAlert(
        'Timeout Error',
        'API request timed out. Please check server connection.'
      );
    }, 10000);

    this.authService.register(userData).subscribe({
      next: (response) => {
        clearTimeout(apiTimeout);
        this.isLoading = false;

        if (response && typeof response === 'object') {
          if (response.Validation_Error) {
            const errorMessages = [];

            if (
              response.Errors &&
              Array.isArray(response.Errors) &&
              response.Errors.length > 0
            ) {
              if (Array.isArray(response.Errors[0])) {
                for (const error of response.Errors[0]) {
                  if (error.message) errorMessages.push(error.message);
                }
              }
            }

            if (errorMessages.length > 0) {
              this.showErrorAlert('Validation Error', errorMessages.join('\n'));
            } else {
              this.showErrorAlert(
                'Validation Error',
                response.Validation_Error
              );
            }
            return;
          }

          if (response.success === true || response.message) {
            this.registerCompleted = true;
            this.successMessage =
              response.message ||
              'Registration successful! Please check your email to confirm your account.';
            this.showSuccessAlert(this.successMessage);
          } else {
            this.showErrorAlert(
              'Registration Failed',
              'Server returned an unexpected response.'
            );
          }
        } else {
          this.showErrorAlert(
            'Registration Failed',
            'Server returned an invalid response.'
          );
        }
      },
      error: (error) => {
        clearTimeout(apiTimeout);
        this.isLoading = false;

        if (error.status === 0) {
          this.showErrorAlert(
            'Server Error',
            'Server connection error. Please check if the backend server is running.'
          );
        } else if (error.status === 400) {
          if (error.error?.Validation_Error) {
            this.showErrorAlert(
              'Validation Error',
              error.error.Validation_Error
            );
          } else if (error.error?.message) {
            this.showErrorAlert('Error', error.error.message);
          } else {
            this.showErrorAlert(
              'Invalid Request',
              'Please check your input and try again.'
            );
          }
        } else if (error.status === 409) {
          this.showErrorAlert(
            'Email Exists',
            'Email already exists. Please use a different email address.'
          );
        } else if (error.error?.message) {
          this.showErrorAlert('Error', error.error.message);
        } else {
          this.showErrorAlert('Registration Failed', 'Please try again later.');
        }
      },
    });
  }
}
