import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TranslationService } from '../services/translation.service';

@Directive({
  selector: '[appTranslate]',
  standalone: true,
})
export class TranslateDirective implements OnInit, OnChanges, OnDestroy {
  @Input('appTranslate') key: string = '';
  @Input('translateParams') params?: { [key: string]: any };

  private destroy$ = new Subject<void>();

  constructor(
    private el: ElementRef,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.updateTranslation();
    
    // Update when language changes
    this.translationService.getCurrentLang()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateTranslation());
  }

  ngOnChanges(): void {
    this.updateTranslation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateTranslation(): void {
    if (this.key) {
      this.el.nativeElement.textContent = this.translationService.translate(
        this.key,
        this.params
      );
    }
  }
}
