/** @format */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TranslationService } from '../../../services/translation.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { TranslateDirective } from '../../../directives/translate.directive';

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
  imports: [CommonModule, TranslatePipe, TranslateDirective],
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
  currentDate: Date = new Date();
  currentYear: number = new Date().getFullYear();
  footerLinks: FooterLink[] = [
    { url: '/help', text: this.getTranslatedText('AUTH.EMAIL_CONFIRMATION.FOOTER.HELP') },
    { url: '/privacy', text: this.getTranslatedText('AUTH.EMAIL_CONFIRMATION.FOOTER.PRIVACY') },
    { url: '/terms', text: this.getTranslatedText('AUTH.EMAIL_CONFIRMATION.FOOTER.TERMS') },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private translationService: TranslationService
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
    if (this.email) {
      this.store.dispatch(
        AuthActions.resendConfirmationEmail({ email: this.email })
      );
    } else {
      this.store.dispatch(
        AuthActions.resendConfirmationEmailFailure({
          error: 'No email available',
          message: 'Email address is not available. Please contact support.',
        })
      );
    }
  }

  contactSupport(): void {
    const subject = this.translationService.translate('AUTH.EMAIL_CONFIRMATION.SUPPORT_SUBJECT');
    window.location.href = `mailto:support@testly.com?subject=${encodeURIComponent(subject)}`;
  }

  private getTranslatedText(key: string): string {
    return this.translationService.translate(key);
  }
}
