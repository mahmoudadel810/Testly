import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h3>Toast Notifications Demo</h3>
      <div class="button-container">
        <button class="btn-primaryCSS" (click)="showSuccess()">
          Show Success Toast
        </button>
        <button class="btn-errorCSS" (click)="showError()">
          Show Error Toast
        </button>
        <button class="btn-warningCSS" (click)="showWarning()">
          Show Warning Toast
        </button>
        <button class="btn-accentCSS" (click)="showInfo()">
          Show Info Toast
        </button>
        <button (click)="clearToasts()">Clear All Toasts</button>
      </div>
      <div class="mt-3">
        <p>
          Click the buttons above to test different toast notifications provided
          by ngx-toastr library.
        </p>
        <p>Toast notifications can be customized in various ways:</p>
        <ul>
          <li>
            Change position: top-right, top-left, bottom-right, bottom-left,
            etc.
          </li>
          <li>Adjust timeout duration</li>
          <li>Add custom styling</li>
          <li>Enable/disable auto-dismiss</li>
          <li>Add close buttons</li>
        </ul>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        margin: 20px;
        padding: 20px;
      }
      .button-container {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 15px;
      }
      button {
        margin: 5px;
      }
      .mt-3 {
        margin-top: 15px;
      }
    `,
  ],
})
export class ToastDemoComponent {
  constructor(private toastService: ToastService) {}

  showSuccess(): void {
    this.toastService.success('Operation completed successfully!', 'Success');
  }

  showError(): void {
    this.toastService.error(
      'An error occurred while processing your request.',
      'Error'
    );
  }

  showWarning(): void {
    this.toastService.warning('This action might cause issues.', 'Warning');
  }

  showInfo(): void {
    this.toastService.info('You have new notifications.', 'Information');
  }

  clearToasts(): void {
    this.toastService.clear();
  }
}
