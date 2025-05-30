import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExamService } from '../../../services/exam.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css'],
})
export class StudentsComponent implements OnInit {
  students: any[] = [];
  loading = true;
  error = '';

  constructor(private examService: ExamService) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.error = '';

    this.examService.getTeacherStudents().subscribe({
      next: (students) => {
        this.students = students;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading students:', err);
        this.error = 'Failed to load student list. Please try again later.';
        this.loading = false;
      },
    });
  }
}
