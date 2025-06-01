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
    const url = `${API_ENDPOINTS.BASE_URL}/exam/exams/${id}`;
    this.logger.debug(`Fetching exam details from: ${url}`);
    
    // Ensure we have a valid token
    const token = this.tokenService.getToken();
    
    // Add authorization header with proper format
    const headers = {
      Authorization: `${environment.bearerTokenPrefix}${token}`
    };
    
    // Define an interface for the API response format
    interface ApiResponse {
      success: boolean;
      data: Exam;
      message: string;
    }
    
    return this.http.get<ApiResponse>(url, { headers })
      .pipe(
        map(response => {
          // Check if response matches the expected format
          if (response && response.success && response.data) {
            this.logger.debug(`API returned success response with data for exam ${id}`);
            return response.data;
          } else {
            this.logger.error(`API response for exam ${id} does not match expected format:`, response);
            throw new Error('API response format is invalid');
          }
        }),
        tap(exam => {
          // Log whether questions were loaded
          if (exam && exam.questions && Array.isArray(exam.questions)) {
            this.logger.debug(`Exam ${id} loaded with ${exam.questions.length} questions`);
          } else {
            this.logger.warn(`Exam ${id} loaded but no questions array found`);
          }
        }),
        catchError(error => {
          this.logger.error(`Error fetching exam ${id}:`, error);
          return throwError(() => error);
        })
      );
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
    // Use the original URL format which seems to be expected by the API
    const url = `${API_ENDPOINTS.BASE_URL}/exam/exams/teacher/${teacherId}`;
    this.logger.debug(`Fetching exams from: ${url}`);
    
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
    
    return this.http
      .get<any>(url, { headers })
      .pipe(
        tap(response => {
          // Log the raw response to debug what's coming back
          this.logger.debug(`Raw API response for teacher ${teacherId}:`, response);
          
          // Check if response is empty or null
          if (!response) {
            this.logger.warn(`Empty response received for teacher ${teacherId}`);
          }
        }),
        map(response => {
          // Handle different response formats
          if (Array.isArray(response)) {
            return response as Exam[];
          } else if (response && typeof response === 'object') {
            // Check for common response patterns
            if (response.exams && Array.isArray(response.exams)) {
              return response.exams as Exam[];
            } else if (response.data && Array.isArray(response.data)) {
              return response.data as Exam[];
            } else if (response.items && Array.isArray(response.items)) {
              return response.items as Exam[];
            } else {
              // Try to extract array from response
              const possibleArray = Object.values(response).find(val => Array.isArray(val));
              if (possibleArray) {
                return possibleArray as Exam[];
              }
            }
          }
          
          // If we can't extract an array, return empty array
          this.logger.warn(`Could not extract exams array from response for teacher ${teacherId}`);
          return [] as Exam[];
        }),
        tap(exams => {
          this.logger.debug(`Exams for teacher ${teacherId} loaded:`, exams.length);
          
          // Log additional info if no exams were found
          if (exams.length === 0) {
            this.logger.warn(`No exams found for teacher ${teacherId}. Check API endpoint.`);
          }
        }),
        catchError((error) => {
          this.logger.error(`Error fetching exams for teacher ${teacherId}:`, error);
          return of([]);
        })
      );
  }

  startExam(examId: string): Observable<ExamAttempt> {
    const url = `${API_ENDPOINTS.BASE_URL}/exam/attempt/startExam`;
    this.logger.debug(`Starting exam with ID ${examId} at: ${url}`);
    
    // Ensure we have a valid token
    const token = this.tokenService.getToken();
    if (!token) {
      this.logger.error('No authentication token available for starting exam');
      return throwError(() => new Error('Authentication token not available'));
    }
    
    // Add authorization header with proper format
    const headers = {
      Authorization: `${environment.bearerTokenPrefix}${token}`
    };
    
    // Define interface for the API response format
    interface ApiResponse {
      success: boolean;
      data: ExamAttempt;
      message: string;
    }
    
    return this.http.post<ApiResponse | ExamAttempt>(
      url,
      { examId }, // Correct payload structure
      { headers }
    ).pipe(
      map(response => {
        // Check if the response is in the expected format with success, data, message
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
          const apiResp = response as ApiResponse;
          this.logger.debug(`Exam ${examId} started successfully, got attempt ID: ${apiResp.data._id || 'unknown'}`);
          return apiResp.data;
        } else {
          // If response is directly the ExamAttempt
          this.logger.debug(`Exam ${examId} started, direct response format`);
          return response as ExamAttempt;
        }
      }),
      catchError(error => {
        this.logger.error(`Error starting exam ${examId}:`, error);
        return throwError(() => error);
      })
    );
  }

  submitExam(attemptId: string, answers: any[]): Observable<ExamAttempt> {
    const url = `${API_ENDPOINTS.BASE_URL}/exam/attempts/submit`;
    this.logger.debug(`Submitting exam attempt ${attemptId} with ${answers.length} answers`);
    
    // Ensure we have a valid token
    const token = this.tokenService.getToken();
    if (!token) {
      this.logger.error('No authentication token available for submitting exam');
      return throwError(() => new Error('Authentication token not available'));
    }
    
    // Add authorization header with proper format
    const headers = {
      Authorization: `${environment.bearerTokenPrefix}${token}`
    };
    
    // Define interface for the API response format
    interface ApiResponse {
      success: boolean;
      data: ExamAttempt;
      message: string;
    }
    
    return this.http.post<ApiResponse | ExamAttempt>(
      url,
      {
        attemptId,
        answers
      },
      { headers }
    ).pipe(
      map(response => {
        // Check if the response is in the expected format with success, data, message
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
          const apiResp = response as ApiResponse;
          this.logger.debug(`Exam attempt ${attemptId} submitted successfully: ${apiResp.message}`);
          return apiResp.data;
        } else {
          // If response is directly the ExamAttempt
          this.logger.debug(`Exam attempt ${attemptId} submitted, direct response format`);
          return response as ExamAttempt;
        }
      }),
      catchError(error => {
        this.logger.error(`Error submitting exam attempt ${attemptId}:`, error);
        return throwError(() => error);
      })
    );
  }

  getAttempts(): Observable<ExamAttempt[]> {
    const headers = {
      Authorization:
        environment.bearerTokenPrefix + this.tokenService.getToken()
    };
    
    return this.http.get<any>(
      `${API_ENDPOINTS.BASE_URL}/exam/attempts`,
      { headers }
    ).pipe(
      map(response => {
        // Check if response is array, if not, try to extract attempts from response
        if (Array.isArray(response)) {
          return response as ExamAttempt[];
        } else if (response && typeof response === 'object') {
          // If response is an object, try to find an array property
          // Common API patterns might return { attempts: [...] } or { data: [...] }
          const possibleArrayProps = ['attempts', 'data', 'results', 'items'];
          for (const prop of possibleArrayProps) {
            if (Array.isArray(response[prop])) {
              return response[prop] as ExamAttempt[];
            }
          }
          // If we can't find an array in known properties, try to use Object.values
          const values = Object.values(response);
          if (values.length > 0 && Array.isArray(values[0])) {
            return values[0] as ExamAttempt[];
          }
        }
        // If we can't extract an array, return empty array
        this.logger.error('Unexpected response format from attempts API:', response);
        return [] as ExamAttempt[];
      }),
      tap(attempts => this.logger.debug('User attempts loaded:', attempts.length)),
      catchError(error => {
        this.logger.error('Error fetching user attempts:', error);
        return of([]);
      })
    );
  }

  getAttempt(id: string): Observable<ExamAttempt> {
    const url = `${API_ENDPOINTS.BASE_URL}/exam/attempts/${id}`;
    this.logger.debug(`Fetching exam attempt with ID: ${id}`);
    
    // Ensure we have a valid token
    const token = this.tokenService.getToken();
    if (!token) {
      this.logger.error('No authentication token available for fetching exam attempt');
      return throwError(() => new Error('Authentication token not available'));
    }
    
    // Add authorization header with proper format
    const headers = {
      Authorization: `${environment.bearerTokenPrefix}${token}`
    };
    
    // Define interface for the API response format
    interface ApiResponse {
      success: boolean;
      data: ExamAttempt;
      message: string;
    }
    
    return this.http.get<ApiResponse | ExamAttempt>(url, { headers })
      .pipe(
        map(response => {
          // Check if response matches the expected format
          if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            const apiResp = response as ApiResponse;
            this.logger.debug(`Exam attempt ${id} loaded successfully: ${apiResp.message}`);
            return apiResp.data;
          } else {
            // If response is directly the ExamAttempt object
            this.logger.debug(`Exam attempt ${id} loaded with direct format`);
            return response as ExamAttempt;
          }
        }),
        tap(attempt => {
          if (attempt) {
            this.logger.debug(`Exam attempt ${id} loaded with score: ${attempt.score || 'N/A'}`);
          } else {
            this.logger.warn(`Exam attempt ${id} loaded but seems to be empty or invalid`);
          }
        }),
        catchError(error => {
          this.logger.error(`Error fetching exam attempt ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  getTeacherExams(): Observable<Exam[]> {
    const headers = {
      Authorization:
        environment.bearerTokenPrefix + this.tokenService.getToken()
    };

    // Define interface for the API response format
    interface ApiResponse {
      success: boolean;
      data: Exam[];
      message: string;
    }

    // Use the teacher-specific endpoint to get exams created by the current teacher
    return this.http
      .get<ApiResponse | Exam[]>(`${API_ENDPOINTS.EXAM}/teacher/exams`, { headers })
      .pipe(
        map(response => {
          // Check if response is in the wrapper format
          if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            const apiResponse = response as ApiResponse;
            this.logger.debug("Teacher exams loaded from API response:", apiResponse.data.length);
            return apiResponse.data;
          } else {
            // Handle the case where direct array is returned
            const exams = response as Exam[];
            this.logger.debug("Teacher exams loaded directly:", exams.length);
            return exams;
          }
        }),
        tap(exams => {
          // Log whether exams were loaded
          if (!exams || !Array.isArray(exams)) {
            this.logger.warn("Unexpected exams format, empty array will be used");
          }
        }),
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

    // Define interface for the API response format
    interface ApiResponse {
      success: boolean;
      data: ExamAttempt[];
      message: string;
    }

    return this.http
      .get<ApiResponse | ExamAttempt[]>(`${API_ENDPOINTS.EXAM}/teacher/attempts`, { headers })
      .pipe(
        map(response => {
          // Check if response is in the wrapper format
          if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            const apiResponse = response as ApiResponse;
            this.logger.debug("Teacher attempts loaded from API response:", apiResponse.data.length);
            return apiResponse.data;
          } else {
            // Handle the case where direct array is returned
            const attempts = response as ExamAttempt[];
            this.logger.debug("Teacher attempts loaded directly:", attempts.length);
            return attempts;
          }
        }),
        tap(attempts => {
          // Log whether attempts were loaded
          if (!attempts || !Array.isArray(attempts)) {
            this.logger.warn("Unexpected attempts format, empty array will be used");
          }
        }),
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
