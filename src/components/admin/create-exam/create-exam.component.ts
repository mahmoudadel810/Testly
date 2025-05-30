import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { Exam, Question } from '../../../models/exam.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-exam',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-exam.component.html',
  styleUrls: ['./create-exam.component.css'],
})
export class CreateExamComponent {
  exam: Exam = {
    title: '',
    description: '',
    duration: 60,
    passingScore: 60,
    questions: [],
  };

  saving = false;

  constructor(
    private examService: ExamService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  addQuestion(): void {
    const newQuestion: Question = {
      text: '',
      options: ['', ''],
      correctAnswer: 0,
      points: 1,
    };
    this.exam.questions.push(newQuestion);
    this.showToast('Question added successfully', 'success');
  }

  removeQuestion(index: number): void {
    this.exam.questions.splice(index, 1);
    this.showToast('Question removed', 'warning');
  }

  addOption(question: Question): void {
    question.options.push('');
    this.showToast('Option added successfully', 'info');
  }

  removeOption(question: Question, index: number): void {
    if (question.options.length > 2) {
      question.options.splice(index, 1);
      if (question.correctAnswer >= index) {
        question.correctAnswer = Math.max(0, question.correctAnswer - 1);
      }
      this.showToast('Option removed', 'warning');
    } else {
      this.showToast('Minimum 2 options required', 'error');
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.showToast('Please fill all required fields correctly', 'error');
      return;
    }

    this.saving = true;

    this.examService.createExam(this.exam).subscribe({
      next: () => {
        this.showToast('Exam created successfully!', 'success');
        this.saving = false;
        this.router.navigate(['/admin/exams']);
      },
      error: () => {
        this.showToast('Failed to create exam. Please try again.', 'error');
        this.saving = false;
      },
    });
  }

  cancel(): void {
    this.showToast('Exam creation cancelled', 'info');
    this.router.navigate(['/admin/exams']);
  }

  private showToast(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ): void {
    const config = {
      timeOut: 3000,
      positionClass: 'toast-top-right',
      progressBar: true,
      closeButton: true,
    };

    switch (type) {
      case 'success':
        this.toastr.success(message, 'Success', config);
        break;
      case 'error':
        this.toastr.error(message, 'Error', config);
        break;
      case 'info':
        this.toastr.info(message, 'Info', config);
        break;
      case 'warning':
        this.toastr.warning(message, 'Warning', config);
        break;
    }
  }
}
