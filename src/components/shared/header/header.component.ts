import { Component, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  host: { ngSkipHydration: '' },
})
export class HeaderComponent {
  currentUser: User | null = null;
  isAdmin = false;
  isTeacher = false;
  mobileMenuOpen = false;
  dropdownOpen = false;

  constructor(
    private authService: AuthService,
    private elementRef: ElementRef
  ) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.isAdmin = this.authService.isAdmin();
      this.isTeacher = user?.role === 'teacher' || false;
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

  toggleDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }
}
