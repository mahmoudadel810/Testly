import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teacher-or-student',
  standalone: true,
  imports: [],
  templateUrl: './teacher-or-student.component.html',
  styleUrl: './teacher-or-student.component.css'
})
export class TeacherOrStudentComponent {
  constructor(private router: Router) {}

  selectRole(role: string): void {
    if (role === 'teacher') {
      this.router.navigate(['/teacher-register']);
    } else if (role === 'student') {
      this.router.navigate(['/register']);
    }
  }
}
