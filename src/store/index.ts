/** @format */
import { ActionReducerMap } from '@ngrx/store';
import * as fromAuth from './auth/reducers/auth.reducer';

export interface AppState {
  auth: fromAuth.AuthState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: fromAuth.authReducer,
};
