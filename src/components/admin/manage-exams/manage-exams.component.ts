/** @format */

import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, Router } from "@angular/router";
import { ExamService } from "../../../services/exam.service";
import { Exam } from "../../../models/exam.model";
import { ToastrService } from "ngx-toastr";
import { TranslationService } from "../../../services/translation.service";
import { TranslateDirective } from "../../../directives/translate.directive";
import { TranslatePipe } from "../../../pipes/translate.pipe";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-manage-exams",
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateDirective, TranslatePipe],
  templateUrl: "./manage-exams.component.html",
  styleUrls: ["./manage-exams.component.css"]
})
export class ManageExamsComponent implements OnInit, OnDestroy {
  exams: Exam[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private examService: ExamService,
    private router: Router,
    private toastr: ToastrService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadExams();
    
    // Subscribe to language changes to reload data when language changes
    this.translationService.getCurrentLang()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // When language changes, we don't need to reload exams
        // But we can do other language-specific operations here if needed
      });
  }

  private loadExams(): void {
    this.examService.getAdminExams().subscribe({
      next: (exams) => {
        this.exams = exams;
        this.loading = false;
        this.toastr.success("Exams loaded successfully", "Success");

        // Debug: Log the structure of the first exam to understand the data
        if (exams.length > 0) {
          // console.log('Exam data structure:', exams[0]);
          // console.log('Creator details:', exams[0].createdBy);
          // console.log('Teacher details:', exams[0].teacherId);

          // Check what role information is available
          const creator = exams[0].createdBy;
          if (creator) {
            // console.log('Creator type:', typeof creator);
            if (typeof creator === "object") {
              // console.log('Creator properties:', Object.keys(creator));
              // Don't try to access role directly as it doesn't exist in the model
              // console.log('Teacher ID info:', exams[0].teacherId);
            }
          }
        }

        this.toastr.success("Exams loaded successfully", "Success");
      },
      error: (error) => {
        this.toastr.error(this.translationService.translate('ADMIN.FAILED_TO_LOAD_EXAMS'), this.translationService.translate('ADMIN.ERROR'));
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
    return this.translationService.translate('COMMON.UNKNOWN');
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
    const confirmMsg = this.translationService.translate('ADMIN.CONFIRM_DELETE_EXAM');
    const successMsg = this.translationService.translate('ADMIN.EXAM_DELETED');
    const errorMsg = this.translationService.translate('ADMIN.DELETE_EXAM_ERROR');
    
    if (confirm(confirmMsg)) {
      this.examService.deleteExam(id).subscribe({
        next: () => {
          this.toastr.success(successMsg);
          this.loadExams(); // Refresh the list
        },
        error: (error) => {
          this.toastr.error(errorMsg);
          console.error('Error deleting exam:', error);
        },
      });
    }
  }

  /**
   * Clean up subscriptions when component is destroyed
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
