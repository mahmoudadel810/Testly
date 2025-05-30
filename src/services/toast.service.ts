import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastr: ToastrService) {}

  /**
   * Show a success toast notification
   * @param message The message to display
   * @param title Optional title for the toast
   * @param options Optional configuration options
   */
  success(message: string, title?: string, options?: any): void {
    this.toastr.success(message, title, options);
  }

  /**
   * Show an error toast notification
   * @param message The message to display
   * @param title Optional title for the toast
   * @param options Optional configuration options
   */
  error(message: string, title?: string, options?: any): void {
    this.toastr.error(message, title, options);
  }

  /**
   * Show an info toast notification
   * @param message The message to display
   * @param title Optional title for the toast
   * @param options Optional configuration options
   */
  info(message: string, title?: string, options?: any): void {
    this.toastr.info(message, title, options);
  }

  /**
   * Show a warning toast notification
   * @param message The message to display
   * @param title Optional title for the toast
   * @param options Optional configuration options
   */
  warning(message: string, title?: string, options?: any): void {
    this.toastr.warning(message, title, options);
  }

  /**
   * Clear all toast notifications
   */
  clear(): void {
    this.toastr.clear();
  }
}
