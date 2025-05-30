import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../../services/exam.service';
import { LoggingService } from '../../../services/logging.service';
import { Exam, ExamAttempt } from '../../../models/exam.model';

@Component({
  selector: 'app-student-attempts',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './student-attempts.component.html',
  styleUrls: ['./student-attempts.component.css'],
})
export class StudentAttemptsComponent implements OnInit {
  attempts: ExamAttempt[] = [];
  filteredAttempts: ExamAttempt[] = [];
  exams: Exam[] = [];
  loading = true;
  error = '';

  // Filters
  selectedExam = '';
  selectedStatus = '';
  searchTerm = '';

  constructor(
    private examService: ExamService,
    private logger: LoggingService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Load exams and attempts in parallel
    this.examService.getTeacherExams().subscribe({
      next: (exams) => {
        this.exams = exams;

        this.examService.getTeacherAttempts().subscribe({
          next: (attempts) => {
            this.attempts = attempts;
            this.filteredAttempts = [...attempts];
            this.loading = false;
          },
          error: (err) => {
            this.logger.error('Error loading attempts', err);
            this.error = 'Failed to load student attempts';
            this.loading = false;
          },
        });
      },
      error: (err) => {
        this.logger.error('Error loading exams', err);
        this.error = 'Failed to load exam data';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.filteredAttempts = this.attempts.filter((attempt) => {
      // Filter by exam
      if (
        this.selectedExam &&
        attempt.examId !== this.selectedExam &&
        typeof attempt.examId === 'object' &&
        attempt.examId._id !== this.selectedExam
      ) {
        return false;
      }

      // Filter by status
      if (this.selectedStatus === 'passed' && !attempt.passed) {
        return false;
      }
      if (this.selectedStatus === 'failed' && attempt.passed) {
        return false;
      }

      // Filter by search term (student name)
      if (this.searchTerm && typeof attempt.userId === 'object') {
        const studentName = attempt.userId?.username?.toLowerCase() || '';
        if (!studentName.includes(this.searchTerm.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }

  resetFilters(): void {
    this.selectedExam = '';
    this.selectedStatus = '';
    this.searchTerm = '';
    this.filteredAttempts = [...this.attempts];
  }

  formatDate(dateString: string | Date | undefined): string {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  getExamTitle(examId: string | { _id: string; title?: string }): string {
    if (typeof examId === 'object' && examId.title) {
      return examId.title;
    }

    const exam = this.exams.find((e) => e._id === examId);
    return exam?.title || 'Unknown Exam';
  }

  getStudentName(userId: string | { _id: string; username?: string }): string {
    if (typeof userId === 'object' && userId && 'username' in userId) {
      return userId.username || 'Unknown Student';
    }

    return 'Unknown Student';
  }
}
