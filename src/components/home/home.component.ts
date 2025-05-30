import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { USER_ROLES } from '../../models/constants';
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isAdmin = false;
  isTeacher = false;
  private subscription = new Subscription();

  // Constants accessible in template
  readonly USER_ROLES = USER_ROLES;

  private authService = inject(AuthService);
  private logger = inject(LoggingService);

  /**
   * Initializes the component
   */
  ngOnInit(): void {
    this.checkAuthStatus();
    this.logger.debug('HomeComponent initialized');
  }

  /**
   * Checks authentication status and subscribes to user changes
   */
  private checkAuthStatus(): void {
    // Check if user is logged in
    this.isLoggedIn = this.authService.isLoggedIn();
    this.logger.debug(`User logged in status: ${this.isLoggedIn}`);

    // Subscribe to the currentUser$ Observable to check admin status
    if (this.isLoggedIn) {
      const userSub = this.authService.currentUser$.subscribe((user) => {
        this.isAdmin = user?.role === USER_ROLES.ADMIN;
        this.isTeacher = user?.role === USER_ROLES.TEACHER;
        this.logger.debug(`User admin status: ${this.isAdmin}`);
        this.logger.debug(`User teacher status: ${this.isTeacher}`);
      });
      this.subscription.add(userSub);
    }
  }

  /**
   * Cleans up subscriptions when component is destroyed
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.logger.debug('HomeComponent destroyed, subscriptions cleaned up');
  }
}
