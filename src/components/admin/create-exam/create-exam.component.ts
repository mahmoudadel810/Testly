import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { ExamService } from "../../../services/exam.service";
import { Exam, Question } from "../../../models/exam.model";
import { ToastrService } from "ngx-toastr";
import { ConfirmationPopupComponent } from "../../shared/confirmation-popup/confirmation-popup.component";

@Component({
  selector: "app-create-exam",
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationPopupComponent],
  templateUrl: "./create-exam.component.html",
  styleUrls: ["./create-exam.component.css"],
})
export class CreateExamComponent {
  exam: Exam = {
    title: "",
    description: "",
    duration: 60,
    passingScore: 60,
    questions: [],
  };

  saving = false;

  // For confirmation popup
  showConfirmPopup = false;
  confirmAction: "removeQuestion" | "removeOption" | null = null;
  confirmData: {
    index?: number;
    question?: Question;
    optionIndex?: number;
  } | null = null;

  constructor(
    private examService: ExamService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  addQuestion(): void {
    const newQuestion: Question = {
      text: "",
      options: ["", ""],
      correctAnswer: 0,
      points: 1,
    };
    this.exam.questions.push(newQuestion);
    this.showToast("Question added successfully", "success");
  }

  removeQuestion(index: number): void {
    if (this.exam.questions.length <= 1) {
      this.showToast("You must have at least one question", "warning");
      return;
    }

    this.confirmAction = "removeQuestion";
    this.confirmData = { index };
    this.showConfirmPopup = true;
  }

  addOption(question: Question): void {
    question.options.push("");
    this.showToast("Option added successfully", "info");
  }

  removeOption(question: Question, index: number): void {
    if (question.options.length <= 2) {
      this.showToast("Minimum 2 options required", "error");
      return;
    }

    this.confirmAction = "removeOption";
    this.confirmData = { question, optionIndex: index };
    this.showConfirmPopup = true;
  }

  onConfirm(): void {
    if (!this.confirmAction || !this.confirmData) return;

    if (
      this.confirmAction === "removeQuestion" &&
      this.confirmData.index !== undefined
    ) {
      this.exam.questions.splice(this.confirmData.index, 1);
      this.showToast("Question removed", "warning");
    } else if (
      this.confirmAction === "removeOption" &&
      this.confirmData.question &&
      this.confirmData.optionIndex !== undefined
    ) {
      const { question, optionIndex } = this.confirmData;
      question.options.splice(optionIndex, 1);

      if (question.correctAnswer >= optionIndex) {
        question.correctAnswer = Math.max(0, question.correctAnswer - 1);
      }
      this.showToast("Option removed", "warning");
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

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.showToast("Please fill all required fields correctly", "error");
      return;
    }

    this.saving = true;

    this.examService.createExam(this.exam).subscribe({
      next: () => {
        this.showToast("Exam created successfully!", "success");
        this.saving = false;
        this.router.navigate(["/admin/exams"]);
      },
      error: () => {
        this.showToast("Failed to create exam. Please try again.", "error");
        this.saving = false;
      },
    });
  }

  cancel(): void {
    this.showToast("Exam creation cancelled", "info");
    this.router.navigate(["/admin/exams"]);
  }

  private showToast(
    message: string,
    type: "success" | "error" | "info" | "warning"
  ): void {
    const config = {
      timeOut: 3000,
      positionClass: "toast-top-right",
      progressBar: true,
      closeButton: true,
    };

    switch (type) {
      case "success":
        this.toastr.success(message, "Success", config);
        break;
      case "error":
        this.toastr.error(message, "Error", config);
        break;
      case "info":
        this.toastr.info(message, "Info", config);
        break;
      case "warning":
        this.toastr.warning(message, "Warning", config);
        break;
    }
  }
}
