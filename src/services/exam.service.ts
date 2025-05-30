/** @format */

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError, map, of, tap, throwError } from "rxjs";
import { Exam, ExamAttempt } from "../models/exam.model";
import { TokenService } from "./token.service";
import { LoggingService } from "./logging.service";
import { API_ENDPOINTS } from "../models/constants";
import { environment } from "../environments/environment";

@Injectable({
  providedIn: "root"
})
export class ExamService {
  deleteExamAttempt(attemptId: string) {
    throw new Error("Method not implemented.");
  }
  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private logger: LoggingService
  ) {}

  getExam(id: string): Observable<Exam> {
    return this.http.get<Exam>(`${API_ENDPOINTS.BASE_URL}/exam/exams/${id}`);
  }

  // Get all confirmed teachers for the teacher selection UI
  getConfirmedTeachers(): Observable<any[]> {
    return this.http
      .get<any[]>(`${API_ENDPOINTS.AUTH}/teachers/confirmed`)
      .pipe(
        tap((teachers) =>
          this.logger.debug("Confirmed teachers loaded:", teachers.length)
        ),
        catchError((error) => {
          this.logger.error("Error fetching confirmed teachers:", error);
          return of([]);
        })
      );
  }

  // Get exams by teacher ID
  getExamsByTeacher(teacherId: string): Observable<Exam[]> {
    return this.http
      .get<Exam[]>(`${API_ENDPOINTS.BASE_URL}/exam/exams/teacher/${teacherId}`)
      .pipe(
        tap((exams) =>
          this.logger.debug(
            `Exams for teacher ${teacherId} loaded:`,
            exams.length
          )
        ),
        catchError((error) => {
          this.logger.error(
            `Error fetching exams for teacher ${teacherId}:`,
            error
          );
          return of([]);
        })
      );
  }

  startExam(examId: string): Observable<ExamAttempt> {
    // Backend now uses attemptController.startExam, which allows resuming
    return this.http.post<ExamAttempt>(
      `${API_ENDPOINTS.BASE_URL}/exam/attempt/startExam`,
      { examId } // Correct payload structure
    );
  }

  submitExam(attemptId: string, answers: any[]): Observable<ExamAttempt> {
    return this.http.post<ExamAttempt>(
      `${API_ENDPOINTS.BASE_URL}/exam/attempts/submit`,
      {
        attemptId,
        answers
      }
    );
  }

  getAttempts(): Observable<ExamAttempt[]> {
    return this.http.get<ExamAttempt[]>(
      `${API_ENDPOINTS.BASE_URL}/exam/attempts`
    );
  }

  getAttempt(id: string): Observable<ExamAttempt> {
    return this.http.get<ExamAttempt>(
      `${API_ENDPOINTS.BASE_URL}/exam/attempts/${id}`
    );
  }

  // Teacher endpoints
  getTeacherExams(): Observable<Exam[]> {
    const headers = {
      Authorization:
        environment.bearerTokenPrefix + this.tokenService.getToken()
    };

    // Use the teacher-specific endpoint to get exams created by the current teacher
    return this.http
      .get<Exam[]>(`${API_ENDPOINTS.EXAM}/teacher/exams`, { headers })
      .pipe(
        tap((exams) =>
          this.logger.debug("Teacher exams loaded:", exams.length)
        ),
        catchError((error) => {
          this.logger.error("Error fetching teacher exams:", error);
          return of([]);
        })
      );
  }

  getTeacherAttempts(): Observable<ExamAttempt[]> {
    const headers = {
      Authorization:
        environment.bearerTokenPrefix + this.tokenService.getToken()
    };

    return this.http
      .get<ExamAttempt[]>(`${API_ENDPOINTS.EXAM}/teacher/attempts`, { headers })
      .pipe(
        tap((attempts) =>
          this.logger.debug("Teacher attempts loaded:", attempts.length)
        ),
        catchError((error) => {
          this.logger.error("Error fetching teacher attempts:", error);
          return of([]);
        })
      );
  }

  getExamAttempts(examId: string): Observable<ExamAttempt[]> {
    const headers = {
      Authorization:
        environment.bearerTokenPrefix + this.tokenService.getToken()
    };

    return this.http
      .get<ExamAttempt[]>(
        `${API_ENDPOINTS.EXAM}/teacher/exams/${examId}/attempts`,
        { headers }
      )
      .pipe(
        tap((attempts) =>
          this.logger.debug(
            `Attempts for exam ${examId} loaded:`,
            attempts.length
          )
        ),
        catchError((error) => {
          this.logger.error(
            `Error fetching attempts for exam ${examId}:`,
            error
          );
          return of([]);
        })
      );
  }

  createTeacherExam(exam: Exam): Observable<Exam> {
    const headers = {
      Authorization:
        environment.bearerTokenPrefix + this.tokenService.getToken()
    };

    return this.http
      .post<Exam>(`${API_ENDPOINTS.EXAM}/teacher/exams`, exam, {
        headers
      })
      .pipe(
        tap((result) => this.logger.debug("Teacher exam created successfully")),
        catchError((error) => {
          this.logger.error("Error creating teacher exam:", error);
          return throwError(() => error);
        })
      );
  }

  updateTeacherExam(id: string, exam: Exam): Observable<Exam> {
    const headers = {
      Authorization:
        environment.bearerTokenPrefix + this.tokenService.getToken()
    };

    return this.http
      .put<Exam>(`${API_ENDPOINTS.EXAM}/teacher/exams/${id}`, exam, {
        headers
      })
      .pipe(
        tap((result) => this.logger.debug("Teacher exam updated successfully")),
        catchError((error) => {
          this.logger.error("Error updating teacher exam:", error);
          return throwError(() => error);
        })
      );
  }

  deleteTeacherExam(id: string): Observable<any> {
    const headers = {
      Authorization:
        environment.bearerTokenPrefix + this.tokenService.getToken()
    };

    return this.http
      .delete(`${API_ENDPOINTS.EXAM}/teacher/exams/${id}`, {
        headers
      })
      .pipe(
        tap((result) => this.logger.debug("Teacher exam deleted successfully")),
        catchError((error) => {
          this.logger.error("Error deleting teacher exam:", error);
          return throwError(() => error);
        })
      );
  }

  getTeacherStudents(): Observable<any[]> {
    // Since there's no proper endpoint, return an empty array
    this.logger.debug(
      "No backend endpoint for teacher students, returning empty array"
    );
    return of([]);
  }

  // Admin endpoints (unchanged)
  createExam(exam: Exam): Observable<Exam> {
    const headers = {
      Authorization:
        environment.bearerTokenPrefix + this.tokenService.getToken()
    };

    return this.http.post<Exam>(`${API_ENDPOINTS.ADMIN}/exams`, exam, {
      headers
    });
  }

  updateExam(id: string, exam: Exam): Observable<Exam> {
    const headers = {
      Authorization:
        environment.bearerTokenPrefix + this.tokenService.getToken()
    };

    return this.http.put<Exam>(`${API_ENDPOINTS.ADMIN}/exams/${id}`, exam, {
      headers
    });
  }

  deleteExam(id: string): Observable<any> {
    const headers = {
      Authorization:
        environment.bearerTokenPrefix + this.tokenService.getToken()
    };

    return this.http.delete(`${API_ENDPOINTS.ADMIN}/exams/${id}`, { headers });
  }

  getAllAttempts(): Observable<ExamAttempt[]> {
    const headers = {
      Authorization:
        environment.bearerTokenPrefix + this.tokenService.getToken()
    };

    return this.http.get<ExamAttempt[]>(`${API_ENDPOINTS.ADMIN}/attempts`, {
      headers
    });
  }

  getAdminExams(): Observable<Exam[]> {
    const headers = {
      Authorization:
        environment.bearerTokenPrefix + this.tokenService.getToken()
    };

    return this.http.get<Exam[]>(`${API_ENDPOINTS.ADMIN}/exams`, { headers });
  }
}
