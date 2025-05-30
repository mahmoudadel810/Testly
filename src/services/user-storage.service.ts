import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../models/user.model';
import { STORAGE_KEYS, USER_ROLES } from '../models/constants';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root',
})
export class UserStorageService {
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private logger: LoggingService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Stores user data in local storage
   * @param user User data to store
   */
  storeUser(user: User): void {
    if (!this.isBrowser) return;

    try {
      const userJson = JSON.stringify(user);
      localStorage.setItem(STORAGE_KEYS.USER_INFO, userJson);
      this.logger.debug('User stored in local storage');
    } catch (error) {
      this.logger.error('Error storing user data:', error);
    }
  }

  /**
   * Retrieves user data from local storage
   * @returns User object or null if not found or error
   */
  getUser(): User | null {
    if (!this.isBrowser) return null;

    try {
      const userJson = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      if (!userJson) return null;

      return JSON.parse(userJson) as User;
    } catch (error) {
      this.logger.error('Error parsing user data from storage:', error);
      return null;
    }
  }

  /**
   * Checks if a stored user exists and has admin role
   * @returns True if user is an admin, false otherwise
   */
  isUserAdmin(): boolean {
    const user = this.getUser();
    return !!user && user.role === USER_ROLES.ADMIN;
  }

  /**
   * Sets guest mode flag in local storage
   */
  setGuestMode(enabled: boolean): void {
    if (!this.isBrowser) return;

    if (enabled) {
      localStorage.setItem(STORAGE_KEYS.GUEST_MODE, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.GUEST_MODE);
    }
  }

  /**
   * Checks if guest mode is active
   * @returns True if in guest mode, false otherwise
   */
  isGuestMode(): boolean {
    if (!this.isBrowser) return false;
    return localStorage.getItem(STORAGE_KEYS.GUEST_MODE) === 'true';
  }

  /**
   * Clears user data from local storage
   */
  clearUserData(): void {
    if (!this.isBrowser) return;

    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    this.logger.debug('User data cleared from storage');
  }

  /**
   * Clears all authentication related data
   */
  clearAllAuthData(): void {
    if (!this.isBrowser) return;

    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(STORAGE_KEYS.GUEST_MODE);
    this.logger.debug('All auth data cleared from storage');
  }
}
