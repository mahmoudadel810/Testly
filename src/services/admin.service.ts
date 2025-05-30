import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../models/constants';
import { TokenService } from './token.service';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private logger: LoggingService
  ) {}

  // Get pending teachers
  getPendingTeachers(): Observable<any[]> {
    this.logger.info('Fetching pending teachers');

    const headers = {
      Authorization: 'N0de__' + this.tokenService.getToken(),
    };

    return this.http
      .get<any[]>(`${API_ENDPOINTS.ADMIN}/teachers/pending`, { headers })
      .pipe(
        tap((teachers) => {
          this.logger.debug('Fetched pending teachers count:', teachers.length);
        }),
        catchError((error) => {
          this.logger.error('Error fetching pending teachers:', error);
          return of([]);
        })
      );
  }

  // Get count of pending teachers
  getPendingTeachersCount(): Observable<number> {
    const headers = {
      Authorization: 'N0de__' + this.tokenService.getToken(),
    };

    return this.http
      .get<{ count: number }>(`${API_ENDPOINTS.ADMIN}/teachers/pending/count`, {
        headers,
      })
      .pipe(
        tap((response) => {
          this.logger.debug('Pending teachers count:', response.count);
        }),
        map((response) => response.count),
        catchError((error) => {
          this.logger.error('Error fetching pending teachers count:', error);
          return of(0);
        })
      );
  }

  // Approve teacher
  approveTeacher(teacherId: string): Observable<any> {
    this.logger.info(`Approving teacher: ${teacherId}`);

    const headers = {
      Authorization: 'N0de__' + this.tokenService.getToken(),
    };

    return this.http
      .put<any>(
        `${API_ENDPOINTS.ADMIN}/teachers/${teacherId}/approve`,
        {},
        { headers }
      )
      .pipe(
        tap((response) => {
          this.logger.debug('Teacher approval response:', response);
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

    const headers = {
      Authorization: 'N0de__' + this.tokenService.getToken(),
    };

    return this.http
      .delete<any>(`${API_ENDPOINTS.ADMIN}/teachers/${teacherId}/reject`, {
        headers,
      })
      .pipe(
        tap((response) => {
          this.logger.debug('Teacher rejection response:', response);
        }),
        catchError((error) => {
          this.logger.error('Error rejecting teacher:', error);
          return throwError(() => error);
        })
      );
  }
}
