import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { ExamAttempt, Exam } from '../../../models/exam.model';

@Component({
  selector: 'app-result-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.css'],
})
export class ResultListComponent implements OnInit {
  attempts: ExamAttempt[] = [];
  exams: { [key: string]: Exam } = {};
  loading = true; 
  error = '';

  constructor(private examService: ExamService) {}

  ngOnInit(): void {
    this.loadResults();
  }

  private loadResults(): void {
    this.examService.getAttempts().subscribe({
      next: (attempts: ExamAttempt[]) => {
        this.attempts = attempts;
        // Load exam details for each attempt
        const examIds = Array.from(
          new Set(
            attempts.map((attempt) => {
              if (!attempt.examId) return null;
              return typeof attempt.examId === 'string'
                ? attempt.examId
                : attempt.examId._id;
            })
          )
        ).filter((id): id is string => id !== null); // Filter out null values and assure TypeScript it's a string

        examIds.forEach((examId) => {
          this.examService.getExam(examId).subscribe({
            next: (exam: Exam) => {
              this.exams[examId] = exam;
            },
            error: (err: Error) => {
              console.error('Failed to load exam details:', err);
            },
          });
        });
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = 'Failed to load results';
        this.loading = false;
      },
    });
  }

  getExamTitle(examId: string | { _id: string } | null): string {
    if (!examId) return 'Unknown Exam';
    const id = typeof examId === 'string' ? examId : examId._id;
    return this.exams[id]?.title || 'Loading...';
  }
}
