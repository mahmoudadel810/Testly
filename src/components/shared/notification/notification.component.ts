import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification, NotificationService } from '../../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (notifications.length > 0) {
    <div class="notification-container">
      @for (notification of notifications; track notification.id) {
      <div
        class="notification"
        [ngClass]="notification.type"
      >
        <div class="notification-content">
          <i [ngClass]="getIconClass(notification.type)" aria-hidden="true"></i>
          <span>{{ notification.message }}</span>
        </div>
        <button class="notification-close" (click)="dismissNotification(notification.id)" aria-label="Close notification">
          <i class="icon-close" aria-hidden="true"></i>
        </button>
      </div>
      }
    </div>
    }
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1050;
      max-width: 350px;
    }

    .notification {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      margin-bottom: 10px;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      animation: slideIn 0.3s ease-out;
      background-color: #ffffff;
      border-left: 4px solid #666;
    }

    .notification-content {
      display: flex;
      align-items: center;
    }

    .notification i {
      margin-right: 10px;
      font-size: 18px;
    }

    .notification-close {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .notification-close:hover {
      opacity: 1;
    }

    .success {
      border-left-color: #4caf50;
    }

    .success i {
      color: #4caf50;
    }

    .info {
      border-left-color: #2196f3;
    }

    .info i {
      color: #2196f3;
    }

    .warning {
      border-left-color: #ff9800;
    }

    .warning i {
      color: #ff9800;
    }

    .error {
      border-left-color: #f44336;
    }

    .error i {
      color: #f44336;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  dismissNotification(id: number): void {
    this.notificationService.dismiss(id);
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success':
        return 'icon-check';
      case 'info':
        return 'icon-info';
      case 'warning':
        return 'icon-warning';
      case 'error':
        return 'icon-error';
      default:
        return 'icon-info';
    }
  }
}
