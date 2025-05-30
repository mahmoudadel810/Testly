/** @format */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../reducers/auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

// General auth selectors
export const selectCurrentUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated
);

export const selectToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.token
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);

export const selectIsLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.isLoading
);

export const selectIsAdmin = createSelector(
  selectCurrentUser,
  (user) => user?.role === 'admin'
);

// Email confirmation selectors
export const selectEmailConfirmationStatus = createSelector(
  selectAuthState,
  (state: AuthState) => state.emailConfirmation.status
);

export const selectEmailConfirmationMessage = createSelector(
  selectAuthState,
  (state: AuthState) => state.emailConfirmation.message
);

export const selectEmailConfirmationEmail = createSelector(
  selectAuthState,
  (state: AuthState) => state.emailConfirmation.email
);

export const selectEmailConfirmation = createSelector(
  selectAuthState,
  (state: AuthState) => state.emailConfirmation
);
