import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { ExamService } from "../../../services/exam.service";
import { LoggingService } from "../../../services/logging.service";
import { Exam, ExamAttempt } from "../../../models/exam.model";
import { forkJoin } from "rxjs";

// Interface for API responses
interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

@Component({
  selector: "app-reports",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.css"],
})
export class ReportsComponent implements OnInit {
  exams: Exam[] = [];
  attempts: ExamAttempt[] = [];
  loading = true;
  error = "";

  // Report type selection
  selectedReportType: "summary" | "exams" | "students" = "summary";
  selectedExamId = "";
  selectedExamTitle = "";

  // Summary stats
  uniqueStudentCount = 0;
  averageScore = 0;
  topExams: {
    exam: Exam;
    attemptCount: number;
    passCount: number;
    passRate: number;
    studentCount: number;
  }[] = [];
  recentAttempts: ExamAttempt[] = [];

  // Exam-specific stats
  selectedExamStats: {
    attemptCount: number;
    passCount: number;
    passRate: number;
    studentCount: number;
  } | null = null;

  // Student stats
  studentStats: {
    studentId: string;
    studentName: string;
    examCount: number;
    attemptCount: number;
    passCount: number;
    passRate: number;
    averageScore: number;
  }[] = [];

  constructor(
    private examService: ExamService,
    private logger: LoggingService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;

    // Get teacher's exams and attempts in parallel
    forkJoin({
      exams: this.examService.getTeacherExams(),
      attempts: this.examService.getTeacherAttempts(),
    }).subscribe({
      next: ({
        exams,
        attempts,
      }: {
        exams: Exam[] | ApiResponse<Exam[]>;
        attempts: ExamAttempt[] | ApiResponse<ExamAttempt[]>;
      }) => {
        // Handle the API response format which may have a data wrapper
        // Handle both direct array responses and API response wrapper format
        // Use non-null assertion with fallback to empty array to satisfy TypeScript
        this.exams = Array.isArray(exams)
          ? exams
          : exams && typeof exams === "object" && "data" in exams
          ? exams.data ?? []
          : [];
        this.attempts = Array.isArray(attempts)
          ? attempts
          : attempts && typeof attempts === "object" && "data" in attempts
          ? attempts.data ?? []
          : [];

        // Process summary stats
        this.processSummaryStats();

        // Process student stats
        this.processStudentStats();

        this.loading = false;
      },
      error: (err) => {
        this.logger.error("Error loading report data", err);
        this.error = "Failed to load report data";
        this.loading = false;
      },
    });
  }

  changeReportType(): void {
    if (this.isReportTypeExams()) {
      this.selectedExamId = "";
      this.selectedExamStats = null;
    }
  }

  trackExamStat(index: number, stat: any): string {
    return stat.exam._id;
  }

  filterByExam(): void {
    if (!this.selectedExamId) {
      this.selectedExamStats = null;
      this.selectedExamTitle = "";
      return;
    }

    const exam = this.exams.find((e) => e._id === this.selectedExamId);
    if (!exam) return;

    this.selectedExamTitle = exam.title;

    // Get attempts for this exam
    const examAttempts = this.attempts.filter((a) => {
      const attemptExamId =
        typeof a.examId === "string" ? a.examId : a.examId?._id;
      return attemptExamId === this.selectedExamId;
    });

    // Count unique students
    const uniqueStudentIds = new Set(
      examAttempts.map((a) =>
        typeof a.userId === "string" ? a.userId : a.userId?._id
      )
    );

    // Calculate pass rate
    const passedAttempts = examAttempts.filter((a) => a.passed).length;
    const passRate =
      examAttempts.length > 0
        ? Math.round((passedAttempts / examAttempts.length) * 100)
        : 0;

    this.selectedExamStats = {
      attemptCount: examAttempts.length,
      passCount: passedAttempts,
      passRate,
      studentCount: uniqueStudentIds.size,
    };
  }

  // Helper methods to fix type checking issues with string literal comparisons
  isReportTypeExams(): boolean {
    return this.selectedReportType === "exams";
  }

  isReportTypeStudents(): boolean {
    return this.selectedReportType === "students";
  }

  isReportTypeSummary(): boolean {
    return this.selectedReportType === "summary";
  }

  private processSummaryStats(): void {
    // Ensure attempts is an array
    if (!Array.isArray(this.attempts)) {
      this.attempts = [];
    }

    // Count unique students
    const uniqueStudentIds = new Set(
      this.attempts.map((a) =>
        typeof a.userId === "string" ? a.userId : a.userId?._id
      )
    );
    this.uniqueStudentCount = uniqueStudentIds.size;

    // Calculate average score
    const totalScorePercentage = this.attempts.reduce((sum, attempt) => {
      return sum + (attempt.score / attempt.totalPoints) * 100;
    }, 0);
    this.averageScore =
      this.attempts.length > 0
        ? Math.round(totalScorePercentage / this.attempts.length)
        : 0;

    // Ensure exams is an array
    if (!Array.isArray(this.exams)) {
      this.exams = [];
    }

    // Process exam stats
    const examStats = this.exams.map((exam) => {
      // Get attempts for this exam
      const examAttempts = this.attempts.filter((a) => {
        const attemptExamId =
          typeof a.examId === "string" ? a.examId : a.examId?._id;
        return attemptExamId === exam._id;
      });

      // Count unique students
      const uniqueStudentIds = new Set(
        examAttempts.map((a) =>
          typeof a.userId === "string" ? a.userId : a.userId?._id
        )
      );

      // Calculate pass rate
      const passedAttempts = examAttempts.filter((a) => a.passed).length;
      const passRate =
        examAttempts.length > 0
          ? Math.round((passedAttempts / examAttempts.length) * 100)
          : 0;

      return {
        exam,
        attemptCount: examAttempts.length,
        passCount: passedAttempts,
        passRate,
        studentCount: uniqueStudentIds.size,
      };
    });

    // Sort by number of attempts (most popular first)
    this.topExams = [...examStats]
      .sort((a, b) => b.attemptCount - a.attemptCount)
      .slice(0, 5);

    // Get recent attempts
    this.recentAttempts = [...this.attempts]
      .sort((a, b) => {
        const dateA = a.endTime || a.startTime;
        const dateB = b.endTime || b.startTime;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(0, 5);
  }

  // Method for tracking attempts in lists
  trackAttempt(index: number, attempt: any): string {
    return attempt._id;
  }

  // Method for tracking student stats in lists
  trackStudentStat(index: number, stat: any): string {
    return stat.studentId;
  }

  private processStudentStats(): void {
    // Ensure attempts is an array
    if (!Array.isArray(this.attempts)) {
      this.attempts = [];
    }

    // Group attempts by student
    const studentAttemptsMap = new Map<string, ExamAttempt[]>();

    this.attempts.forEach((attempt) => {
      const studentId =
        typeof attempt.userId === "string"
          ? attempt.userId
          : attempt.userId?._id;

      if (!studentId) return;

      if (!studentAttemptsMap.has(studentId)) {
        studentAttemptsMap.set(studentId, []);
      }

      studentAttemptsMap.get(studentId)?.push(attempt);
    });

    // Process stats for each student
    this.studentStats = Array.from(studentAttemptsMap.entries()).map(
      ([studentId, attempts]) => {
        // Get student name
        const studentName = this.getStudentName(attempts[0].userId);

        // Count unique exams
        const uniqueExamIds = new Set(
          attempts.map((a) =>
            typeof a.examId === "string" ? a.examId : a.examId?._id
          )
        );

        // Calculate pass rate
        const passedAttempts = attempts.filter((a) => a.passed).length;
        const passRate =
          attempts.length > 0
            ? Math.round((passedAttempts / attempts.length) * 100)
            : 0;

        // Calculate average score
        const totalScorePercentage = attempts.reduce((sum, attempt) => {
          return sum + (attempt.score / attempt.totalPoints) * 100;
        }, 0);
        const averageScore =
          attempts.length > 0
            ? Math.round(totalScorePercentage / attempts.length)
            : 0;

        return {
          studentId,
          studentName,
          examCount: uniqueExamIds.size,
          attemptCount: attempts.length,
          passCount: passedAttempts,
          passRate,
          averageScore,
        };
      }
    );

    // Sort by number of attempts (most active first)
    this.studentStats.sort((a, b) => b.attemptCount - a.attemptCount);
  }

  formatDate(dateString: string | Date | undefined): string {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }

  getStudentName(
    userId: string | { _id: string; username?: string; email?: string }
  ): string {
    if (typeof userId === "object" && userId && "username" in userId) {
      return userId.username || "Unknown Student";
    }
    return "Unknown Student";
  }

  getExamTitle(
    examId: string | { _id: string; title?: string; description?: string }
  ): string {
    if (typeof examId === "object" && examId && "title" in examId) {
      return examId.title || "Unknown Exam";
    }

    const exam = this.exams.find((e) => e._id === examId);
    return exam?.title || "Unknown Exam";
  }
}
