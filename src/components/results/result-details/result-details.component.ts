import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { ExamAttempt, Exam } from '../../../models/exam.model';

@Component({
  selector: 'app-result-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl:'./result-details.component.html',
  styleUrls: ['./result-details.component.css']
})
export class ResultDetailsComponent implements OnInit {
  attempt: ExamAttempt | null = null;
  exam: Exam | null = null;
  loading = true;
  error = '';

  constructor(
    private examService: ExamService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAttempt(id);
    } else {
      this.error = 'No attempt ID provided';
      this.loading = false;
    }
  }

  private loadAttempt(id: string): void {
    this.examService.getAttempt(id).subscribe({
      next: (attempt: ExamAttempt) => {
        this.attempt = attempt;
        // Handle examId whether it's a string or an object with _id
        const examId = typeof attempt.examId === 'string' ? attempt.examId : attempt.examId?._id;
        if (examId) {
          this.examService.getExam(examId).subscribe({
            next: (exam: Exam) => {
              this.exam = exam;
              this.loading = false;
            },
            error: (err: Error) => {
              this.error = 'Failed to load exam details';
              this.loading = false;
            }
          });
        }
      },
      error: (err: Error) => {
        this.error = 'Failed to load attempt details';
        this.loading = false;
      }
    });
  }
}