import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationService } from '../../../services/translation.service';
import { TranslateDirective } from '../../../directives/translate.directive';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-teacher-or-student',
  standalone: true,
  imports: [TranslateDirective, TranslatePipe],
  templateUrl: './teacher-or-student.component.html',
  styleUrl: './teacher-or-student.component.css'
})
export class TeacherOrStudentComponent {
  constructor(private router: Router, private translationService: TranslationService) {}

  selectRole(role: string): void {
    if (role === 'teacher') {
      this.router.navigate(['/teacher-register']);
    } else if (role === 'student') {
      this.router.navigate(['/register']);
    }
  }
}
