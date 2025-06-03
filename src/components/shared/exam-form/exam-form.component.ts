// exam-form.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationPopupComponent } from "../confirmation-popup/confirmation-popup.component";

@Component({
  selector: 'app-exam-form',
  templateUrl: './exam-form.component.html',
  styleUrls: ['./exam-form.component.css'],
  imports: [ConfirmationPopupComponent]
})
export class ExamFormComponent {
  @Input() examForm!: FormGroup;
  @Input() isSubmitting = false;
  @Input() formTitle = 'Create New Exam';
  @Input() backLink = '/';
  @Input() isAdmin = false;

  @Output() submitForm = new EventEmitter<void>();
  @Output() cancelForm = new EventEmitter<void>();
  @Output() addQuestion = new EventEmitter<void>();
  @Output() removeQuestion = new EventEmitter<number>();
  @Output() addOption = new EventEmitter<number>();
  @Output() removeOption = new EventEmitter<{questionIndex: number, optionIndex: number}>();

  showConfirmPopup = false;
  confirmAction: 'removeQuestion' | 'removeOption' | null = null;
  confirmData: {questionIndex?: number, optionIndex?: number} | null = null;

  constructor(private toastr: ToastrService) {}

  get questions(): FormArray {
    return this.examForm.get('questions') as FormArray;
  }

  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  onAddQuestion(): void {
    this.addQuestion.emit();
  }

  onRemoveQuestion(index: number): void {
    if (this.questions.length <= 1) {
      this.toastr.warning('You must have at least one question');
      return;
    }

    this.confirmAction = 'removeQuestion';
    this.confirmData = { questionIndex: index };
    this.showConfirmPopup = true;
  }

  onAddOption(questionIndex: number): void {
    this.addOption.emit(questionIndex);
  }

  onRemoveOption(questionIndex: number, optionIndex: number): void {
    const options = this.getOptions(questionIndex);

    if (options.length <= 2) {
      this.toastr.warning('Each question must have at least two options');
      return;
    }

    this.confirmAction = 'removeOption';
    this.confirmData = { questionIndex, optionIndex };
    this.showConfirmPopup = true;
  }

  onConfirm(): void {
    if (!this.confirmAction || !this.confirmData) return;

    if (this.confirmAction === 'removeQuestion' && this.confirmData.questionIndex !== undefined) {
      this.removeQuestion.emit(this.confirmData.questionIndex);
    } else if (
      this.confirmAction === 'removeOption' && 
      this.confirmData.questionIndex !== undefined && 
      this.confirmData.optionIndex !== undefined
    ) {
      this.removeOption.emit({
        questionIndex: this.confirmData.questionIndex,
        optionIndex: this.confirmData.optionIndex
      });
    }

    this.showConfirmPopup = false;
    this.confirmAction = null;
    this.confirmData = null;
  }

  onCancel(): void {
    this.showConfirmPopup = false;
    this.confirmAction = null;
    this.confirmData = null;
  }

  onSubmit(): void {
    this.submitForm.emit();
  }

  onCancelForm(): void {
    this.cancelForm.emit();
  }
}