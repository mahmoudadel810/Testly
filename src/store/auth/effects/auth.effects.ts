/** @format */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../../services/auth.service';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as AuthActions from '../actions/auth.actions';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Email confirmation effects
  confirmEmail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.confirmEmail),
      switchMap(({ token }) =>
        this.authService.confirmEmail(token).pipe(
          map((response) =>
            AuthActions.confirmEmailSuccess({
              message:
                response.message ||
                'Your email has been confirmed successfully!',
              email: response.email,
            })
          ),
          catchError((error) =>
            of(
              AuthActions.confirmEmailFailure({
                error,
                message:
                  error.error?.message ||
                  'Failed to confirm your email. Please try again.',
              })
            )
          )
        )
      )
    );
  });

  resendConfirmationEmail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.resendConfirmationEmail),
      switchMap(({ email }) =>
        this.authService.resendConfirmationEmail(email).pipe(
          map((response) =>
            AuthActions.resendConfirmationEmailSuccess({
              message: response.message || 'Confirmation email has been sent!',
            })
          ),
          catchError((error) =>
            of(
              AuthActions.resendConfirmationEmailFailure({
                error,
                message:
                  error.error?.message ||
                  'Failed to resend confirmation email.',
              })
            )
          )
        )
      )
    );
  });

  // Login effects
  login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((response) =>
            AuthActions.loginSuccess({
              user: response.user,
              token: response.token,
              expiresIn: response.expiresIn || 86400,
            })
          ),
          catchError((error) => of(AuthActions.loginFailure({ error })))
        )
      )
    );
  });

  loginSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => {
          this.router.navigate(['/dashboard']);
        })
      );
    },
    { dispatch: false }
  );

  // Logout effects
  logout$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => this.authService.logout()),
      map(() => AuthActions.logoutSuccess()),
      catchError((error) => of(AuthActions.logoutFailure({ error })))
    );
  });

  logoutSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => {
          this.router.navigate(['/login']);
        })
      );
    },
    { dispatch: false }
  );
}
