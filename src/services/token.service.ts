import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { STORAGE_KEYS } from '../models/constants';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private logger: LoggingService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Stores authentication token and its expiry in session storage
   * for automatic logout when browser is closed
   * @param token The JWT token string
   * @param expiresIn Time until token expiry (in seconds)
   */
  setToken(token: string, expiresIn: number): void {
    if (!this.isBrowser) return;

    // Store token in sessionStorage for auto-logout on browser close
    sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);

    // Calculate and store expiry date
    const expirationDate = new Date(
      new Date().getTime() + expiresIn * 1000
    ).toISOString();
    sessionStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expirationDate);

    this.logger.debug('Token stored with expiry in session storage:', expirationDate);
  }

  /**
   * Retrieves the authentication token from session storage
   * @returns The stored token or null if not found
   */
  getToken(): string | null {
    if (!this.isBrowser) return null;
    return sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Checks if the token has expired based on session storage expiry time
   * @returns True if token has expired or doesn't exist, false otherwise
   */
  isTokenExpired(): boolean {
    if (!this.isBrowser) return true;

    const token = this.getToken();
    if (!token) return true;

    const expiryStr = sessionStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    if (!expiryStr) return true;

    const expiry = new Date(expiryStr);
    const now = new Date();

    return now > expiry;
  }

  /**
   * Calculates time until token expiry in milliseconds
   * @returns Milliseconds until expiry or 0 if expired/not found
   */
  getTimeUntilExpiry(): number {
    if (!this.isBrowser) return 0;

    const expiryStr = sessionStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    if (!expiryStr) return 0;

    const expiry = new Date(expiryStr);
    const now = new Date();

    const timeRemaining = expiry.getTime() - now.getTime();
    return timeRemaining > 0 ? timeRemaining : 0;
  }

  /**
   * Removes token and token expiry from session storage
   */
  clearToken(): void {
    if (!this.isBrowser) return;

    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    this.logger.debug('Token cleared from session storage');
  }
}
