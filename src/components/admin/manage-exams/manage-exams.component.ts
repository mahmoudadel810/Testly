import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, Router } from "@angular/router";
import { ExamService } from "../../../services/exam.service";
import { Exam } from "../../../models/exam.model";
import { ToastrService } from "ngx-toastr";
import { ConfirmationPopupComponent } from './../../shared/confirmation-popup/confirmation-popup.component';

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
  showDeleteConfirmation = false;
  examToDelete: string | null = null;

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
    if (teacher && typeof teacher === "object" && "name" in teacher) {
      return teacher.name ?? "Unknown";
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
    if (exam.teacherId) {
      if (typeof exam.teacherId === 'object' && '_id' in exam.teacherId) {
        const teacherIdObj = exam.teacherId;
        
        if (exam.createdBy && typeof exam.createdBy === 'object' && '_id' in exam.createdBy) {
          const creatorId = exam.createdBy._id;
          if (creatorId === teacherIdObj._id) {
            return 'Teacher';
          }
        }
        
        return 'Teacher';
      } else if (typeof exam.teacherId === 'string') {
        if (exam.createdBy && typeof exam.createdBy === 'object' && '_id' in exam.createdBy) {
          if (exam.teacherId === exam.createdBy._id) {
            return 'Teacher';
          }
        } else if (exam.createdBy === exam.teacherId) {
          return 'Teacher';
        }
        
        return 'Teacher';
      }
    }
    
    if (exam.createdBy) {
      return 'Admin';
    }
    
    return 'Unknown';
  }

  deleteExam(id: string): void {
    this.examToDelete = id;
    this.showDeleteConfirmation = true;
  }

  onDeleteConfirmed(): void {
    if (this.examToDelete) {
      this.examService.deleteExam(this.examToDelete).subscribe({
        next: () => {
          this.exams = this.exams.filter((e) => e._id !== this.examToDelete);
          this.toastr.success("Exam has been deleted.", "Deleted!");
          this.showDeleteConfirmation = false;
          this.examToDelete = null;
        },
        error: (error) => {
          this.toastr.error(
            error.error?.message || "Failed to delete exam",
            "Error!"
          );
          this.showDeleteConfirmation = false;
          this.examToDelete = null;
        }
      });
    }
  }

  onDeleteCancelled(): void {
    this.showDeleteConfirmation = false;
    this.examToDelete = null;
  }
}