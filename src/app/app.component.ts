import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../components/shared/footer/footer.component';
import { HeaderComponent } from '../components/shared/header/header.component';
import { NotificationComponent } from '../components/shared/notification/notification.component';
import { filter } from 'rxjs/operators';
import { LoggingService } from '../services/logging.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FooterComponent,
    HeaderComponent,
    NotificationComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Testly';
  showBackToTop = false;
  isBrowser: boolean;

  constructor(
    private router: Router,
    private logger: LoggingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Check if we're in the browser
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Listen for route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Scroll to top on navigation (only in browser)
        if (this.isBrowser) {
          window.scrollTo(0, 0);
        }
      });
  }



  /**
   * Shows back-to-top button when scrolled down
   */
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Show button when scrolled down more than 300px (only in browser)
    if (this.isBrowser) {
      this.showBackToTop = window.scrollY > 300;
    }
  }

  /**
   * Scrolls the window back to the top
   */
  scrollToTop() {
    if (this.isBrowser) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }
}
