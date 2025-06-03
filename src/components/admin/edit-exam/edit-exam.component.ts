import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ExamService } from "../../../services/exam.service";
import { Exam, Question } from "../../../models/exam.model";
import { ConfirmationPopupComponent } from "../../shared/confirmation-popup/confirmation-popup.component";

@Component({
  selector: "app-edit-exam",
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationPopupComponent],
  templateUrl: "./edit-exam.component.html",
  styleUrls: ["./edit-exam.component.css"],
})
export class EditExamComponent implements OnInit {
  exam: Exam | null = null;
  loading = true;
  saving = false;
  error = "";
  showCancelConfirmation = false;
  showRemoveQuestionConfirmation = false;
  questionToRemoveIndex: number | null = null;
  initialExamState: string = "";
  previousOptions: { [key: number]: string[] } = {};

  constructor(
    private examService: ExamService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get("id");
    if (!examId) {
      this.router.navigate(["/admin/exams"]);
      return;
    }

    this.loadExam(examId);
  }

  private loadExam(id: string): void {
    this.examService.getExam(id).subscribe({
      next: (exam) => {
        this.exam = { ...exam };
        // Save the original options for each question
        this.exam.questions.forEach((question, index) => {
          this.previousOptions[index] = [...question.options];
        });
        this.initialExamState = JSON.stringify(this.exam);
        this.loading = false;
      },
      error: (error) => {
        this.error = "Failed to load exam. Please try again later.";
        this.loading = false;
      },
    });
  }

  hasChanges(): boolean {
    if (!this.exam) return false;
    return this.initialExamState !== JSON.stringify(this.exam);
  }

  addQuestion(): void {
    if (!this.exam) return;

    const newQuestion: Question = {
      text: "",
      options: ["", ""],
      correctAnswer: 0,
      points: 1,
    };

    this.exam = {
      ...this.exam,
      questions: [...this.exam.questions, newQuestion],
    };

    // Save the original options for the new question
    this.previousOptions[this.exam.questions.length - 1] = ["", ""];
  }

  removeQuestion(index: number): void {
    if (this.exam && this.exam.questions.length <= 1) {
      this.error = "Exam must have at least one question.";
      return;
    }
    this.questionToRemoveIndex = index;
    this.showRemoveQuestionConfirmation = true;
  }

  confirmRemoveQuestion(): void {
    if (
      this.questionToRemoveIndex !== null &&
      this.exam &&
      this.exam.questions.length > 1
    ) {
      const updatedQuestions = [...this.exam.questions];
      updatedQuestions.splice(this.questionToRemoveIndex, 1);

      this.exam = {
        ...this.exam,
        questions: updatedQuestions,
      };

      // Update saved options
      delete this.previousOptions[this.questionToRemoveIndex];
      // Renumber saved options
      const newPreviousOptions: { [key: number]: string[] } = {};
      Object.keys(this.previousOptions).forEach((key: string) => {
        const numKey = parseInt(key);
        if (numKey > this.questionToRemoveIndex!) {
          newPreviousOptions[numKey - 1] = this.previousOptions[numKey];
        } else if (numKey < this.questionToRemoveIndex!) {
          newPreviousOptions[numKey] = this.previousOptions[numKey];
        }
      });
      this.previousOptions = newPreviousOptions;

      this.error = "";
    }
    this.hideRemoveQuestionConfirmation();
  }

  hideRemoveQuestionConfirmation(): void {
    this.questionToRemoveIndex = null;
    this.showRemoveQuestionConfirmation = false;
  }

  addOption(question: Question, questionIndex: number): void {
    // Save current options before modification
    this.previousOptions[questionIndex] = [...question.options];

    // Add the new option
    question.options = [...question.options, ""];
  }

  removeOption(
    question: Question,
    optionIndex: number,
    questionIndex: number
  ): void {
    if (question.options.length > 2) {
      // Save current options before modification
      this.previousOptions[questionIndex] = [...question.options];

      const updatedOptions = [...question.options];
      updatedOptions.splice(optionIndex, 1);

      question.options = updatedOptions;
      if (question.correctAnswer >= optionIndex) {
        question.correctAnswer = Math.max(0, question.correctAnswer - 1);
      }
    } else {
      this.error = "Question must have at least two options.";
    }
  }

  restoreOptions(questionIndex: number): void {
    if (this.previousOptions[questionIndex] && this.exam) {
      this.exam.questions[questionIndex].options = [
        ...this.previousOptions[questionIndex],
      ];
      this.error = "";
    }
  }

  onSubmit(): void {
    if (!this.exam || !this.hasChanges()) {
      return;
    }

    if (this.exam.questions.length === 0) {
      this.error = "Exam must have at least one question.";
      return;
    }

    let isValid = true;
    for (const question of this.exam.questions) {
      if (!question.text.trim()) {
        this.error = "All questions must have text.";
        isValid = false;
        break;
      }

      if (question.options.some((option) => !option.trim())) {
        this.error = "All options must have text.";
        isValid = false;
        break;
      }

      if (question.points < 1) {
        this.error = "Points must be at least 1 for all questions.";
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      return;
    }

    this.saving = true;
    this.error = "";

    this.examService.updateExam(this.exam._id!, this.exam).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(["/admin/exams"]);
      },
      error: (error) => {
        this.error =
          error.error?.message || "Failed to update exam. Please try again.";
        this.saving = false;
      },
    });
  }
  cancel(): void {
    if (this.hasChanges()) {
      this.showCancelConfirmation = true;
    } else {
      this.router.navigate(["/admin/exams"]);
    }
  }

  confirmCancel(): void {
    this.router.navigate(["/admin/exams"]);
  }

  hideCancelConfirmation(): void {
    this.showCancelConfirmation = false;
  }

  trackByQuestion(index: number, question: Question): number {
    return index;
  }

  trackByOption(index: number, option: string): number {
    return index;
  }
}
