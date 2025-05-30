/** @format */

import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ExamService } from "../../../services/exam.service";
import { Exam, Question } from "../../../models/exam.model";

@Component({
  selector: "app-edit-exam",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./edit-exam.component.html",
  styleUrls: ["./edit-exam.component.css"]
})
export class EditExamComponent implements OnInit {
  exam: Exam | null = null;
  loading = true;
  saving = false;
  error = "";

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
        this.exam = exam;
        this.loading = false;
      },
      error: (error) => {
        this.error = "Failed to load exam. Please try again later.";
        this.loading = false;
      }
    });
  }

  addQuestion(): void {
    if (!this.exam) return;

    const newQuestion: Question = {
      text: "",
      options: ["", ""],
      correctAnswer: 0,
      points: 1
    };
    this.exam.questions.push(newQuestion);
  }

  removeQuestion(index: number): void {
    if (!this.exam) return;
    this.exam.questions.splice(index, 1);
  }

  addOption(question: Question): void {
    question.options.push("");
  }

  removeOption(question: Question, index: number): void {
    if (question.options.length > 2) {
      question.options.splice(index, 1);
      if (question.correctAnswer >= index) {
        question.correctAnswer = Math.max(0, question.correctAnswer - 1);
      }
    }
  }

  onSubmit(): void {
    if (!this.exam) return;

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
      }
    });
  }

  cancel(): void {
    this.router.navigate(["/admin/exams"]);
  }
}
