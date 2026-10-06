// edit-exam.component.ts
import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { ExamService } from '../../../services/exam.service';
import { Exam } from '../../../models/exam.model';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { ConfirmationPopupComponent } from '../../shared/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-edit-exam',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmationPopupComponent,
  ],
  templateUrl: './edit-exam.component.html',
  styleUrls: ['./edit-exam.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditExamComponent implements OnInit {
  examId: string;
  examForm: FormGroup;
  isLoading = signal(true);
  isSubmitting = signal(false);
  error = signal('');
  successMessage = signal('');
  initialFormValue: any;

  // Confirmation popup signals
  showConfirmPopup = signal(false);
  showCancelConfirmPopup = signal(false);
  confirmAction = signal<'deleteQuestion' | 'deleteOption' | 'cancel' | null>(null);
  currentQuestionIndex = signal<number | null>(null);
  currentOptionIndex = signal<number | null>(null);

  constructor(
    private fb: FormBuilder,
    private examService: ExamService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.examId = this.route.snapshot.paramMap.get('id') || '';

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
  }

  ngOnInit(): void {
    if (this.examId) {
      this.loadExam(this.examId);
    } else {
      this.error.set('No exam ID provided');
      this.isLoading.set(false);
      this.toastr.error('No exam ID provided');
    }
  }

  private loadExam(id: string): void {
    this.examService
      .getExam(id)
      .pipe(take(1))
      .subscribe({
        next: (exam) => {
          this.populateForm(exam);
          this.initialFormValue = JSON.stringify(this.examForm.value);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading exam:', err);
          this.error.set('Failed to load exam. Please try again later.');
          this.isLoading.set(false);
          this.toastr.error('Failed to load exam. Please try again later.');
        },
      });
  }

  private populateForm(exam: Exam): void {
    while (this.questions.length) {
      this.questions.removeAt(0);
    }

    this.examForm.patchValue({
      title: exam.title,
      description: exam.description,
      duration: exam.duration,
      passingScore: exam.passingScore,
    });

    if (exam.questions?.length) {
      exam.questions.forEach((question) => {
        const questionGroup = this.fb.group({
          // Keep the existing question id so the server can preserve it
          // (in-progress attempts reference questions by _id)
          _id: [question._id],
          text: [question.text, [Validators.required, Validators.minLength(3)]],
          correctAnswer: [
            question.correctAnswer,
            [Validators.required, Validators.min(0)],
          ],
          points: [question.points, [Validators.required, Validators.min(1)]],
          options: this.fb.array([]),
        });

        const optionsArray = questionGroup.get('options') as FormArray;
        question.options.forEach((option) => {
          optionsArray.push(this.fb.control(option, Validators.required));
        });

        this.questions.push(questionGroup);
      });
    } else {
      this.addQuestion();
    }
  }

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

    this.currentQuestionIndex.set(index);
    this.confirmAction.set('deleteQuestion');
    this.showConfirmPopup.set(true);
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

    this.currentQuestionIndex.set(questionIndex);
    this.currentOptionIndex.set(optionIndex);
    this.confirmAction.set('deleteOption');
    this.showConfirmPopup.set(true);
  }

  handleConfirm(): void {
    if (this.confirmAction() === 'deleteQuestion' && this.currentQuestionIndex() !== null) {
      this.questions.removeAt(this.currentQuestionIndex()!);
      this.toastr.success('Question deleted successfully');
    } 
    else if (this.confirmAction() === 'deleteOption' && 
             this.currentQuestionIndex() !== null && 
             this.currentOptionIndex() !== null) {
      const options = this.getOptions(this.currentQuestionIndex()!);
      options.removeAt(this.currentOptionIndex()!);

      const questionControl = this.questions.at(this.currentQuestionIndex()!);
      const correctAnswerControl = questionControl.get('correctAnswer');
      const currentCorrectAnswer = correctAnswerControl?.value;

      if (currentCorrectAnswer >= this.currentOptionIndex()! && currentCorrectAnswer > 0) {
        correctAnswerControl?.setValue(currentCorrectAnswer - 1);
      }

      this.toastr.success('Option deleted successfully');
    }
    else if (this.confirmAction() === 'cancel') {
      this.router.navigate(['/teacher/exams']);
    }

    this.resetConfirmation();
  }

  handleCancel(): void {
    this.resetConfirmation();
  }

  private resetConfirmation(): void {
    this.showConfirmPopup.set(false);
    this.showCancelConfirmPopup.set(false);
    this.confirmAction.set(null);
    this.currentQuestionIndex.set(null);
    this.currentOptionIndex.set(null);
  }

  hasChanges(): boolean {
    return this.initialFormValue !== JSON.stringify(this.examForm.value);
  }

  onCancel(): void {
    if (this.hasChanges()) {
      this.confirmAction.set('cancel');
      this.showCancelConfirmPopup.set(true);
    } else {
      this.router.navigate(['/teacher/exams']);
    }
  }

// edit-exam.component.ts
onSubmit(): void {
  if (this.examForm.invalid) {
    this.markFormGroupTouched(this.examForm);
    this.toastr.error('Please fill all required fields correctly');
    return;
  }

  if (!this.hasChanges()) {
    this.toastr.info('No changes detected to save');
    return;
  }

  this.isSubmitting.set(true);
  this.error.set('');
  this.successMessage.set('');

  this.examService
    .updateTeacherExam(this.examId, this.examForm.value)
    .pipe(take(1))
    .subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Exam updated successfully!');
        this.toastr.success('Exam updated successfully!');
        this.initialFormValue = JSON.stringify(this.examForm.value);

        setTimeout(() => {
          this.router.navigate(['/teacher/exams']);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(
          err.error?.message || 'Failed to update exam. Please try again.'
        );
        this.toastr.error(
          err.error?.message || 'Failed to update exam. Please try again.'
        );
        console.error('Error updating exam:', err);
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