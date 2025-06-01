/** @format */

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError, map, of, tap, throwError } from "rxjs";
import { API_ENDPOINTS } from "../models/constants";
import { TokenService } from "./token.service";
import { LoggingService } from "./logging.service";
import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root"
})
export class AdminService {
  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private logger: LoggingService
  ) {}

  // Get pending teachers
  getPendingTeachers(): Observable<any[]> {
    this.logger.info("Fetching pending teachers");

    // Ensure we have a valid token
    const token = this.tokenService.getToken();
    if (!token) {
      this.logger.error('No authentication token available');
      return of([]);
    }

    // Add authorization header with proper format
    const headers = {
      Authorization: `${environment.bearerTokenPrefix}${token}`
    };

    this.logger.debug('Authorization header:', headers.Authorization);

    // Define an interface for the API response format
    interface ApiResponse {
      success: boolean;
      data: any[];
      message: string;
    }

    return this.http
      .get<any>(`${API_ENDPOINTS.ADMIN}/teachers/pending`, { headers })
      .pipe(
        tap(response => {
          // Log the raw response to debug what's coming back
          this.logger.debug('Raw API response for pending teachers:', response);
          
          // Check if response is empty or null
          if (!response) {
            this.logger.warn('Empty response received for pending teachers');
          }
        }),
        map(response => {
          // Handle different response formats
          if (Array.isArray(response)) {
            return response as any[];
          } else if (response && typeof response === 'object') {
            // Check for common response patterns
            if (response.success && response.data && Array.isArray(response.data)) {
              return response.data as any[];
            } else if (response.teachers && Array.isArray(response.teachers)) {
              return response.teachers as any[];
            } else if (response.users && Array.isArray(response.users)) {
              return response.users as any[];
            } else if (response.items && Array.isArray(response.items)) {
              return response.items as any[];
            } else {
              // Try to extract array from response
              const possibleArray = Object.values(response).find(val => Array.isArray(val));
              if (possibleArray) {
                return possibleArray as any[];
              }
            }
          }
          
          // If we can't extract an array, return empty array
          this.logger.warn('Could not extract teachers array from response');
          return [] as any[];
        }),
        tap(teachers => {
          this.logger.debug('Pending teachers loaded:', teachers.length);
          
          // Log additional info if no teachers were found
          if (teachers.length === 0) {
            this.logger.warn('No pending teachers found. Check API endpoint.');
          }
        }),
        catchError((error) => {
          this.logger.error('Error fetching pending teachers:', error);
          return of([]);
        })
      );
  } 

  // Get count of pending teachers
  getPendingTeachersCount(): Observable<number> {
    this.logger.info("Fetching pending teachers count");
    
    // Ensure we have a valid token
    const token = this.tokenService.getToken();
    if (!token) {
      this.logger.error('No authentication token available');
      return of(0);
    }
    
    // Add authorization header with proper format
    const headers = {
      Authorization: `${environment.bearerTokenPrefix}${token}`
    };
    
    this.logger.debug('Authorization header:', headers.Authorization);
    
    return this.http
      .get<any>(`${API_ENDPOINTS.ADMIN}/teachers/pending/count`, { headers })
      .pipe(
        tap(response => {
          this.logger.debug('Raw count response:', response);
        }),
        map(response => {
          // Handle different response formats
          if (typeof response === 'number') {
            return response;
          } else if (response && typeof response === 'object') {
            if (response.success && response.data && typeof response.data.count === 'number') {
              return response.data.count;
            } else if (response.count && typeof response.count === 'number') {
              return response.count;
            } else if (response.total && typeof response.total === 'number') {
              return response.total;
            }
          }
          
          // If we can't find a count, return 0
          this.logger.warn('Could not extract teachers count from response');
          return 0;
        }),
        tap(count => {
          this.logger.debug('Pending teachers count:', count);
        }),
        catchError((error) => {
          this.logger.error("Error fetching pending teachers count:", error);
          return of(0);
        })
      );
  }

  // Approve teacher
  approveTeacher(teacherId: string): Observable<any> {
    this.logger.info(`Approving teacher: ${teacherId}`);

    // Ensure we have a valid token
    const token = this.tokenService.getToken();
    if (!token) {
      this.logger.error('No authentication token available');
      return throwError(() => new Error('No authentication token'));
    }
    
    // Add authorization header with proper format
    const headers = {
      Authorization: `${environment.bearerTokenPrefix}${token}`
    };

    return this.http
      .put<any>(
        `${API_ENDPOINTS.ADMIN}/teachers/${teacherId}/approve`,
        {},
        { headers }
      )
      .pipe(
        tap(response => {
          this.logger.debug('Raw teacher approval response:', response);
        }),
        map(response => {
          // Handle different response formats
          if (response && typeof response === 'object') {
            if (response.success) {
              this.logger.debug('Teacher approval successful');
              return response;
            }
          }
          
          this.logger.warn('Unexpected response format for teacher approval');
          return response;
        }),
        catchError((error) => {
          this.logger.error('Error approving teacher:', error);
          return throwError(() => error);
        })
      );
  }

  // Reject teacher
  rejectTeacher(teacherId: string): Observable<any> {
    this.logger.info(`Rejecting teacher: ${teacherId}`);

    // Ensure we have a valid token
    const token = this.tokenService.getToken();
    if (!token) {
      this.logger.error('No authentication token available');
      return throwError(() => new Error('No authentication token'));
    }
    
    // Add authorization header with proper format
    const headers = {
      Authorization: `${environment.bearerTokenPrefix}${token}`
    };

    return this.http
      .delete<any>(`${API_ENDPOINTS.ADMIN}/teachers/${teacherId}/reject`, {
        headers
      })
      .pipe(
        tap(response => {
          this.logger.debug('Raw teacher rejection response:', response);
        }),
        map(response => {
          // Handle different response formats
          if (response && typeof response === 'object') {
            if (response.success) {
              this.logger.debug('Teacher rejection successful');
              return response;
            }
          }
          
          this.logger.warn('Unexpected response format for teacher rejection');
          return response;
        }),
        catchError((error) => {
          this.logger.error('Error rejecting teacher:', error);
          return throwError(() => error);
        })
      );
  }
}
