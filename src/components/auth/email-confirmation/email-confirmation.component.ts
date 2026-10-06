 
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';

import { AppState } from '../../../store';
import * as AuthActions from '../../../store/auth/actions/auth.actions';
import * as AuthSelectors from '../../../store/auth/selectors/auth.selectors';

interface FooterLink {
  url: string;
  text: string;
}

@Component({
  selector: 'app-email-confirmation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './email-confirmation.component.html',
  styleUrls: ['./email-confirmation.component.css'],
})
export class EmailConfirmationComponent implements OnInit {
  status$: Observable<'loading' | 'success' | 'error' | null>;
  message$: Observable<string | null>;
  email$: Observable<string | null>;

  // For backward compatibility with template
  status: 'loading' | 'success' | 'error' = 'loading';
  message: string = '';
  email: string | null = null;
  // Resend form shown when confirmation fails (expired/invalid link)
  resendEmail = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
  isResending = false;
  resendMessage = '';
  resendSucceeded = false;
  currentDate: Date = new Date();
  currentYear: number = new Date().getFullYear();
  footerLinks: FooterLink[] = [
    { url: '/help', text: 'Help' },
    { url: '/privacy', text: 'Privacy' },
    { url: '/terms', text: 'Terms' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.status$ = this.store.select(
      AuthSelectors.selectEmailConfirmationStatus
    );
    this.message$ = this.store.select(
      AuthSelectors.selectEmailConfirmationMessage
    );
    this.email$ = this.store.select(AuthSelectors.selectEmailConfirmationEmail);

    // Subscribe to the observables to keep the template variables updated
    this.status$.subscribe((status) => {
      if (status) this.status = status;
    });

    this.message$.subscribe((message) => {
      if (message) this.message = message;
    });

    this.email$.subscribe((email) => {
      this.email = email;
    });
  }

  ngOnInit(): void {
    console.log('Email confirmation component initialized');
    const token = this.route.snapshot.params['token'];
    console.log('Token received:', token);

    if (!token) {
      this.store.dispatch(
        AuthActions.confirmEmailFailure({
          error: 'No token provided',
          message: 'Invalid confirmation link',
        })
      );
      return;
    }

    // Dispatch the confirm email action to the NgRx store
    this.store.dispatch(AuthActions.confirmEmail({ token }));
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  resendConfirmation(): void {
    if (this.resendEmail.invalid || this.isResending) {
      this.resendEmail.markAsTouched();
      return;
    }

    // Called directly (not via the store) so the page keeps showing the
    // failed-confirmation state instead of switching to "Email Confirmed!"
    this.isResending = true;
    this.resendMessage = '';
    this.resendEmail.disable();

    this.authService
      .resendConfirmationEmail(this.resendEmail.value.trim())
      .subscribe({
        next: (response) => {
          this.isResending = false;
          this.resendEmail.enable();
          this.resendSucceeded = true;
          this.resendMessage =
            response?.message ||
            'A new confirmation email has been sent. Please check your inbox.';
          this.toastr.success(this.resendMessage);
        },
        error: (error) => {
          this.isResending = false;
          this.resendEmail.enable();
          this.resendSucceeded = false;
          this.resendMessage =
            error?.error?.message ||
            'Failed to resend confirmation email. Please try again.';
          this.toastr.error(this.resendMessage);
        },
      });
  }

  contactSupport(): void {
    window.location.href =
      'mailto:support@testly.com?subject=Email Confirmation Support';
  }
}
