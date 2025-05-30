import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> =
    this.notificationsSubject.asObservable();

  private nextId = 1;
  private autoHideTimers: { [id: number]: any } = {};

  constructor() {}

  /**
   * Shows a success notification
   * @param message Message to display
   * @param duration Duration in milliseconds (default: 3000)
   * @returns The ID of the created notification
   */
  success(message: string, duration = 3000): number {
    return this.addNotification(message, 'success', duration);
  }

  /**
   * Shows an info notification
   * @param message Message to display
   * @param duration Duration in milliseconds (default: 3000)
   * @returns The ID of the created notification
   */
  info(message: string, duration = 3000): number {
    return this.addNotification(message, 'info', duration);
  }

  /**
   * Shows a warning notification
   * @param message Message to display
   * @param duration Duration in milliseconds (default: 5000)
   * @returns The ID of the created notification
   */
  warning(message: string, duration = 5000): number {
    return this.addNotification(message, 'warning', duration);
  }

  /**
   * Shows an error notification
   * @param message Message to display
   * @param duration Duration in milliseconds (default: 5000)
   * @returns The ID of the created notification
   */
  error(message: string, duration = 5000): number {
    return this.addNotification(message, 'error', duration);
  }

  /**
   * Dismisses a notification by ID
   * @param id The ID of the notification to dismiss
   */
  dismiss(id: number): void {
    const notifications = this.notificationsSubject.value.filter(
      (n) => n.id !== id
    );
    this.notificationsSubject.next(notifications);

    // Clear auto-hide timer if it exists
    if (this.autoHideTimers[id]) {
      clearTimeout(this.autoHideTimers[id]);
      delete this.autoHideTimers[id];
    }
  }

  /**
   * Dismisses all notifications
   */
  dismissAll(): void {
    // Clear all auto-hide timers
    Object.values(this.autoHideTimers).forEach((timer) => clearTimeout(timer));
    this.autoHideTimers = {};

    this.notificationsSubject.next([]);
  }

  /**
   * Adds a notification of the specified type
   * @param message Notification message
   * @param type Notification type
   * @param duration Auto-hide duration in milliseconds
   * @returns The ID of the created notification
   */
  private addNotification(
    message: string,
    type: 'success' | 'info' | 'warning' | 'error',
    duration = 3000
  ): number {
    const id = this.nextId++;
    const notification: Notification = { id, message, type, duration };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    // Auto-hide notification after duration
    if (duration > 0) {
      this.autoHideTimers[id] = setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }
}
