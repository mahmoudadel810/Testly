import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { Exam } from '../../../models/exam.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-exams',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './manage-exams.component.html',
  styleUrls: ['./manage-exams.component.css'],
})
export class ManageExamsComponent implements OnInit {
  exams: Exam[] = [];
  loading = true;

  constructor(
    private examService: ExamService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  private loadExams(): void {
    this.examService.getAdminExams().subscribe({
      next: (exams) => {
        this.exams = exams;
        this.loading = false;
        this.toastr.success('Exams loaded successfully', 'Success');
      },
      error: (error) => {
        this.toastr.error('Failed to load exams. Please try again.', 'Error');
        this.loading = false;
      },
    });
  }

  getTeacherName(exam: Exam): string {
    const teacher = exam.teacherId;
    const creator = exam.createdBy;
    if (teacher && typeof teacher === 'object' && 'name' in teacher) {
      return teacher.name ?? 'Unknown';
    }
    if (creator && typeof creator === 'object' && 'name' in creator) {
      return typeof creator.name === 'string' ? creator.name : 'Unknown';
    }
    return 'Unknown';
  }

  getTeacherEmail(exam: Exam): string {
    let email = '';
    if (
      exam.teacherId &&
      typeof exam.teacherId === 'object' &&
      'email' in exam.teacherId
    ) {
      email = exam.teacherId.email ?? '';
    } else if (
      exam.createdBy &&
      typeof exam.createdBy === 'object' &&
      'email' in exam.createdBy
    ) {
      email = exam.createdBy.email ?? '';
    }
    return email;
  }

  deleteExam(id: string): void {
    if (confirm("Are you sure you want to delete this exam? You won't be able to revert this!")) {
      this.confirmDelete(id);
    }
  }

  private confirmDelete(id: string): void {
    this.examService.deleteExam(id).subscribe({
      next: () => {
        this.exams = this.exams.filter((e) => e._id !== id);
        this.toastr.success('Exam has been deleted.', 'Deleted!');
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Failed to delete exam', 'Error!');
      },
    });
  }
}
