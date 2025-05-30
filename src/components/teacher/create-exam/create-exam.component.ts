import { Component, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl,
} from '@angular/forms';
import { ExamService } from '../../../services/exam.service';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';

@Component({
  selector: 'app-create-exam',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-exam.component.html',
  styleUrls: ['./create-exam.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateExamComponent implements OnInit {
  examForm: FormGroup;
  isSubmitting = signal(false);
  formStatus = computed(() => this.isSubmitting() ? 'Submitting...' : 'Ready');

  constructor(
    private fb: FormBuilder,
    private examService: ExamService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.examForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      duration: [
        60,
        [Validators.required, Validators.min(5), Validators.max(180)],
      ],
      passingScore: [
        60,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      questions: this.fb.array([]),
    });

    // Add first question by default
    this.addQuestion();
  }

  ngOnInit(): void {}

  get questions(): FormArray {
    return this.examForm.get('questions') as FormArray;
  }

  addQuestion(): void {
    const questionForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(3)]],
      options: this.fb.array([
        this.fb.control('', Validators.required),
        this.fb.control('', Validators.required),
      ]),
      correctAnswer: [0, [Validators.required, Validators.min(0)]],
      points: [1, [Validators.required, Validators.min(1)]],
    });

    this.questions.push(questionForm);
    this.toastr.success('Question added successfully');
  }

  removeQuestion(index: number): void {
    if (this.questions.length <= 1) {
      this.toastr.warning('You must have at least one question');
      return;
    }

    if (confirm('Are you sure you want to delete this question?')) {
      this.questions.removeAt(index);
      this.toastr.success('Question deleted successfully');
    }
  }

  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  addOption(questionIndex: number): void {
    const options = this.getOptions(questionIndex);
    options.push(this.fb.control('', Validators.required));
    this.toastr.success('Option added successfully');
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const options = this.getOptions(questionIndex);

    if (options.length <= 2) {
      this.toastr.warning('Each question must have at least two options');
      return;
    }

    if (confirm('Are you sure you want to delete this option?')) {
      options.removeAt(optionIndex);

      // Update correct answer if needed
      const questionControl = this.questions.at(questionIndex);
      const correctAnswerControl = questionControl.get('correctAnswer');
      const currentCorrectAnswer = correctAnswerControl?.value;

      if (currentCorrectAnswer >= optionIndex && currentCorrectAnswer > 0) {
        correctAnswerControl?.setValue(currentCorrectAnswer - 1);
      }

      this.toastr.success('Option deleted successfully');
    }
  }

  onSubmit(): void {
    if (this.examForm.invalid) {
      this.markFormGroupTouched(this.examForm);
      this.toastr.error('Please fill all required fields correctly');
      return;
    }

    this.isSubmitting.set(true);

    this.examService.createTeacherExam(this.examForm.value)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.toastr.success('Exam created successfully!');
          setTimeout(() => {
            this.router.navigate(['/teacher/exams']);
          }, 1500);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const errorMsg = err.error?.message || 'Failed to create exam. Please try again.';
          this.toastr.error(errorMsg);
          console.error('Error creating exam:', err);
        },
      });
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
