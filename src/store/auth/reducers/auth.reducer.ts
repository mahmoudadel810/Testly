/** @format */
import { createReducer, on } from '@ngrx/store';
import { User } from '../../../models/user.model';
import * as AuthActions from '../actions/auth.actions';

// Define status type for better type safety
export type EmailConfirmationStatus = 'loading' | 'success' | 'error' | null;

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: any;
  emailConfirmation: {
    status: EmailConfirmationStatus;
    message: string | null;
    email: string | null;
  };
}

export const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  emailConfirmation: {
    status: null,
    message: null,
    email: null,
  },
};

export const authReducer = createReducer(
  initialState,

  // Email confirmation actions
  on(AuthActions.confirmEmail, (state) => ({
    ...state,
    isLoading: true,
    emailConfirmation: {
      ...state.emailConfirmation,
      status: 'loading' as EmailConfirmationStatus,
      message: null,
    },
  })),

  on(AuthActions.confirmEmailSuccess, (state, { message, email }) => ({
    ...state,
    isLoading: false,
    emailConfirmation: {
      status: 'success' as EmailConfirmationStatus,
      message,
      email: email || state.emailConfirmation.email,
    },
  })),

  on(AuthActions.confirmEmailFailure, (state, { message }) => ({
    ...state,
    isLoading: false,
    emailConfirmation: {
      status: 'error' as EmailConfirmationStatus,
      message,
      email: state.emailConfirmation.email,
    },
  })),

  on(AuthActions.resendConfirmationEmail, (state) => ({
    ...state,
    isLoading: true,
    emailConfirmation: {
      ...state.emailConfirmation,
      status: 'loading' as EmailConfirmationStatus,
    },
  })),

  on(AuthActions.resendConfirmationEmailSuccess, (state, { message }) => ({
    ...state,
    isLoading: false,
    emailConfirmation: {
      ...state.emailConfirmation,
      status: 'success' as EmailConfirmationStatus,
      message,
    },
  })),

  on(AuthActions.resendConfirmationEmailFailure, (state, { message }) => ({
    ...state,
    isLoading: false,
    emailConfirmation: {
      ...state.emailConfirmation,
      status: 'error' as EmailConfirmationStatus,
      message,
    },
  })),

  // Login actions
  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Logout actions
  on(AuthActions.logout, (state) => ({
    ...state,
    isLoading: true,
  })),

  on(AuthActions.logoutSuccess, () => ({
    ...initialState,
  })),

  on(AuthActions.logoutFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  }))
);
