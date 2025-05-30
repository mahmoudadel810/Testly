import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

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
        Swal.fire({
          title: 'Error',
          text: 'Failed to load the pending teachers list. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#dc3545',
        });
        console.error('Failed to load pending teachers:', error);
      },
    });
  }

  approveTeacher(teacherId: string, index: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to approve this teacher?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.approveTeacher(teacherId).subscribe({
          next: (response) => {
            this.pendingTeachers.splice(index, 1);
            this.toastr.success('Teacher approved successfully', 'Success', {
              positionClass: 'toast-top-right',
              timeOut: 3000,
            });
          },
          error: (error) => {
            Swal.fire({
              title: 'Error',
              text: 'Failed to approve the teacher',
              icon: 'error',
              confirmButtonText: 'OK',
              confirmButtonColor: '#dc3545',
            });
            console.error('Error approving teacher:', error);
          },
        });
      }
    });
  }

  rejectTeacher(teacherId: string, index: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to reject this teacher? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reject',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.rejectTeacher(teacherId).subscribe({
          next: (response) => {
            this.pendingTeachers.splice(index, 1);
            this.toastr.success('Teacher rejected successfully', 'Success', {
              positionClass: 'toast-top-right',
              timeOut: 3000,
            });
          },
          error: (error) => {
            Swal.fire({
              title: 'Error',
              text: 'Failed to reject the teacher',
              icon: 'error',
              confirmButtonText: 'OK',
              confirmButtonColor: '#dc3545',
            });
            console.error('Error rejecting teacher:', error);
          },
        });
      }
    });
  }
}
