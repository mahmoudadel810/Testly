/** @format */
import { createAction, props } from '@ngrx/store';
import { User } from '../../../models/user.model';

// Email Confirmation Actions
export const confirmEmail = createAction(
  '[Auth] Confirm Email',
  props<{ token: string }>()
);

export const confirmEmailSuccess = createAction(
  '[Auth] Confirm Email Success',
  props<{ message: string; email?: string }>()
);

export const confirmEmailFailure = createAction(
  '[Auth] Confirm Email Failure',
  props<{ error: any; message: string }>()
);

export const resendConfirmationEmail = createAction(
  '[Auth] Resend Confirmation Email',
  props<{ email: string }>()
);

export const resendConfirmationEmailSuccess = createAction(
  '[Auth] Resend Confirmation Email Success',
  props<{ message: string }>()
);

export const resendConfirmationEmailFailure = createAction(
  '[Auth] Resend Confirmation Email Failure',
  props<{ error: any; message: string }>()
);

// Login Actions
export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; token: string; expiresIn: number }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: any }>()
);

// Logout Actions
export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');
export const logoutFailure = createAction(
  '[Auth] Logout Failure',
  props<{ error: any }>()
);

// Token Actions
export const refreshToken = createAction('[Auth] Refresh Token');

export const refreshTokenSuccess = createAction(
  '[Auth] Refresh Token Success',
  props<{ user: User; token: string; expiresIn: number }>()
);

export const refreshTokenFailure = createAction(
  '[Auth] Refresh Token Failure',
  props<{ error: any }>()
);
