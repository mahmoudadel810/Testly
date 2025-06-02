import { Component, HostListener, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { TranslationService } from '../../../services/translation.service';
import { TranslateDirective } from '../../../directives/translate.directive';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateDirective, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  host: { ngSkipHydration: '' },
})
export class HeaderComponent implements OnDestroy {
  currentUser: User | null = null;
  isAdmin = false;
  isTeacher = false;
  mobileMenuOpen = false;
  dropdownOpen = false;
  currentLang = 'en';
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private elementRef: ElementRef,
    public translationService: TranslationService
  ) {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
      this.isAdmin = this.authService.isAdmin();
      this.isTeacher = user?.role === 'teacher' || false;
    });
    
    this.translationService.getCurrentLang().pipe(takeUntil(this.destroy$)).subscribe(lang => {
      this.currentLang = lang;
    });
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
        this.dropdownOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  logoutAndClose(): void {
    this.logout();
    this.closeMobileMenu();
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  /**
   * Clean up subscriptions when component is destroyed
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
