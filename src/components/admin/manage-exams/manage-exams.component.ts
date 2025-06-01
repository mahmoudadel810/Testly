import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { Exam } from '../../../models/exam.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manage-exams',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './manage-exams.component.html',
  styleUrls: ['./manage-exams.component.css'],
})
export class ManageExamsComponent implements OnInit {
  exams: Exam[] = [];
  loading = true;

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
        
        // Debug: Log the structure of the first exam to understand the data
        if (exams.length > 0) {
          console.log('Exam data structure:', exams[0]);
          console.log('Creator details:', exams[0].createdBy);
          console.log('Teacher details:', exams[0].teacherId);
          
          // Check what role information is available
          const creator = exams[0].createdBy;
          if (creator) {
            console.log('Creator type:', typeof creator);
            if (typeof creator === 'object') {
              console.log('Creator properties:', Object.keys(creator));
              // Don't try to access role directly as it doesn't exist in the model
              console.log('Teacher ID info:', exams[0].teacherId);
            }
          }
        }
        
        this.toastr.success('Exams loaded successfully', 'Success');
      },
      error: (error) => {
        this.toastr.error('Failed to load exams. Please try again.', 'Error');
        this.loading = false;
      },
    });
  }

  getTeacherName(exam: Exam): string {
    const teacher = exam.teacherId;
    const creator = exam.createdBy;
    if (teacher && typeof teacher === 'object' && 'name' in teacher) {
      return teacher.name ?? 'Unknown';
    }
    if (creator && typeof creator === 'object' && 'name' in creator) {
      return typeof creator.name === 'string' ? creator.name : 'Unknown';
    }
    return 'Unknown';
  }

  getTeacherEmail(exam: Exam): string {
    let email = '';
    if (
      exam.teacherId &&
      typeof exam.teacherId === 'object' &&
      'email' in exam.teacherId
    ) {
      email = exam.teacherId.email ?? '';
    } else if (
      exam.createdBy &&
      typeof exam.createdBy === 'object' &&
      'email' in exam.createdBy
    ) {
      email = exam.createdBy.email ?? '';
    }
    return email;
  }
  
  getCreatorRole(exam: Exam): string {
    // If the exam has a teacherId property that's the same as the createdBy ID,
    // or if teacherId is an object that contains information, it's a teacher
    if (exam.teacherId) {
      if (typeof exam.teacherId === 'object' && '_id' in exam.teacherId) {
        // If we have a populated teacherId object
        const teacherIdObj = exam.teacherId;
        
        // Check if createdBy is an object with the same ID as teacherId
        if (exam.createdBy && typeof exam.createdBy === 'object' && '_id' in exam.createdBy) {
          const creatorId = exam.createdBy._id;
          if (creatorId === teacherIdObj._id) {
            return 'Teacher';
          }
        }
        
        // If we have a teacherId with details, this was created by a teacher
        return 'Teacher';
      } else if (typeof exam.teacherId === 'string') {
        // If teacherId is a string, check if it matches createdBy
        if (exam.createdBy && typeof exam.createdBy === 'object' && '_id' in exam.createdBy) {
          if (exam.teacherId === exam.createdBy._id) {
            return 'Teacher';
          }
        } else if (exam.createdBy === exam.teacherId) {
          return 'Teacher';
        }
        
        // If we have a teacherId string, this was likely created by a teacher
        return 'Teacher';
      }
    }
    
    // If we have a createdBy but no matching teacherId, or teacherId is different
    // from createdBy, it's likely an admin
    if (exam.createdBy) {
      return 'Admin';
    }
    
    // Default fallback
    return 'Unknown';
  }

  deleteExam(id: string): void {
    if (confirm("Are you sure you want to delete this exam? You won't be able to revert this!")) {
      this.confirmDelete(id);
    }
  }

  private confirmDelete(id: string): void {
    this.examService.deleteExam(id).subscribe({
      next: () => {
        this.exams = this.exams.filter((e) => e._id !== id);
        this.toastr.success('Exam has been deleted.', 'Deleted!');
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Failed to delete exam', 'Error!');
      },
    });
  }
}
