/** @format */

<<<<<<< HEAD
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { ExamService } from "../../../services/exam.service";
import { ContactService } from "../../../services/contact.service";
import { AdminService } from "../../../services/admin.service";
import { ToastrService } from "ngx-toastr";
import Swal from "sweetalert2";
=======
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { ContactService } from '../../../services/contact.service';
import { AdminService } from '../../../services/admin.service';
import { ToastrService } from 'ngx-toastr';
>>>>>>> aad350ed2599bfb783658c338a14e4332547666a

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.css"]
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalExams: -1, // -1 means not loaded yet
    totalAttempts: -1,
    passRate: -1,
    newMessages: -1,
    pendingTeachers: -1
  };
  isLoading: boolean = false;

  constructor(
    private examService: ExamService,
    private contactService: ContactService,
    private adminService: AdminService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.showWelcomeMessage();
  }

  private showWelcomeMessage(): void {
    this.toastr.success("Welcome back to your dashboard!", "Hello Admin", {
      positionClass: "toast-top-right",
      timeOut: 3000,
      progressBar: true
    });
  }

  loadStats(): void {
    this.isLoading = true;
    this.stats = {
      totalExams: -1,
      totalAttempts: -1,
      passRate: -1,
      newMessages: -1,
      pendingTeachers: -1
    };

    // Load exams
    this.examService.getAdminExams().subscribe({
      next: (exams) => {
        this.stats.totalExams = exams.length;
        this.checkLoadingComplete();
      },
      error: (error) => {
        this.toastr.error("Failed to load exams data", "Error");
        console.error("Error loading exams", error);
        this.stats.totalExams = 0;
        this.checkLoadingComplete();
      }
    });

    // Load attempts
    this.examService.getAllAttempts().subscribe({
      next: (attempts) => {
        this.stats.totalAttempts = attempts.length;

        if (attempts.length > 0) {
          const passedAttempts = attempts.filter((a) => a.passed).length;
          this.stats.passRate = Math.round(
            (passedAttempts / attempts.length) * 100
          );
        } else {
          this.stats.passRate = 0;
        }
        this.checkLoadingComplete();
      },
      error: (error) => {
        this.toastr.error("Failed to load attempts data", "Error");
        console.error("Error loading attempts", error);
        this.stats.totalAttempts = 0;
        this.stats.passRate = 0;
        this.checkLoadingComplete();
      }
    });

    // Load new contact messages
    this.contactService.getAllMessages("new").subscribe({
      next: (messages) => {
        this.stats.newMessages = messages.length;
        if (messages.length > 0) {
          this.toastr.info(
            `You have ${messages.length} new messages`,
            "New Messages"
          );
        }
        this.checkLoadingComplete();
      },
      error: (error) => {
        this.toastr.error("Failed to load messages", "Error");
        console.error("Error loading messages", error);
        this.stats.newMessages = 0;
        this.checkLoadingComplete();
      }
    });

    // Load pending teachers count
    this.adminService.getPendingTeachersCount().subscribe({
      next: (count) => {
        this.stats.pendingTeachers = count;
        if (count > 0) {
          this.showPendingTeachersAlert(count);
        }
        this.checkLoadingComplete();
      },
      error: (error) => {
        this.toastr.error("Failed to load pending teachers count", "Error");
        console.error("Error loading pending teachers count", error);
        this.stats.pendingTeachers = 0;
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    const allLoaded = Object.values(this.stats).every((val) => val !== -1);
    if (allLoaded) {
      this.isLoading = false;
      this.toastr.success("Dashboard data updated successfully!", "Updated", {
        timeOut: 2000
      });
    }
  }

  private showPendingTeachersAlert(count: number): void {
<<<<<<< HEAD
    Swal.fire({
      title: "Pending Teacher Approvals",
      html: `You have <b>${count}</b> teacher applications waiting for review.`,
      icon: "warning",
      confirmButtonText: "Review Now",
      showCancelButton: true,
      cancelButtonText: "Later",
      customClass: {
        confirmButton: "btn btn-primaryCSS",
        cancelButton: "btn btn-accentCSS"
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.toastr.info(
          "Redirecting to teachers approval page",
          "Redirecting"
        );
      }
    });
  }
}
=======
  }}
>>>>>>> aad350ed2599bfb783658c338a14e4332547666a
