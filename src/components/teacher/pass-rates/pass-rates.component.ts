import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { LoggingService } from '../../../services/logging.service';
import { Exam, ExamAttempt } from '../../../models/exam.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-pass-rates',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-4">
      <div class="row mb-4">
        <div class="col-12">
          <div class="card shadow-sm border-0">
            <div
              class="card-header bg-primary text-white d-flex justify-content-between align-items-center"
            >
              <h2 class="h4 mb-0">Exam Pass Rates</h2>
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
                <p class="mt-2 text-muted">Loading pass rate data...</p>
              </div>
            }

            <!-- Content -->
            @if (!loading && !error) {
              <div class="card-body">
                <!-- Overall Stats -->
                <div class="row mb-4">
                  <div class="col-md-4">
                    <div class="card border-0 bg-light">
                      <div class="card-body text-center">
                        <h5 class="card-title">Total Exams</h5>
                        <p class="display-4 fw-bold">{{ examStats.length }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-4">
                    <div class="card border-0 bg-light">
                      <div class="card-body text-center">
                        <h5 class="card-title">Overall Pass Rate</h5>
                        <p class="display-4 fw-bold">{{ overallPassRate }}%</p>
                      </div>
                    </div>
                  </div>

                  <div class="col-md-4">
                    <div class="card border-0 bg-light">
                      <div class="card-body text-center">
                        <h5 class="card-title">Total Attempts</h5>
                        <p class="display-4 fw-bold">{{ totalAttempts }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Pass Rate Charts -->
                <div class="row mb-4">
                  <div class="col-12">
                    <h4 class="h5 mb-3">Pass Rate by Exam</h4>

                    <div class="list-group">
                      @if (examStats.length === 0) {
                        <div class="text-center text-muted py-4">
                          <i class="fas fa-info-circle me-2"></i>No exam data
                          available yet.
                        </div>
                      }

                      @for (stat of examStats; track stat.exam._id) {
                        <div class="list-group-item">
                          <div
                            class="d-flex justify-content-between align-items-center mb-2"
                          >
                            <h5 class="mb-0">{{ stat.exam.title }}</h5>
                            <span
                              class="badge"
                              [ngClass]="{
                                'bg-danger': stat.passRate < 50,
                                'bg-warning':
                                  stat.passRate >= 50 && stat.passRate < 70,
                                'bg-success': stat.passRate >= 70
                              }"
                            >
                              {{ stat.passRate }}%
                            </span>
                          </div>

                          <!-- Progress Bar -->
                          <div class="progress mb-3" style="height: 10px">
                            <div
                              class="progress-bar"
                              [ngClass]="{
                                'bg-danger': stat.passRate < 50,
                                'bg-warning':
                                  stat.passRate >= 50 && stat.passRate < 70,
                                'bg-success': stat.passRate >= 70
                              }"
                              [style.width.%]="stat.passRate"
                              role="progressbar"
                              [attr.aria-valuenow]="stat.passRate"
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>

                          <!-- Stats Info -->
                          <div
                            class="d-flex justify-content-between align-items-center text-muted small"
                          >
                            <div>
                              <i class="fas fa-users me-1"></i>
                              {{ stat.studentCount }} students
                            </div>
                            <div>
                              <i class="fas fa-clipboard-check me-1"></i>
                              {{ stat.attemptCount }} attempts
                            </div>
                            <div>
                              <i class="fas fa-check-circle me-1"></i>
                              {{ stat.passCount }} passed
                            </div>
                            <div>
                              <a
                                [routerLink]="[
                                  '/teacher/exams',
                                  stat.exam._id,
                                  'attempts'
                                ]"
                                class="btn btn-sm btn-outline-primary"
                              >
                                <i class="fas fa-eye me-1"></i> View Details
                              </a>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
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

      .badge {
        font-size: 1rem;
        padding: 0.5em 0.75em;
      }

      .display-4 {
        font-size: 2.5rem;
      }

      .card-title {
        font-size: 1rem;
        color: #6c757d;
      }
    `,
  ],
})
export class PassRatesComponent implements OnInit {
  examStats: {
    exam: Exam;
    attemptCount: number;
    passCount: number;
    passRate: number;
    studentCount: number;
  }[] = [];

  loading = true;
  error = '';
  overallPassRate = 0;
  totalAttempts = 0;

  constructor(
    private examService: ExamService,
    private logger: LoggingService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Get teacher's exams and attempts in parallel
    forkJoin({
      exams: this.examService.getTeacherExams(),
      attempts: this.examService.getTeacherAttempts(),
    }).subscribe({
      next: ({ exams, attempts }) => {
        this.totalAttempts = attempts.length;

        // Process exam-specific stats
        this.processExamStats(exams, attempts);

        // Calculate overall pass rate
        const passedAttempts = attempts.filter((a) => a.passed).length;
        this.overallPassRate =
          attempts.length > 0
            ? Math.round((passedAttempts / attempts.length) * 100)
            : 0;

        this.loading = false;
      },
      error: (err) => {
        this.logger.error('Error loading pass rate data', err);
        this.error = 'Failed to load exam pass rate data';
        this.loading = false;
      },
    });
  }

  trackExamStat(index: number, stat: any): string {
    return stat.exam._id;
  }

  private processExamStats(exams: Exam[], attempts: ExamAttempt[]): void {
    this.examStats = exams.map((exam) => {
      // Get attempts for this exam
      const examAttempts = attempts.filter((a) => {
        const attemptExamId =
          typeof a.examId === 'string' ? a.examId : a.examId?._id;
        return attemptExamId === exam._id;
      });

      // Count unique students for this exam
      const uniqueStudentIds = new Set(
        examAttempts.map((a) =>
          typeof a.userId === 'string' ? a.userId : a.userId?._id
        )
      );

      // Calculate pass rate for this exam
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

    // Sort by pass rate (lowest first to highlight problem areas)
    this.examStats.sort((a, b) => a.passRate - b.passRate);
  }
}
