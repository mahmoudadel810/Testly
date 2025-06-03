import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { Exam } from '../../../models/exam.model';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { ConfirmationPopupComponent } from '../../shared/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-manage-exams',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmationPopupComponent],
  templateUrl: './manage-exams.component.html',
  styleUrls: ['./manage-exams.component.css'],
})
export class ManageExamsComponent implements OnInit {
  exams = signal<Exam[]>([]);
  loading = signal(true);
  error = signal('');
  showDeleteConfirmation = signal(false);
  examToDelete = signal<string | null>(null);

  constructor(
    private examService: ExamService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.loading.set(true);
    this.error.set('');

    this.examService
      .getTeacherExams()
      .pipe(take(1))
      .subscribe({
        next: (exams) => {
          this.exams.set(exams);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading exams:', err);
          this.error.set('Failed to load exams. Please try again later.');
          this.loading.set(false);
          this.toastr.error('Failed to load exams. Please try again later.');
        },
      });
  }

  openDeleteConfirmation(examId: string): void {
    this.examToDelete.set(examId);
    this.showDeleteConfirmation.set(true);
  }

  onDeleteConfirmed(): void {
    const examId = this.examToDelete();
    if (!examId) {
      this.toastr.error('Invalid exam ID');
      return;
    }

    this.examService
      .deleteTeacherExam(examId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.exams.update((exams) =>
            exams.filter((exam) => exam._id !== examId)
          );
          this.toastr.success('Exam deleted successfully');
          this.showDeleteConfirmation.set(false);
          this.examToDelete.set(null);
        },
        error: (err) => {
          console.error('Error deleting exam:', err);
          this.toastr.error('Failed to delete exam. Please try again later.');
          this.showDeleteConfirmation.set(false);
          this.examToDelete.set(null);
        },
      });
  }

  onDeleteCancelled(): void {
    this.showDeleteConfirmation.set(false);
    this.examToDelete.set(null);
  }
}