import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../../services/exam.service';
import { LoggingService } from '../../../services/logging.service';
import { Exam, ExamAttempt } from '../../../models/exam.model';
import { forkJoin } from 'rxjs';

// Interface for API responses
interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container py-4">
      <div class="row mb-4">
        <div class="col-12">
          <div class="card shadow-sm border-0">
            <div
              class="card-header bg-primary text-white d-flex justify-content-between align-items-center"
            >
              <h2 class="h4 mb-0">Detailed Reports</h2>
              <a routerLink="/teacher" class="btn btn-light btn-sm">
                <i class="fas fa-arrow-left me-1"></i> Back to Dashboard
              </a>
            </div>

            <!-- Error Message -->
            @if (error) {
              <div class="alert alert-danger m-3">
                <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
              </div>
            }

            <!-- Loading Spinner -->
            @if (loading) {
              <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Loading report data...</p>
              </div>
            }

            <!-- Content -->
            @if (!loading && !error) {
              <div class="card-body">
                <!-- Report Selection -->
                <div class="row mb-4">
                  <div class="col-md-6 mb-3">
                    <label for="reportType" class="form-label">Report Type</label>
                    <select
                      id="reportType"
                      class="form-select"
                      [(ngModel)]="selectedReportType"
                      (change)="changeReportType()"
                    >
                      <option value="summary">Summary Report</option>
                      <option value="exams">Exams Performance</option>
                      <option value="students">Student Performance</option>
                    </select>
                  </div>

                  @if (isReportTypeExams()) {
                    <div class="col-md-6 mb-3">
                      <label for="examFilter" class="form-label">Select Exam</label>
                      <select
                        id="examFilter"
                        class="form-select"
                        [(ngModel)]="selectedExamId"
                        (change)="filterByExam()"
                      >
                        <option value="">All Exams</option>
                        @for (exam of exams; track exam._id) {
                          <option [value]="exam._id">{{ exam.title }}</option>
                        }
                      </select>
                    </div>
                  }
                </div>

                <!-- Summary Report -->
                @if (isReportTypeSummary()) {
                  <div class="container-fluid px-0">
                    <div class="row">
                      <div class="col-12">
                        <h4 class="mb-3">Summary Statistics</h4>
                      </div>
                    </div>
                    
                    <div class="row mb-4">
                      <div class="col-md-3">
                        <div class="card border-0 bg-light">
                          <div class="card-body text-center">
                            <h5 class="card-title">Unique Students</h5>
                            <p class="display-4 fw-bold">{{ uniqueStudentCount }}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div class="col-md-3">
                        <div class="card border-0 bg-light">
                          <div class="card-body text-center">
                            <h5 class="card-title">Total Exams</h5>
                            <p class="display-4 fw-bold">{{ exams.length }}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div class="col-md-3">
                        <div class="card border-0 bg-light">
                          <div class="card-body text-center">
                            <h5 class="card-title">Total Attempts</h5>
                            <p class="display-4 fw-bold">{{ attempts.length }}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div class="col-md-3">
                        <div class="card border-0 bg-light">
                          <div class="card-body text-center">
                            <h5 class="card-title">Average Score</h5>
                            <p class="display-4 fw-bold">{{ averageScore }}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Recent Activity -->
                    <div class="row">
                      <div class="col-md-6">
                        <div class="card h-100">
                          <div class="card-header bg-light">
                            <h5 class="mb-0">Recent Activity</h5>
                          </div>
                          <div class="card-body">
                            <div class="list-group">
                              @if (recentAttempts.length === 0) {
                                <div class="text-center text-muted py-4">
                                  <i class="fas fa-info-circle me-2"></i>No recent
                                  exam attempts to display.
                                </div>
                              }
                              @for (attempt of recentAttempts; track trackAttempt(0, attempt)) {
                                <div class="list-group-item list-group-item-action">
                                  <div
                                    class="d-flex w-100 justify-content-between align-items-center"
                                  >
                                    <div>
                                      <h6 class="mb-1">
                                        <i [ngClass]="attempt.passed ? 'fas fa-check-circle text-success' : 'fas fa-times-circle text-danger'"></i>
                                        {{ getStudentName(attempt.userId) }} attempted
                                        {{ getExamTitle(attempt.examId) }}
                                      </h6>
                                      <p class="mb-1 text-muted small">
                                        Score:
                                        <span [ngClass]="attempt.passed ? 'text-success' : 'text-danger'">
                                          {{ attempt.score }} / {{ attempt.totalPoints }} ({{ (attempt.score / attempt.totalPoints) * 100 | number: '1.0-0' }}%)
                                        </span>
                                      </p>
                                    </div>
                                    <small>{{ formatDate(attempt.endTime || attempt.startTime) }}</small>
                                  </div>
                                </div>
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }

                <!-- Exams Performance Report -->
                @if (isReportTypeExams()) {
                  @if (selectedExamId === '') {
                    <div class="row">
                      <div class="col-12">
                        <div class="alert alert-info">
                          <i class="fas fa-info-circle me-2"></i>
                          Please select an exam from the dropdown to view detailed
                          performance data.
                        </div>
                      </div>
                    </div>
                  } @else {
                    <div class="row">
                      <div class="col-12">
                        <div class="card border-0">
                          <div class="card-body">
                            <h5 class="mb-3">
                              {{ selectedExamTitle }} - Performance Report
                            </h5>

                            <div class="row mb-4">
                              <div class="col-md-3">
                                <div class="card border-0 bg-light">
                                  <div class="card-body text-center">
                                    <h5 class="card-title">Total Attempts</h5>
                                    <p class="display-4 fw-bold">
                                      {{ selectedExamStats?.attemptCount || 0 }}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div class="col-md-3">
                                <div class="card border-0 bg-light">
                                  <div class="card-body text-center">
                                    <h5 class="card-title">Unique Students</h5>
                                    <p class="display-4 fw-bold">
                                      {{ selectedExamStats?.studentCount || 0 }}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div class="col-md-3">
                                <div class="card border-0 bg-light">
                                  <div class="card-body text-center">
                                    <h5 class="card-title">Pass Rate</h5>
                                    <p class="display-4 fw-bold">
                                      {{ selectedExamStats?.passRate || 0 }}%
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div class="col-md-3">
                                <div class="card border-0 bg-light">
                                  <div class="card-body text-center">
                                    <h5 class="card-title">Passed/Failed</h5>
                                    <p class="display-4 fw-bold">
                                      <span class="text-success">{{ selectedExamStats?.passCount || 0 }}</span>
                                      /
                                      <span class="text-danger">{{ (selectedExamStats?.attemptCount || 0) - (selectedExamStats?.passCount || 0) }}</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div class="text-center mt-4">
                              <a
                                [routerLink]="[
                                  '/teacher/exams',
                                  selectedExamId,
                                  'attempts'
                                ]"
                                class="btn btn-primary"
                              >
                                <i class="fas fa-eye me-2"></i> View All Attempts
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                }

                @if (!isReportTypeSummary() && !isReportTypeStudents() && !isReportTypeExams()) {
                  <div class="alert alert-info m-3">
                    <i class="fas fa-info-circle me-2"></i>Please select a report type to continue.
                  </div>
                }
                
                <!-- Student Performance Report -->
                @if (isReportTypeStudents()) {
                  <div class="row">
                    <div class="col-12">
                      <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Student performance reports show all students who have
                        attempted your exams.
                      </div>

                      <div class="table-responsive">
                        <table class="table table-hover">
                          <thead class="table-light">
                            <tr>
                              <th>Student</th>
                              <th class="text-center">Exams Taken</th>
                              <th class="text-center">Total Attempts</th>
                              <th class="text-center">Average Score</th>
                              <th class="text-center">Pass Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            @if (studentStats.length === 0) {
                              <tr>
                                <td colspan="5" class="text-center py-3 text-muted">
                                  <i class="fas fa-info-circle me-2"></i>No student
                                  data available yet.
                                </td>
                              </tr>
                            }
                            @for (stat of studentStats; track trackStudentStat(0, stat)) {
                              <tr>
                                <td>{{ stat.studentName }}</td>
                                <td class="text-center">{{ stat.examCount }}</td>
                                <td class="text-center">{{ stat.attemptCount }}</td>
                                <td class="text-center">
                                  {{ stat.averageScore }}%
                                </td>
                                <td class="text-center">
                                  <div class="progress" style="height: 8px">
                                    <div
                                      class="progress-bar"
                                      [ngClass]="{
                                        'bg-danger': stat.passRate < 50,
                                        'bg-warning':
                                          stat.passRate >= 50 && stat.passRate < 70,
                                        'bg-success': stat.passRate >= 70
                                      }"
                                      [style.width.%]="stat.passRate"
                                    ></div>
                                  </div>
                                  <small class="d-block mt-1"
                                    >{{ stat.passRate }}%</small
                                  >
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        transition: all 0.3s ease;
      }

      .progress {
        border-radius: 0.25rem;
      }

      .display-4 {
        font-size: 2.5rem;
      }

      .card-title {
        font-size: 1rem;
        color: #6c757d;
      }

      .table th {
        font-weight: 600;
      }
    `,
  ],
})
export class ReportsComponent implements OnInit {
  exams: Exam[] = [];
  attempts: ExamAttempt[] = [];
  loading = true;
  error = '';

  // Report type selection
  selectedReportType: 'summary' | 'exams' | 'students' = 'summary';
  selectedExamId = '';
  selectedExamTitle = '';

  // Summary stats
  uniqueStudentCount = 0;
  averageScore = 0;
  topExams: {
    exam: Exam;
    attemptCount: number;
    passCount: number;
    passRate: number;
    studentCount: number;
  }[] = [];
  recentAttempts: ExamAttempt[] = [];

  // Exam-specific stats
  selectedExamStats: {
    attemptCount: number;
    passCount: number;
    passRate: number;
    studentCount: number;
  } | null = null;

  // Student stats
  studentStats: {
    studentId: string;
    studentName: string;
    examCount: number;
    attemptCount: number;
    passCount: number;
    passRate: number;
    averageScore: number;
  }[] = [];

  constructor(
    private examService: ExamService,
    private logger: LoggingService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;

    // Get teacher's exams and attempts in parallel
    forkJoin({
      exams: this.examService.getTeacherExams(),
      attempts: this.examService.getTeacherAttempts(),
    }).subscribe({
      next: ({ exams, attempts }: { 
        exams: Exam[] | ApiResponse<Exam[]>, 
        attempts: ExamAttempt[] | ApiResponse<ExamAttempt[]> 
      }) => {
        // Handle the API response format which may have a data wrapper
        // Handle both direct array responses and API response wrapper format
        // Use non-null assertion with fallback to empty array to satisfy TypeScript
        this.exams = Array.isArray(exams) ? exams : 
                    (exams && typeof exams === 'object' && 'data' in exams ? exams.data ?? [] : []);
        this.attempts = Array.isArray(attempts) ? attempts : 
                       (attempts && typeof attempts === 'object' && 'data' in attempts ? attempts.data ?? [] : []);

        // Process summary stats
        this.processSummaryStats();

        // Process student stats
        this.processStudentStats();

        this.loading = false;
      },
      error: (err) => {
        this.logger.error('Error loading report data', err);
        this.error = 'Failed to load report data';
        this.loading = false;
      },
    });
  }

  changeReportType(): void {
    if (this.isReportTypeExams()) {
      this.selectedExamId = '';
      this.selectedExamStats = null;
    }
  }
  
  trackExamStat(index: number, stat: any): string {
    return stat.exam._id;
  }

  filterByExam(): void {
    if (!this.selectedExamId) {
      this.selectedExamStats = null;
      this.selectedExamTitle = '';
      return;
    }

    const exam = this.exams.find((e) => e._id === this.selectedExamId);
    if (!exam) return;

    this.selectedExamTitle = exam.title;

    // Get attempts for this exam
    const examAttempts = this.attempts.filter((a) => {
      const attemptExamId =
        typeof a.examId === 'string' ? a.examId : a.examId?._id;
      return attemptExamId === this.selectedExamId;
    });

    // Count unique students
    const uniqueStudentIds = new Set(
      examAttempts.map((a) =>
        typeof a.userId === 'string' ? a.userId : a.userId?._id
      )
    );

    // Calculate pass rate
    const passedAttempts = examAttempts.filter((a) => a.passed).length;
    const passRate =
      examAttempts.length > 0
        ? Math.round((passedAttempts / examAttempts.length) * 100)
        : 0;

    this.selectedExamStats = {
      attemptCount: examAttempts.length,
      passCount: passedAttempts,
      passRate,
      studentCount: uniqueStudentIds.size,
    };
  }

  // Helper methods to fix type checking issues with string literal comparisons
  isReportTypeExams(): boolean {
    return this.selectedReportType === 'exams';
  }
  
  isReportTypeStudents(): boolean {
    return this.selectedReportType === 'students';
  }
  
  isReportTypeSummary(): boolean {
    return this.selectedReportType === 'summary';
  }

  private processSummaryStats(): void {
    // Ensure attempts is an array
    if (!Array.isArray(this.attempts)) {
      this.attempts = [];
    }
    
    // Count unique students
    const uniqueStudentIds = new Set(
      this.attempts.map((a) =>
        typeof a.userId === 'string' ? a.userId : a.userId?._id
      )
    );
    this.uniqueStudentCount = uniqueStudentIds.size;

    // Calculate average score
    const totalScorePercentage = this.attempts.reduce((sum, attempt) => {
      return sum + (attempt.score / attempt.totalPoints) * 100;
    }, 0);
    this.averageScore =
      this.attempts.length > 0
        ? Math.round(totalScorePercentage / this.attempts.length)
        : 0;

    // Ensure exams is an array
    if (!Array.isArray(this.exams)) {
      this.exams = [];
    }
    
    // Process exam stats
    const examStats = this.exams.map((exam) => {
      // Get attempts for this exam
      const examAttempts = this.attempts.filter((a) => {
        const attemptExamId =
          typeof a.examId === 'string' ? a.examId : a.examId?._id;
        return attemptExamId === exam._id;
      });

      // Count unique students
      const uniqueStudentIds = new Set(
        examAttempts.map((a) =>
          typeof a.userId === 'string' ? a.userId : a.userId?._id
        )
      );

      // Calculate pass rate
      const passedAttempts = examAttempts.filter((a) => a.passed).length;
      const passRate =
        examAttempts.length > 0
          ? Math.round((passedAttempts / examAttempts.length) * 100)
          : 0;

      return {
        exam,
        attemptCount: examAttempts.length,
        passCount: passedAttempts,
        passRate,
        studentCount: uniqueStudentIds.size,
      };
    });

    // Sort by number of attempts (most popular first)
    this.topExams = [...examStats]
      .sort((a, b) => b.attemptCount - a.attemptCount)
      .slice(0, 5);

    // Get recent attempts
    this.recentAttempts = [...this.attempts]
      .sort((a, b) => {
        const dateA = a.endTime || a.startTime;
        const dateB = b.endTime || b.startTime;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(0, 5);
  }



  // Method for tracking attempts in lists
  trackAttempt(index: number, attempt: any): string {
    return attempt._id;
  }
  
  // Method for tracking student stats in lists
  trackStudentStat(index: number, stat: any): string {
    return stat.studentId;
  }

  private processStudentStats(): void {
    // Ensure attempts is an array
    if (!Array.isArray(this.attempts)) {
      this.attempts = [];
    }
    
    // Group attempts by student
    const studentAttemptsMap = new Map<string, ExamAttempt[]>();

    this.attempts.forEach((attempt) => {
      const studentId =
        typeof attempt.userId === 'string'
          ? attempt.userId
          : attempt.userId?._id;

      if (!studentId) return;

      if (!studentAttemptsMap.has(studentId)) {
        studentAttemptsMap.set(studentId, []);
      }

      studentAttemptsMap.get(studentId)?.push(attempt);
    });

    // Process stats for each student
    this.studentStats = Array.from(studentAttemptsMap.entries()).map(
      ([studentId, attempts]) => {
        // Get student name
        const studentName = this.getStudentName(attempts[0].userId);

        // Count unique exams
        const uniqueExamIds = new Set(
          attempts.map((a) =>
            typeof a.examId === 'string' ? a.examId : a.examId?._id
          )
        );

        // Calculate pass rate
        const passedAttempts = attempts.filter((a) => a.passed).length;
        const passRate =
          attempts.length > 0
            ? Math.round((passedAttempts / attempts.length) * 100)
            : 0;

        // Calculate average score
        const totalScorePercentage = attempts.reduce((sum, attempt) => {
          return sum + (attempt.score / attempt.totalPoints) * 100;
        }, 0);
        const averageScore =
          attempts.length > 0
            ? Math.round(totalScorePercentage / attempts.length)
            : 0;

        return {
          studentId,
          studentName,
          examCount: uniqueExamIds.size,
          attemptCount: attempts.length,
          passCount: passedAttempts,
          passRate,
          averageScore,
        };
      }
    );

    // Sort by number of attempts (most active first)
    this.studentStats.sort((a, b) => b.attemptCount - a.attemptCount);
  }

  formatDate(dateString: string | Date | undefined): string {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  getStudentName(
    userId: string | { _id: string; username?: string; email?: string }
  ): string {
    if (typeof userId === 'object' && userId && 'username' in userId) {
      return userId.username || 'Unknown Student';
    }
    return 'Unknown Student';
  }

  getExamTitle(
    examId: string | { _id: string; title?: string; description?: string }
  ): string {
    if (typeof examId === 'object' && examId && 'title' in examId) {
      return examId.title || 'Unknown Exam';
    }

    const exam = this.exams.find((e) => e._id === examId);
    return exam?.title || 'Unknown Exam';
  }
}
