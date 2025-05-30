import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root',
})
export class DebugService {
  private isDebugMode: boolean;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private logger: LoggingService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Debug mode is enabled in non-production environment or by localStorage flag
    this.isDebugMode =
      !environment.production ||
      (this.isBrowser && localStorage.getItem('debug_mode') === 'true');

    if (this.isDebugMode) {
      this.logger.info('Debug mode is enabled');
    }
  }

  /**
   * Enables or disables debug mode
   * @param enable Whether to enable debug mode
   */
  setDebugMode(enable: boolean): void {
    if (!this.isBrowser) return;

    this.isDebugMode = enable;

    if (enable) {
      localStorage.setItem('debug_mode', 'true');
      this.logger.info('Debug mode enabled');
    } else {
      localStorage.removeItem('debug_mode');
      this.logger.info('Debug mode disabled');
    }
  }

  /**
   * Checks if debug mode is enabled
   * @returns True if debug mode is enabled
   */
  isDebugEnabled(): boolean {
    return this.isDebugMode;
  }

  /**
   * Logs debug information if debug mode is enabled
   * @param message Debug message
   * @param data Additional data to log
   */
  debug(message: string, ...data: any[]): void {
    if (this.isDebugMode) {
      this.logger.debug(`[DEBUG] ${message}`, ...data);
    }
  }

  /**
   * Logs performance timing information
   * @param label Label for the performance measurement
   * @param callback Function to time
   * @returns The result of the callback function
   */
  async measureTime<T>(label: string, callback: () => Promise<T>): Promise<T> {
    if (!this.isDebugMode) {
      return await callback();
    }

    const start = performance.now();
    try {
      const result = await callback();
      const end = performance.now();
      this.logger.debug(`[PERF] ${label}: ${Math.round(end - start)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      this.logger.error(
        `[PERF ERROR] ${label}: ${Math.round(end - start)}ms`,
        error
      );
      throw error;
    }
  }

  /**
   * Logs system information for debugging
   */
  logSystemInfo(): void {
    if (!this.isDebugMode || !this.isBrowser) return;

    this.logger.info('System Information:', {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      connection: navigator.connection
        ? {
            effectiveType: (navigator.connection as any).effectiveType,
            downlink: (navigator.connection as any).downlink,
            rtt: (navigator.connection as any).rtt,
          }
        : 'Not available',
    });
  }
}
