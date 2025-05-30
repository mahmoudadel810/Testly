/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../../services/exam.service';
import { AuthService } from '../../../services/auth.service';
import { ExamAttempt, Exam } from '../../../models/exam.model';
import { User } from '../../../models/user.model';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

@Component({
  selector: 'app-view-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-results.component.html',
  styleUrls: ['./view-results.component.css'],
})
export class ViewResultsComponent implements OnInit, OnDestroy {
  attempts: ExamAttempt[] = [];
  filteredAttempts: ExamAttempt[] = [];
  loading = true;
  error = '';
  exams: { [key: string]: Exam } = {};
  users: { [key: string]: User } = {};
  dataLoaded = {
    attempts: false,
    exams: false,
    users: false,
  };

  // Search functionality
  searchTerm: string = '';

  // Sorting functionality
  sortColumn: string = 'time';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Status filter
  statusFilter: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private examService: ExamService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadResults();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public loadResults(): void {
    this.loading = true;
    this.error = '';

    const isRefresh = this.dataLoaded.attempts;

    if (!isRefresh) {
      this.dataLoaded = {
        attempts: false,
        exams: false,
        users: false,
      };
      this.attempts = [];
      this.filteredAttempts = [];
      this.exams = {};
      this.users = {};
    }

    const attemptsSubscription = this.examService.getAllAttempts().subscribe({
      next: (attempts) => {
        console.log('Got attempts:', attempts);
        this.attempts = attempts.filter(
          (attempt) =>
            attempt &&
            attempt.score !== undefined &&
            attempt.totalPoints &&
            attempt.examId &&
            attempt.userId
        );

        this.filteredAttempts = [...this.attempts];
        this.dataLoaded.attempts = true;

        if (this.attempts.length === 0) {
          this.loading = false;
          return;
        }

        const examIds = [
          ...new Set(
            this.attempts.map((attempt) =>
              typeof attempt.examId === 'string'
                ? attempt.examId
                : attempt.examId._id
            )
          ),
        ];

        const userIds = [
          ...new Set(
            this.attempts.map((attempt) =>
              typeof attempt.userId === 'string'
                ? attempt.userId
                : attempt.userId._id
            )
          ),
        ];

        const examRequests = examIds.map((examId) =>
          this.examService.getExam(examId).pipe(
            catchError((err) => {
              console.error(`Failed to load exam ${examId}:`, err);
              return of(null);
            })
          )
        );

        const userRequests = userIds.map((userId) =>
          this.authService.getUserById(userId).pipe(
            catchError((err) => {
              console.error(`Failed to load user ${userId}:`, err);
              return of(null);
            })
          )
        );

        const dataSubscription = forkJoin({
          exams: forkJoin(examRequests),
          users: forkJoin(userRequests),
        })
          .pipe(
            finalize(() => {
              this.loading = false;
            })
          )
          .subscribe({
            next: (result) => {
              result.exams.forEach((exam, index) => {
                if (exam) {
                  this.exams[examIds[index]] = exam;
                }
              });
              this.dataLoaded.exams = true;

              result.users.forEach((user, index) => {
                if (user) {
                  this.users[userIds[index]] = user;
                }
              });
              this.dataLoaded.users = true;

              // Clear any existing filters when loading new data
              this.statusFilter = '';

              this.filterResults();
            },
            error: (err) => {
              this.error =
                'Some data failed to load. Please refresh to try again.';
              console.error('Failed to load data:', err);
              this.loading = false;
            },
          });

        this.subscriptions.add(dataSubscription);
      },
      error: (error) => {
        this.error = 'Failed to load results. Please try again later.';
        this.loading = false;
        console.error('Failed to load attempts:', error);
      },
    });

    this.subscriptions.add(attemptsSubscription);
  }

  filterResults(): void {
    console.log('Filtering with status:', this.statusFilter);
    console.log('Filtering with search term:', this.searchTerm);

    // Start with all attempts
    let filtered = [...this.attempts];

    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter((attempt) => {
        const examId =
          typeof attempt.examId === 'string'
            ? attempt.examId
            : attempt.examId._id;
        const userId =
          typeof attempt.userId === 'string'
            ? attempt.userId
            : attempt.userId._id;
        const exam = this.exams[examId];
        const user = this.users[userId];

        const examTitle = exam?.title || '';
        const userName = user?.username || user?.email || '';
        const status = attempt.passed ? 'passed' : 'failed';

        return (
          examTitle.toLowerCase().includes(term) ||
          userName.toLowerCase().includes(term) ||
          status.includes(term)
        );
      });
    }

    // Apply status filter
    if (this.statusFilter && this.statusFilter !== '') {
      filtered = filtered.filter((attempt) => {
        if (this.statusFilter === 'passed') return attempt.passed === true;
        if (this.statusFilter === 'failed') return attempt.passed === false;
        return true;
      });
    }

    console.log('Filtered attempts:', filtered.length);

    // Update filtered attempts
    this.filteredAttempts = filtered;

    // Reset to first page when filters change
    this.currentPage = 1;

    // Apply sorting after filtering
    this.applySort();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterResults();
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'desc';
    }

    this.applySort();
  }

  private applySort(): void {
    this.filteredAttempts.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortColumn) {
        case 'student':
          const userIdA =
            typeof a.userId === 'string' ? a.userId : a.userId._id;
          const userIdB =
            typeof b.userId === 'string' ? b.userId : b.userId._id;
          valueA = this.users[userIdA]?.username || '';
          valueB = this.users[userIdB]?.username || '';
          break;

        case 'exam':
          const examIdA =
            typeof a.examId === 'string' ? a.examId : a.examId._id;
          const examIdB =
            typeof b.examId === 'string' ? b.examId : b.examId._id;
          valueA = this.exams[examIdA]?.title || '';
          valueB = this.exams[examIdB]?.title || '';
          break;

        case 'score':
          valueA = a.score / a.totalPoints;
          valueB = b.score / b.totalPoints;
          break;

        case 'status':
          valueA = a.passed ? 1 : 0;
          valueB = b.passed ? 1 : 0;
          break;

        case 'time':
        default:
          valueA = a.endTime ? new Date(a.endTime).getTime() : 0;
          valueB = b.endTime ? new Date(b.endTime).getTime() : 0;
          break;
      }

      const direction = this.sortDirection === 'asc' ? 1 : -1;

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueA.localeCompare(valueB) * direction;
      } else {
        return (valueA > valueB ? 1 : -1) * direction;
      }
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'fa-sort';
    }
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  exportResults(): void {
    console.log('Exporting results...');

    if (!this.filteredAttempts.length) {
      alert('No results to export');
      return;
    }

    try {
      let csvContent = 'Student,Exam,Score,Status,Completion Time\n';

      this.filteredAttempts.forEach((attempt) => {
        if (!this.isValidAttempt(attempt)) return;

        const student = this.getUserName(attempt.userId).replace(/"/g, '""');
        const exam = this.getExamTitle(attempt.examId).replace(/"/g, '""');
        const score =
          ((attempt.score / attempt.totalPoints) * 100).toFixed(1) + '%';
        const status = attempt.passed ? 'Passed' : 'Failed';
        const time = attempt.endTime
          ? new Date(attempt.endTime).toLocaleString()
          : 'N/A';

        csvContent += `"${student}","${exam}",${score},${status},"${time}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      // Create and trigger download
      const link = document.createElement('a');
      const filename = `exam_results_${
        new Date().toISOString().split('T')[0]
      }.csv`;

      console.log('Downloading file:', filename);

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      console.log('Export complete');
    } catch (error) {
      console.error('Error exporting results:', error);
      alert('An error occurred while exporting results. Please try again.');
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (!this.isLastPage) {
      this.currentPage++;
    }
  }

  get isLastPage(): boolean {
    return this.currentPage * this.pageSize >= this.filteredAttempts.length;
  }

  get paginatedAttempts(): ExamAttempt[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredAttempts.slice(startIndex, startIndex + this.pageSize);
  }

  getPaginationDisplay(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(
      this.currentPage * this.pageSize,
      this.filteredAttempts.length
    );

    if (this.filteredAttempts.length === 0) {
      return 'No entries to display';
    }

    if (this.filteredAttempts.length === this.attempts.length) {
      return `Showing ${start} to ${end} of ${this.filteredAttempts.length} entries`;
    } else {
      return `Showing ${start} to ${end} of ${this.filteredAttempts.length} filtered entries (from ${this.attempts.length} total)`;
    }
  }

  calculatePassRate(): number {
    if (!this.attempts.length) return 0;
    const validAttempts = this.attempts.filter((a) => a.passed !== undefined);
    if (!validAttempts.length) return 0;
    const passedAttempts = validAttempts.filter((a) => a.passed).length;
    return Math.round((passedAttempts / validAttempts.length) * 100);
  }

  calculateAverageScore(): number {
    if (!this.attempts.length) return 0;
    const validAttempts = this.attempts.filter(
      (a) => a.score !== undefined && a.totalPoints && a.totalPoints > 0
    );
    if (!validAttempts.length) return 0;
    const totalScore = validAttempts.reduce((sum, attempt) => {
      return sum + (attempt.score / attempt.totalPoints) * 100;
    }, 0);
    return Math.round(totalScore / validAttempts.length);
  }

  getExamTitle(examId: string | { _id: string }): string {
    if (!this.dataLoaded.exams) return 'Loading...';
    const id = typeof examId === 'string' ? examId : examId._id;
    const exam = this.exams[id];
    return exam ? exam.title : 'Unknown Exam';
  }

  getUserName(userId: string | { _id: string }): string {
    if (!this.dataLoaded.users) return 'Loading...';
    const id = typeof userId === 'string' ? userId : userId._id;
    const user = this.users[id];
    if (!user) return 'Unknown User';
    return user.username || user.email || 'Unknown User';
  }

  isValidAttempt(attempt: ExamAttempt): boolean {
    if (!attempt) return false;
    const examId =
      typeof attempt.examId === 'string' ? attempt.examId : attempt.examId._id;
    const userId =
      typeof attempt.userId === 'string' ? attempt.userId : attempt.userId._id;
    return !!(
      attempt.score !== undefined &&
      attempt.totalPoints &&
      examId &&
      userId &&
      this.exams[examId] &&
      this.users[userId]
    );
  }
}
