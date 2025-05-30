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
   * Stores authentication token and its expiry in local storage
   * @param token The JWT token string
   * @param expiresIn Time until token expiry (in seconds)
   */
  setToken(token: string, expiresIn: number): void {
    if (!this.isBrowser) return;

    // Store token
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);

    // Calculate and store expiry date
    const expirationDate = new Date(
      new Date().getTime() + expiresIn * 1000
    ).toISOString();
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expirationDate);

    this.logger.debug('Token stored with expiry:', expirationDate);
  }

  /**
   * Retrieves the authentication token from storage
   * @returns The stored token or null if not found
   */
  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Checks if the token has expired based on local expiry time
   * @returns True if token has expired or doesn't exist, false otherwise
   */
  isTokenExpired(): boolean {
    if (!this.isBrowser) return true;

    const token = this.getToken();
    if (!token) return true;

    const expiryStr = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
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

    const expiryStr = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    if (!expiryStr) return 0;

    const expiry = new Date(expiryStr);
    const now = new Date();

    const timeRemaining = expiry.getTime() - now.getTime();
    return timeRemaining > 0 ? timeRemaining : 0;
  }

  /**
   * Removes token and token expiry from storage
   */
  clearToken(): void {
    if (!this.isBrowser) return;

    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    this.logger.debug('Token cleared from storage');
  }
}
