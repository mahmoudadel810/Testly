import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { Exam } from '../../../models/exam.model';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-manage-exams',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manage-exams.component.html',
  styleUrls: ['./manage-exams.component.css'],
})
export class ManageExamsComponent implements OnInit {
  exams = signal<Exam[]>([]);
  loading = signal(true);
  error = signal('');

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

  async deleteExam(examId: string | undefined): Promise<void> {
    if (!examId) {
      this.toastr.error('Invalid exam ID');
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Exam',
      text: 'Are you sure you want to delete this exam? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      this.examService
        .deleteTeacherExam(examId)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.exams.update((exams) =>
              exams.filter((exam) => exam._id !== examId)
            );
            this.toastr.success('Exam deleted successfully');
          },
          error: (err) => {
            console.error('Error deleting exam:', err);
            this.toastr.error('Failed to delete exam. Please try again later.');
          },
        });
    }
  }
}
