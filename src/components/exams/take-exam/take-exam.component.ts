/** @format */

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import {
  Exam,
  Question,
  Answer,
  ExamAttempt,
} from '../../../models/exam.model';
import { finalize, catchError } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';

@Component({
  selector: 'app-take-exam',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './take-exam.component.html',
  styleUrls: ['./take-exam.component.css'],
})
export class TakeExamComponent implements OnInit, OnDestroy {
  exam: Exam | null = null;
  loading = true;
  error: string = '';
  answers: Answer[] = [];
  timeRemaining: number = 0;
  submitted = false;
  timerInterval: any;
  attemptId: string | undefined = undefined;
  private subscriptions = new Subscription();

  // Services
  private examService = inject(ExamService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('id');
    if (!examId) {
      this.router.navigate(['/exams']);
      return;
    }

    this.loadExam(examId);
  }

  private loadExam(id: string): void {
    this.loading = true;
    this.error = ''; // Clear any previous errors
    
    const sub = this.examService
      .getExam(id)
      .pipe(
        catchError((error) => {
          this.error = 'Failed to load exam. Please try again later.';
          this.loading = false;
          console.error('Error loading exam:', error);
          return of(null);
        })
      )
      .subscribe((exam) => {
        if (exam) {          
          // Ensure exam has questions property and it's an array
          if (!exam.questions) {
            exam.questions = [];
          } else if (!Array.isArray(exam.questions)) {
            exam.questions = [];
          }
          
          // If no questions are available, show an error message
          if (exam.questions.length === 0) {
            this.error = 'This exam does not have any questions yet. Please try another exam or contact your teacher.';
            this.loading = false;
            return; // Exit early without initializing exam
          }
          
          this.exam = exam;
          this.initializeAnswers();
          this.startExam(id);
        } else {
          this.error = 'Failed to load exam. Please try again later.';
        }
        this.loading = false;
      });

    this.subscriptions.add(sub);
  }

  private startExam(examId: string): void {
    const sub = this.examService
      .startExam(examId)
      .pipe(
        catchError((error) => {
          this.error = 'Failed to start exam. Please try again later.';
          this.loading = false;
          return of(null as unknown as ExamAttempt);
        })
      )
      .subscribe((examAttempt) => {
        if (examAttempt) {
          this.attemptId = examAttempt._id || undefined;
          this.startTimer();
          this.loading = false;
        }
      });

    this.subscriptions.add(sub);
  }

  private initializeAnswers(): void {
    if (this.exam && this.exam.questions && Array.isArray(this.exam.questions)) {
      // Safely map questions if they exist
      this.answers = this.exam.questions.map((q) => ({
        questionId: q._id || `temp-${Math.random().toString(36).substring(2, 9)}`,
        selectedOption: -1,
      }));
    } else {
      // Initialize with empty array if no questions are available
      this.answers = [];
    }
  }

  private startTimer(): void {
    if (this.exam) {
      this.timeRemaining = this.exam.duration * 60;
      this.timerInterval = setInterval(() => {
        this.timeRemaining--;
        if (this.timeRemaining <= 0) {
          this.submitExam();
        }
      }, 1000);
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getCompletionPercentage(): number {
    return (this.getAnsweredCount() / this.answers.length) * 100;
  }

  getAnsweredCount(): number {
    return this.answers.filter((a) => a.selectedOption !== -1).length;
  }

  allQuestionsAnswered(): boolean {
    return this.answers.every((a) => a.selectedOption !== -1);
  }

  submitExam(): void {
    if (!this.exam || this.submitted || !this.attemptId) {
      return;
    }

    clearInterval(this.timerInterval);
    this.submitted = true;

    // Add a delay to ensure the UI updates
    setTimeout(() => {
      const sub = this.examService
        .submitExam(this.attemptId!, this.answers)
        .pipe(
          catchError((error) => {
            this.error = 'Failed to submit exam. Please try again.';
            this.submitted = false;
            return of(null as unknown as ExamAttempt);
          })
        )
        .subscribe((result) => {
          if (result) {
            this.router.navigate(['/results', result._id]);
          }
        });

      this.subscriptions.add(sub);
    }, 100);
  }

  updateAnswer(questionIndex: number, optionIndex: number): void {
    if (this.answers[questionIndex]) {
      this.answers[questionIndex].selectedOption = optionIndex;
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Unsubscribe from all subscriptions
    this.subscriptions.unsubscribe();
  }
}
