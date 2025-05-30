import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { Exam, Question } from '../../../models/exam.model';

@Component({
  selector: 'app-exam-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-details.component.html',
  styleUrls: ['./exam-details.component.css']
})
export class ExamDetailsComponent implements OnInit {
  exam: Exam | null = null;
  loading = true;
  error = '';
  canStart = false;

  constructor(
    private examService: ExamService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('id');
    if (!examId) {
      this.router.navigate(['/exams']);
      return;
    }

    this.loadExam(examId);
  }

  private loadExam(id: string): void {
    this.examService.getExam(id).subscribe({
      next: (exam) => {
        this.exam = exam;
        this.loading = false;
        this.checkCanStart();
      },
      error: (error) => {
        if (error.status === 404) {
          this.error = 'Exam not found. Please check the exam ID and try again.';
        } else {
          this.error = 'Failed to load exam details. Please try again later.';
        }
        this.loading = false;
      }
    });
  }

  private checkCanStart(): void {
    if (!this.exam) return;
    
    // Check if exam has questions
    this.canStart = this.exam.questions && this.exam.questions.length > 0;
  }

  startExam(): void {
    if (!this.exam) return;
    
    this.examService.startExam(this.exam._id as string).subscribe({
      next: (attempt) => {
        this.router.navigate(['/take-exam', attempt._id]);
      },
      error: (error) => {
        this.error = 'Failed to start exam. Please try again later.';
      }
    });
  }
}
