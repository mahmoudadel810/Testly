import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-teacher-pending',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './teacher-pending.component.html',
  styleUrls: ['./teacher-pending.component.css'],
})
export class TeacherPendingComponent {
  constructor(private router: Router) {}

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
