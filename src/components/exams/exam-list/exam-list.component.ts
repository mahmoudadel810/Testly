import { Component, OnInit, HostListener } from '@angular/core';
import { ExamService } from '../../../services/exam.service';
import { Exam } from '../../../models/exam.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookmarkService } from '../../../services/bookmark.service';
import { NotificationService } from '../../../services/notification.service';
import { ExamFilterService } from '../../../services/exam-filter.service';
import { FILTER_TYPES, VIEW_MODES } from '../../../models/constants';
import { LoggingService } from '../../../services/logging.service';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exam-list.component.html',
  styleUrls: ['./exam-list.component.css'],
})
export class ExamListComponent implements OnInit {
  exams: Exam[] = [];
  filteredExams: Exam[] = [];
  loading = true;
  error = '';
  viewMode = VIEW_MODES.GRID;
  activeFilter = FILTER_TYPES.ALL;
  selectedExam: Exam | null = null;

  // Teacher filtering
  teachers: any[] = [];
  loadingTeachers = false;
  selectedTeacherId: string | null = null;

  // Constants accessible in template
  readonly FILTER_TYPES = FILTER_TYPES;
  readonly VIEW_MODES = VIEW_MODES;

  constructor(
    private examService: ExamService,
    private bookmarkService: BookmarkService,
    private notificationService: NotificationService,
    private examFilterService: ExamFilterService,
    private logger: LoggingService
  ) {}

  /**
   * Close exam details modal when Escape key is pressed
   */
  @HostListener('document:keydown.escape')
  closeModalOnEscape(): void {
    this.closeExamDetails();
  }

  ngOnInit(): void {
    // Set loading to false initially since we're not loading exams yet
    this.loading = false;
    this.loadTeachers();
  }

  /**
   * Load all available teachers
   */
  loadTeachers(): void {
    this.loadingTeachers = true;
    this.examService.getConfirmedTeachers().subscribe({
      next: (teachers) => {
        this.teachers = teachers;
        this.loadingTeachers = false;
      },
      error: (error) => {
        this.logger.error('Error loading teachers:', error);
        this.loadingTeachers = false;
      },
    });
  }

  /**
   * Fetches question counts for exams that don't have questions loaded
   */
  fetchMissingQuestionCounts(): void {
    const examObservables = this.exams
      .filter((exam) => !exam.questions || exam.questions.length === 0)
      .map((exam) => {
        if (!exam._id) return of(null);

        return this.examService.getExam(exam._id).pipe(
          map((fullExam) => {
            this.updateExamWithQuestions(
              exam._id as string,
              fullExam.questions
            );
            return fullExam;
          }),
          catchError((error) => {
            this.logger.error(
              `Error loading questions for exam ${exam._id}:`,
              error
            );
            return of(null);
          })
        );
      });

    if (examObservables.length > 0) {
      forkJoin(examObservables).subscribe();
    }
  }

  /**
   * Updates exam with questions data
   * @param examId ID of the exam to update
   * @param questions Questions data
   */
  private updateExamWithQuestions(examId: string, questions: any[]): void {
    // Update in main exams array
    const index = this.exams.findIndex((e) => e._id === examId);
    if (index !== -1) {
      this.exams[index].questions = questions;
    }

    // Update in filtered exams if present
    const filteredIndex = this.filteredExams.findIndex((e) => e._id === examId);
    if (filteredIndex !== -1) {
      this.filteredExams[filteredIndex].questions = questions;
    }
  }

  /**
   * Gets question count for an exam
   * @param exam Exam to get question count for
   */
  getQuestionCount(exam: Exam | null): number {
    if (!exam || !exam.questions) {
      return 0;
    }
    return Array.isArray(exam.questions) ? exam.questions.length : 0;
  }

  /**
   * Opens exam details modal
   * @param exam Exam to view details for
   */
  viewExamDetails(exam: Exam): void {
    this.selectedExam = exam;
    document.body.classList.add('modal-open');
  }

  /**
   * Closes exam details modal
   */
  closeExamDetails(): void {
    if (!this.selectedExam) return;

    this.selectedExam = null;
    document.body.classList.remove('modal-open');
  }

  /**
   * Filters exams based on search input
   * @param event Input event
   */
  filterExams(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilters(searchTerm);
  }

  /**
   * Filters exams by tag/category
   * @param filter Filter type from FILTER_TYPES
   */
  filterByTag(filter: string): void {
    this.activeFilter = filter;

    // Get current search term
    const searchInput = document.querySelector(
      '.search-box input'
    ) as HTMLInputElement;
    const searchTerm = searchInput ? searchInput.value : '';

    this.applyFilters(searchTerm);
  }

  /**
   * Sets the active filter and applies it
   * @param filter Filter type from FILTER_TYPES
   */
  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  /**
   * Sets the view mode
   * @param mode View mode to set
   */
  setViewMode(mode: string): void {
    this.viewMode = mode;
  }

  /**
   * Checks if an exam is bookmarked
   * @param examId ID of the exam to check
   */
  isBookmarked(examId: string | undefined): boolean {
    return this.bookmarkService.isBookmarked(examId);
  }

  /**
   * Toggles bookmark status for an exam
   * @param exam Exam to toggle bookmark for
   */
  toggleBookmark(exam: Exam): void {
    if (!exam._id) return;

    const isNowBookmarked = this.bookmarkService.toggleBookmark(exam._id);

    const message = isNowBookmarked
      ? `${exam.title} added to bookmarks`
      : `${exam.title} removed from bookmarks`;

    this.notificationService.success(message);

    // If filter is set to bookmarks, refresh the list
    if (this.activeFilter === FILTER_TYPES.BOOKMARKED) {
      this.applyFilters();
    }
  }

  /**
   * Applies current filters and search term to exams
   * @param searchTerm Optional search term to apply
   */
  private applyFilters(searchTerm: string = ''): void {
    // Get search term from input if not provided
    if (!searchTerm) {
      const searchInput = document.querySelector(
        '.search-box input'
      ) as HTMLInputElement;
      searchTerm = searchInput ? searchInput.value : '';
    }

    this.filteredExams = this.examFilterService.filterExams(
      this.exams,
      searchTerm,
      this.activeFilter
    );
  }

  /**
   * Filter exams by teacher
   */
  filterByTeacher(teacherId: string): void {
    this.selectedTeacherId = teacherId;
    this.loading = true;

    this.examService.getExamsByTeacher(teacherId).subscribe({
      next: (exams) => {
        this.exams = exams;
        this.applyFilters();
        this.loading = false;
        this.fetchMissingQuestionCounts();
      },
      error: (error) => {
        this.error = 'Failed to load exams for this teacher.';
        this.loading = false;
        this.logger.error('Error loading teacher exams:', error);
      },
    });
  }
}
