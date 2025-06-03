import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, Router } from "@angular/router";
import { ExamService } from "../../../services/exam.service";
import { Exam } from "../../../models/exam.model";
import { ToastrService } from "ngx-toastr";
import { ConfirmationPopupComponent } from "../../shared/confirmation-popup/confirmation-popup.component";

@Component({
  selector: "app-manage-exams",
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmationPopupComponent],
  templateUrl: "./manage-exams.component.html",
  styleUrls: ["./manage-exams.component.css"]
})
export class ManageExamsComponent implements OnInit {
  exams: Exam[] = [];
  loading = true;
  showDeletePopup = false;
  examIdToDelete: string | null = null;

  constructor(
    private examService: ExamService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  private loadExams(): void {
    this.examService.getAdminExams().subscribe({
      next: (exams) => {
        this.exams = exams;
        this.loading = false;
        this.toastr.success("Exams loaded successfully", "Success");
      },
      error: (error) => {
        this.toastr.error("Failed to load exams. Please try again.", "Error");
        this.loading = false;
      }
    });
  }

  getTeacherName(exam: Exam): string {
    const teacher = exam.teacherId;
    const creator = exam.createdBy;
    // Check if teacherId is populated and has a name
    if (teacher && typeof teacher === "object" && "name" in teacher) {
      return teacher.name ?? "Unknown";
    }
    // If teacherId is not available or doesn't have a name, check if createdBy is populated and has a username
    if (creator && typeof creator === "object" && "username" in creator) {
      return creator.username ?? "Unknown";
    }
    if (creator && typeof creator === "object" && "name" in creator) {
      return typeof creator.name === "string" ? creator.name : "Unknown";
    }
    return "Unknown";
  }

  getTeacherEmail(exam: Exam): string {
    let email = "";
    if (
      exam.teacherId &&
      typeof exam.teacherId === "object" &&
      "email" in exam.teacherId
    ) {
      email = exam.teacherId.email ?? "";
    } else if (
      exam.createdBy &&
      typeof exam.createdBy === "object" &&
      "email" in exam.createdBy
    ) {
      email = exam.createdBy.email ?? "";
    }
    return email;
  }

  getCreatorRole(exam: Exam): string {
    // If the exam has a teacherId property that's the same as the createdBy ID,
    // or if teacherId is an object that contains information, it's a teacher
    if (exam.teacherId) {
      if (typeof exam.teacherId === "object" && "_id" in exam.teacherId) {
        // If we have a populated teacherId object
        const teacherIdObj = exam.teacherId;

        // Check if createdBy is an object with the same ID as teacherId
        if (
          exam.createdBy &&
          typeof exam.createdBy === "object" &&
          "_id" in exam.createdBy
        ) {
          const creatorId = exam.createdBy._id;
          if (creatorId === teacherIdObj._id) {
            return "Teacher";
          }
        }

        // If we have a teacherId with details, this was created by a teacher
        return "Teacher";
      } else if (typeof exam.teacherId === "string") {
        // If teacherId is a string, check if it matches createdBy
        if (
          exam.createdBy &&
          typeof exam.createdBy === "object" &&
          "_id" in exam.createdBy
        ) {
          if (exam.teacherId === exam.createdBy._id) {
            return "Teacher";
          }
        } else if (exam.createdBy === exam.teacherId) {
          return "Teacher";
        }

        // If we have a teacherId string, this was likely created by a teacher
        return "Teacher";
      }
    }

    // If we have a createdBy but no matching teacherId, or teacherId is different
    // from createdBy, it's likely an admin
    if (exam.createdBy) {
      return "Admin";
    }

    // Default fallback
    return "Unknown";
  }

  deleteExam(id: string): void {
    this.examIdToDelete = id;
    this.showDeletePopup = true;
  }

  onDeleteConfirm(): void {
    if (this.examIdToDelete) {
      this.examService.deleteExam(this.examIdToDelete).subscribe({
        next: () => {
          this.exams = this.exams.filter((e) => e._id !== this.examIdToDelete);
          this.toastr.success("Exam has been deleted.", "Deleted!");
          this.showDeletePopup = false;
          this.examIdToDelete = null;
        },
        error: (error) => {
          this.toastr.error(
            error.error?.message || "Failed to delete exam",
            "Error!"
          );
          this.showDeletePopup = false;
          this.examIdToDelete = null;
        }
      });
    }
  }

  onDeleteCancel(): void {
    this.showDeletePopup = false;
    this.examIdToDelete = null;
  }
  
}
