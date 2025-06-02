import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslationService } from '../../../services/translation.service';
import { TranslateDirective } from '../../../directives/translate.directive';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
  selector: 'app-teacher-pending',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateDirective, TranslatePipe],
  templateUrl: './teacher-pending.component.html',
  styleUrls: ['./teacher-pending.component.css'],
})
export class TeacherPendingComponent {
  constructor(private router: Router, private translationService: TranslationService) {}

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
