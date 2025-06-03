import { Component, OnInit, inject, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  // Auth related properties
  isLoggedIn = false;
  isAdmin = false;
  isTeacher = false;
  statsVisible = false;
  private subscription = new Subscription();
  
  // Statistics counters
  studentCount = 10000;
  examCount = 500;
  subjectCount = 50;
  satisfactionRate = 99;
  
  // Display counters (for animation)
  displayStudentCount = 0;
  displayExamCount = 0;
  displaySubjectCount = 0;
  displaySatisfactionRate = 0;
  
  // Tracks if counters have started
  private countersStarted = false;
  
  // Reference to stats section for intersection observer
  @ViewChild('statsSection') statsSection!: ElementRef;
  
  private observer: IntersectionObserver | null = null;

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
   * Sets up intersection observer for animation triggers
   */
  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
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
    if (this.observer) {
      this.observer.disconnect();
    }
    this.logger.debug('HomeComponent destroyed, subscriptions cleaned up');
  }
  
  /**
   * Sets up intersection observer to detect when stats section is visible
   */
  private setupIntersectionObserver(): void {
    // Create observer to detect when stats section is in viewport
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.countersStarted) {
          // Add a small delay before starting the animation for better visual effect
          setTimeout(() => {
            this.statsVisible = true;
            setTimeout(() => {
              this.startCounters();
            }, 500); // Wait for the section appearance animation to start
            this.countersStarted = true;
          }, 100);
        }
      });
    }, { threshold: 0.1 }); // Start when 10% of element is visible
    
    // Start observing the stats section
    if (this.statsSection) {
      this.observer.observe(this.statsSection.nativeElement);
    }
  }
  
  /**
   * Starts the counter animations for all statistics
   */
  private startCounters(): void {
    this.animateCounter(0, this.studentCount, 2000, (value) => this.displayStudentCount = Math.round(value));
    this.animateCounter(0, this.examCount, 1500, (value) => this.displayExamCount = Math.round(value));
    this.animateCounter(0, this.subjectCount, 1200, (value) => this.displaySubjectCount = Math.round(value));
    this.animateCounter(0, this.satisfactionRate, 1000, (value) => this.displaySatisfactionRate = Math.round(value));
  }
  
  /**
   * Generic counter animation function
   * @param start Starting value
   * @param end Ending value
   * @param duration Animation duration in milliseconds 
   * @param callback Function to call on each animation step
   */
  private animateCounter(start: number, end: number, duration: number, callback: (value: number) => void): void {
    const startTime = performance.now();
    const updateCounter = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Use easing function to make animation look more natural
      const easedProgress = this.easeOutQuad(progress);
      const currentValue = start + easedProgress * (end - start);
      
      callback(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    requestAnimationFrame(updateCounter);
  }
  
  /**
   * Easing function for smoother animation
   * Uses quadratic ease-out for a natural feel
   */
  private easeOutQuad(t: number): number {
    return t * (2 - t);
  }
}
