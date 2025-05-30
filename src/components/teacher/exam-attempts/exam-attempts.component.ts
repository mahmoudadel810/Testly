import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { LoggingService } from '../../../services/logging.service';
import { Exam, ExamAttempt } from '../../../models/exam.model';
import { switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';

@Component({
  selector: 'app-exam-attempts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exam-attempts.component.html',
  styleUrls: ['./exam-attempts.component.css'],
})
export class ExamAttemptsComponent implements OnInit {
  exam = signal<Exam | null>(null);
  attempts = signal<ExamAttempt[]>([]);
  loading = signal(true);
  error = signal('');

  // Computed properties
  uniqueStudentCount = computed(() => {
    const currentAttempts = this.attempts();
    const uniqueStudentIds = new Set(
      currentAttempts.map((attempt) => {
        return typeof attempt.userId === 'string'
          ? attempt.userId
          : attempt.userId?._id || '';
      })
    );
    return uniqueStudentIds.size;
  });

  passRate = computed(() => {
    const currentAttempts = this.attempts();
    if (currentAttempts.length === 0) return 0;
    const passedAttempts = currentAttempts.filter(
      (attempt) => attempt.passed
    ).length;
    return Math.round((passedAttempts / currentAttempts.length) * 100);
  });

  averageScore = computed(() => {
    const currentAttempts = this.attempts();
    if (currentAttempts.length === 0) return 0;
    const totalScore = currentAttempts.reduce(
      (sum, attempt) => sum + (attempt.score / attempt.totalPoints) * 100,
      0
    );
    return Math.round(totalScore / currentAttempts.length);
  });

  constructor(
    private route: ActivatedRoute,
    private examService: ExamService,
    private logger: LoggingService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadExamAttempts();
  }

  private loadExamAttempts(): void {
    this.route.paramMap
      .pipe(
        take(1),
        switchMap((params) => {
          const examId = params.get('id');
          if (!examId) {
            throw new Error('Exam ID not provided');
          }

          return this.examService.getExam(examId).pipe(
            switchMap((exam) => {
              this.exam.set(exam);
              return this.examService.getExamAttempts(examId);
            })
          );
        })
      )
      .subscribe({
        next: (attempts) => {
          this.attempts.set(attempts);
          this.loading.set(false);
        },
        error: (err) => {
          this.logger.error('Error loading exam attempts', err);
          this.error.set('Failed to load exam attempts. Please try again.');
          this.loading.set(false);
          this.toastr.error('Failed to load exam attempts. Please try again.');
        },
      });
  }

  formatDate(dateString: string | Date | undefined): string {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  deleteAttempt(attemptId: string | undefined): void {
    if (!attemptId) {
      this.toastr.warning('Attempt ID is missing');
      return;
    }

    if (confirm('Are you sure you want to delete this attempt?')) {
      this.examService
        .getExamAttempts(attemptId)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.attempts.update((attempts) =>
              attempts.filter((attempt) => attempt._id !== attemptId)
            );
            this.toastr.success('Attempt deleted successfully');
          },
          error: (err: any) => {
            this.toastr.error('Failed to delete attempt. Please try again.');
            console.error('Error deleting attempt:', err);
          },
        });
    }
  }

  getStudentName(
    userId:
      | string
      | { _id?: string; username?: string; email?: string }
      | undefined
  ): string {
    if (!userId) return 'Unknown Student';
    if (typeof userId === 'object' && 'username' in userId) {
      return userId.username || 'Unknown Student';
    }
    return 'Unknown Student';
  }
}
