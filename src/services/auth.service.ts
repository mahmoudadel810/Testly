/** @format */

import { Injectable, PLATFORM_ID, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  BehaviorSubject,
  Observable,
  tap,
  map,
  catchError,
  of,
  timer,
  throwError
} from "rxjs";
import { User, AuthResponse } from "../models/user.model";
import { isPlatformBrowser } from "@angular/common";
import { Router } from "@angular/router";
import { TokenService } from "./token.service";
import { UserStorageService } from "./user-storage.service";
import { LoggingService } from "./logging.service";
import { API_ENDPOINTS } from "../models/constants";
import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root"
})
export class AuthService {
  getToken() {
    throw new Error("Method not implemented.");
  }
  private userSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private isBrowser: boolean;
  private refreshTokenTimeout: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private tokenService: TokenService,
    private userStorage: UserStorageService,
    private logger: LoggingService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Initialize user from storage
    this.userSubject = new BehaviorSubject<User | null>(
      this.userStorage.getUser()
    );
    this.currentUser$ = this.userSubject.asObservable();

    if (this.isBrowser) {
      // Check token validity on service initialization
      setTimeout(() => {
        this.checkTokenValidity();
        this.setupTokenRefresh();
      }, 100);
    }
  }

  /**
   * Register a new user
   * @param userData User registration data
   */
  register(userData: any): Observable<any> {
    this.logger.info("Registering new user");

    return this.http
      .post<{ success: boolean; message: string }>(
        `${API_ENDPOINTS.AUTH}/signUp`,
        userData,
        {
          headers: { "Content-Type": "application/json" },
          observe: "response",
          withCredentials: false
        }
      )
      .pipe(
        tap((response) => {
          this.logger.debug("Registration response status:", response.status);
        }),
        map((response) => response.body)
      );
  }

  /**
   * Register a new teacher
   * @param teacherData Teacher registration data
   */
  registerTeacher(teacherData: any): Observable<any> {
    this.logger.info("Registering new teacher");

    return this.http
      .post<{ success: boolean; message: string }>(
        `${API_ENDPOINTS.AUTH}/teacher/signUp`,
        teacherData,
        {
          headers: { "Content-Type": "application/json" },
          observe: "response",
          withCredentials: false
        }
      )
      .pipe(
        tap((response) => {
          this.logger.debug(
            "Teacher registration response status:",
            response.status
          );
        }),
        map((response) => response.body)
      );
  }

  /**
   * Get confirmed teachers for student selection
   */
  getConfirmedTeachers(): Observable<any[]> {
    this.logger.info("Fetching confirmed teachers");

    return this.http
      .get<any[]>(`${API_ENDPOINTS.AUTH}/teachers/confirmed`)
      .pipe(
        tap((teachers) => {
          this.logger.debug("Fetched teachers count:", teachers.length);
        }),
        catchError((error) => {
          this.logger.error("Error fetching teachers:", error);
          return of([]);
        })
      );
  }

  /**
   * Update student's selected teachers
   * @param teacherIds Array of teacher IDs
   */
  updateSelectedTeachers(teacherIds: string[]): Observable<any> {
    this.logger.info("Updating selected teachers");

    return this.http
      .put(
        `${API_ENDPOINTS.AUTH}/teachers/selected`,
        { selectedTeachers: teacherIds },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              environment.bearerTokenPrefix + this.tokenService.getToken()
          }
        }
      )
      .pipe(
        tap(() => {
          this.logger.debug("Updated selected teachers successfully");
        }),
        catchError((error) => {
          this.logger.error("Error updating selected teachers:", error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Confirms user email with token
   * @param token Email confirmation token
   */
  confirmEmail(token: string): Observable<any> {
    return this.http
      .get<any>(`${API_ENDPOINTS.AUTH}/confirmEmail/${token}`)
      .pipe(
        tap((response) =>
          this.logger.debug("Email confirmation response:", response)
        ),
        catchError((error) => {
          this.logger.error("Email confirmation error:", error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Resends confirmation email
   * @param email User's email address
   */
  resendConfirmationEmail(email: string): Observable<any> {
    return this.http
      .post<any>(`${API_ENDPOINTS.AUTH}/resendConfirmation`, { email })
      .pipe(
        tap((response) =>
          this.logger.debug("Resend confirmation response:", response)
        ),
        catchError((error) => {
          this.logger.error("Resend confirmation error:", error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Authenticates a user with email and password
   * @param email User's email
   * @param password User's password
   */
  login(email: string, password: string): Observable<AuthResponse> {
    this.logger.info("Attempting login");
    return this.http
      .post<AuthResponse>(`${API_ENDPOINTS.AUTH}/signIn`, { email, password })
      .pipe(tap((response) => this.handleAuthentication(response)));
  }

  /**
   * Validates token with the server
   */
  validateToken(): Observable<boolean> {
    const token = this.tokenService.getToken();

    if (!token) {
      this.logger.debug("No token found for validation");
      return of(false);
    }

    // Check if token expired locally first
    if (this.tokenService.isTokenExpired()) {
      this.logger.debug("Token expired locally, clearing auth state");
      this.logout();
      return of(false);
    }

    // Token exists and not expired locally, validate with server
    this.http
      .get<{ valid: boolean }>(`${API_ENDPOINTS.AUTH}/validateToken`, {
        headers: { Authorization: environment.bearerTokenPrefix + token }
      })
      .pipe(
        catchError((err) => {
          this.logger.warn("Token validation API error:", err);

          // Only clear storage if server explicitly invalidates token
          if (err.status === 401 || err.status === 403) {
            this.logger.debug("Server rejected token, logging out");
            this.logout();
          }

          return of({ valid: err.status !== 401 && err.status !== 403 });
        })
      )
      .subscribe((response) => {
        if (response && !response.valid) {
          this.logger.debug("Server reported token as invalid, logging out");
          this.logout();
        }
      });

    // Trust local check for immediate response
    return of(true);
  }

  /**
   * Logs out the current user
   */
  logout(): void {
    if (!this.isBrowser) return;

    this.userStorage.setGuestMode(false);
    this.stopTokenRefresh();

    const token = this.tokenService.getToken();
    if (!token) {
      this.clearAuthState();
      this.router.navigate(["/"]);
      return;
    }

    // Call backend logout with proper error handling
    this.http
      .post(
        `${API_ENDPOINTS.AUTH}/signOut`,
        {},
        {
          headers: { Authorization: environment.bearerTokenPrefix + token }
        }
      )
      .pipe(
        catchError((error) => {
          this.logger.warn("Logout API error:", error);
          return of(null); // Continue with local logout regardless of API errors
        })
      )
      .subscribe(() => {
        this.clearAuthState();
        this.router.navigate(["/"]);
      });
  }

  /**
   * Checks if user is currently logged in
   */
  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  /**
   * Checks if current user has admin role
   */
  isAdmin(): boolean {
    const user = this.userSubject.value;
    return !!user && user.role === "admin";
  }

  /**
   * Checks if current user is a teacher
   */
  isTeacher(): boolean {
    const user = this.userSubject.value;
    return !!user && user.role === "teacher";
  }

  /**
   * Activates guest mode for limited access
   */
  enterGuestMode(): void {
    if (this.isBrowser) {
      localStorage.setItem("guest_mode", "true");
    }
  }

  /**
   * Exits guest mode
   */
  exitGuestMode(): void {
    if (this.isBrowser) {
      localStorage.removeItem("guest_mode");
    }
  }

  /**
   * Checks if guest mode is active
   */
  isInGuestMode(): boolean {
    if (!this.isBrowser) return false;
    return localStorage.getItem("guest_mode") === "true";
  }

  /**
   * Initiates password reset process
   * @param email User's email
   */
  resetPassword(email: string): Observable<any> {
    return this.http.post(`${API_ENDPOINTS.AUTH}/requestReset`, { email });
  }

  /**
   * Completes password reset with verification code
   * @param data Reset password data
   */
  verifyReset(data: {
    code: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Observable<any> {
    return this.http.post(`${API_ENDPOINTS.AUTH}/verifyReset`, data);
  }

  /**
   * Gets user by ID
   * @param userId User's unique ID
   */
  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${API_ENDPOINTS.AUTH}/user/${userId}`);
  }

  /**
   * Handles successful authentication
   * @param response Auth response containing token and user data
   */
  private handleAuthentication(response: AuthResponse): void {
    if (!response.token || !response.user) {
      this.logger.error("Invalid authentication response");
      return;
    }

    // Store token with expiry
    this.tokenService.setToken(response.token, response.expiresIn || 3600);

    // Store user data
    this.userStorage.storeUser(response.user);

    // Update observable
    this.userSubject.next(response.user);

    // Setup token refresh
    this.setupTokenRefresh();

    this.logger.info("User authenticated successfully");
  }

  /**
   * Clears all authentication state
   */
  private clearAuthState(): void {
    this.userStorage.clearAllAuthData();
    this.userSubject.next(null);
    this.stopTokenRefresh();
    this.logger.debug("Auth state cleared");
  }

  /**
   * Sets up automatic token refresh before expiry
   */
  private setupTokenRefresh(): void {
    if (!this.isBrowser) return;

    // Clear any existing refresh timer first
    this.stopTokenRefresh();

    // Set up a timer to refresh just before the token expires
    const timeToExpiry = this.tokenService.getTimeUntilExpiry();
    if (timeToExpiry > 0) {
      // Refresh 1 minute before expiry or halfway through if less than 2 minutes remain
      const refreshTime = Math.min(timeToExpiry - 60000, timeToExpiry / 2);

      this.logger.debug(
        `Token refresh scheduled in ${Math.round(refreshTime / 1000)} seconds`
      );

      this.refreshTokenTimeout = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);
    }
  }

  /**
   * Stops the token refresh timer
   */
  private stopTokenRefresh(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
      this.refreshTokenTimeout = null;
    }
  }

  /**
   * Refreshes authentication token
   */
  private refreshToken(): void {
    // TODO: Implement token refresh logic when the backend supports it
    this.logger.debug("Token refresh requested");
  }

  /**
   * Checks token validity on startup or page refresh
   */
  private checkTokenValidity(): void {
    if (!this.isBrowser) return;

    const token = this.tokenService.getToken();
    const user = this.userStorage.getUser();

    if (!token || !user) {
      this.clearAuthState();
      return;
    }

    // If token is expired locally, clear auth state
    if (this.tokenService.isTokenExpired()) {
      this.logger.debug("Token expired during validity check");
      this.clearAuthState();
      return;
    }

    // Token seems valid locally, update the subject
    this.userSubject.next(user);

    // Asynchronously validate with server
    this.validateToken().subscribe();
  }
}
