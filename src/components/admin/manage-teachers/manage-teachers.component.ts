import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { ConfirmationPopupComponent } from '../../shared/confirmation-popup/confirmation-popup.component';

@Component({
  selector: 'app-manage-teachers',
  standalone: true,
  imports: [CommonModule, RouterModule, ConfirmationPopupComponent],
  templateUrl: './manage-teachers.component.html',
  styleUrls: ['./manage-teachers.component.css'],
})
export class ManageTeachersComponent implements OnInit {
  pendingTeachers: any[] = [];
  loading = true;
  showApproveConfirmation = false;
  showRejectConfirmation = false;
  selectedTeacherId: string | null = null;
  selectedTeacherIndex: number | null = null;

  constructor(
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadPendingTeachers();
  }

  loadPendingTeachers(): void {
    this.loading = true;
    this.adminService.getPendingTeachers().subscribe({
      next: (teachers) => {
        this.pendingTeachers = teachers;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Failed to load pending teachers:', error);
      },
    });
  }

  openApproveConfirmation(teacherId: string, index: number): void {
    this.selectedTeacherId = teacherId;
    this.selectedTeacherIndex = index;
    this.showApproveConfirmation = true;
  }

  openRejectConfirmation(teacherId: string, index: number): void {
    this.selectedTeacherId = teacherId;
    this.selectedTeacherIndex = index;
    this.showRejectConfirmation = true;
  }

  approveTeacher(): void {
    if (this.selectedTeacherId === null || this.selectedTeacherIndex === null) return;

    this.adminService.approveTeacher(this.selectedTeacherId).subscribe({
      next: (response) => {
        this.pendingTeachers.splice(this.selectedTeacherIndex!, 1);
        this.hideApproveConfirmation();
      },
      error: (error) => {
        console.error('Error approving teacher:', error);
        this.hideApproveConfirmation();
      },
    });
  }

  rejectTeacher(): void {
    if (this.selectedTeacherId === null || this.selectedTeacherIndex === null) return;

    this.adminService.rejectTeacher(this.selectedTeacherId).subscribe({
      next: (response) => {
        this.pendingTeachers.splice(this.selectedTeacherIndex!, 1);
        this.hideRejectConfirmation();
      },
      error: (error) => {
        console.error('Error rejecting teacher:', error);
        this.hideRejectConfirmation();
      },
    });
  }

  hideApproveConfirmation(): void {
    this.selectedTeacherId = null;
    this.selectedTeacherIndex = null;
    this.showApproveConfirmation = false;
  }

  hideRejectConfirmation(): void {
    this.selectedTeacherId = null;
    this.selectedTeacherIndex = null;
    this.showRejectConfirmation = false;
  }
}