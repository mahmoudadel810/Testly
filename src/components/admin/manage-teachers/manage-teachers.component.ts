import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-teachers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manage-teachers.component.html',
  styleUrls: ['./manage-teachers.component.css'],
})
export class ManageTeachersComponent implements OnInit {
  pendingTeachers: any[] = [];
  loading = true;

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService
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
        this.toastr.success(
          'Pending teachers list loaded successfully',
          'Success',
          {
            positionClass: 'toast-top-right',
            timeOut: 3000,
          }
        );
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error('Failed to load the pending teachers list. Please try again.', 'Error');
        console.error('Failed to load pending teachers:', error);
      },
    });
  }

  approveTeacher(teacherId: string, index: number): void {
    if (confirm('Are you sure you want to approve this teacher?')) {
      this.adminService.approveTeacher(teacherId).subscribe({
        next: (response) => {
          this.pendingTeachers.splice(index, 1);
          this.toastr.success('Teacher approved successfully', 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 3000,
          });
        },
        error: (error) => {
          this.toastr.error('Failed to approve the teacher', 'Error');
          console.error('Error approving teacher:', error);
        },
      });
    }
  }

  rejectTeacher(teacherId: string, index: number): void {
    if (confirm('Are you sure you want to reject this teacher? This action cannot be undone.')) {
      this.adminService.rejectTeacher(teacherId).subscribe({
        next: (response) => {
          this.pendingTeachers.splice(index, 1);
          this.toastr.success('Teacher rejected successfully', 'Success', {
            positionClass: 'toast-top-right',
            timeOut: 3000,
          });
        },
        error: (error) => {
          this.toastr.error('Failed to reject the teacher', 'Error');
          console.error('Error rejecting teacher:', error);
        },
      });
    }
  }
}
