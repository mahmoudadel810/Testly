import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
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
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.css'],
})
export class TeacherDashboardComponent implements OnInit {
  teacherName: string = '';
  stats = {
    totalExams: 0,
    totalStudents: 0,
    totalAttempts: 0,
    passRate: 0,
  };
  loading = true;
  error = '';

  // Track exam-specific stats
  examStats: {
    exam: Exam;
    attemptCount: number;
    passCount: number;
    passRate: number;
    studentCount: number;
  }[] = [];

  // Recent attempts for quick view
  recentAttempts: ExamAttempt[] = [];

  constructor(
    private authService: AuthService,
    private examService: ExamService,
    private logger: LoggingService
  ) {}

  ngOnInit(): void {
    this.loadTeacherInfo();
    this.loadStats();
  }

  private loadTeacherInfo(): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          this.teacherName = user.name || '';
        }
      },
      error: (err) => {
        this.logger.error('Error loading teacher info', err);
        this.error = 'Failed to load your profile information';
      },
    });
  }

  private loadStats(): void {
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
        // Ensure we have arrays to work with
        const examArray = Array.isArray(exams) ? exams : 
                         (exams && typeof exams === 'object' && 'data' in exams ? exams.data ?? [] : []);
        const attemptArray = Array.isArray(attempts) ? attempts : 
                           (attempts && typeof attempts === 'object' && 'data' in attempts ? attempts.data ?? [] : []);
        
        // Basic stats
        this.stats.totalExams = examArray.length;
        this.stats.totalAttempts = attemptArray.length;

        // Count unique students
        const uniqueStudentIds = new Set(
          attemptArray.map((a: ExamAttempt) =>
            typeof a.userId === 'string' ? a.userId : a.userId?._id
          )
        );
        this.stats.totalStudents = uniqueStudentIds.size;

        // Calculate overall pass rate
        const passedAttempts = attemptArray.filter((a: ExamAttempt) => a.passed).length;
        this.stats.passRate =
          attemptArray.length > 0
            ? Math.round((passedAttempts / attemptArray.length) * 100)
            : 0;

        // Process exam-specific stats
        this.processExamStats(examArray, attemptArray);

        // Get recent attempts
        this.recentAttempts = attemptArray
          .sort(
            (a: ExamAttempt, b: ExamAttempt) =>
              new Date(b.createdAt || '').getTime() -
              new Date(a.createdAt || '').getTime()
          )
          .slice(0, 5);

        this.loading = false;
      },
      error: (err) => {
        this.logger.error('Error loading teacher stats', err);
        this.error = 'Failed to load your statistics';
        this.loading = false;
      },
    });
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
        examAttempts.map((a) => {
          return typeof a.userId === 'string' ? a.userId : a.userId?._id;
        })
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

    // Sort by number of attempts (most popular first)
    this.examStats.sort((a, b) => b.attemptCount - a.attemptCount);
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
      return userId.username || 'Student';
    }
    return 'Student';
  }

  getExamTitle(
    examId: string | { _id: string; title?: string; description?: string }
  ): string {
    if (typeof examId === 'object' && examId && 'title' in examId) {
      return examId.title || 'Exam';
    }
    return 'Exam';
  }
}
