import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../services/translation.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { TranslateDirective } from '../../../directives/translate.directive';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateDirective, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  host: { ngSkipHydration: '' },
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  currentLang: string = 'en';
  supportedLanguages: {code: string, name: string}[] = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' }
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    // Subscribe to language changes
    this.translationService.getCurrentLang().subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  /**
   * Change the application language
   */
  changeLanguage(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const langCode = select.value;
    this.translationService.setLanguage(langCode);
  }
}
