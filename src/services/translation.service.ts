import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations: { [key: string]: any } = {};
  private currentLang = new BehaviorSubject<string>('en');
  
  // List of supported languages
  readonly supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' }
  ];

  constructor(
    private http: HttpClient,
    private logger: LoggingService
  ) {
    // Try to load saved language from localStorage
    const savedLang = localStorage.getItem('language');
    if (savedLang && this.supportedLanguages.some(lang => lang.code === savedLang)) {
      this.setLanguage(savedLang);
    } else {
      this.loadTranslations('en');
    }
  }

  /**
   * Get the current language code
   */
  getCurrentLang(): Observable<string> {
    return this.currentLang.asObservable();
  }

  /**
   * Get the current language's text direction
   * Returns 'rtl' for Arabic, 'ltr' for other languages
   */
  getTextDirection(): Observable<string> {
    return this.currentLang.pipe(
      tap(lang => {
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        
        if (lang === 'ar') {
          document.body.classList.add('rtl-layout');
        } else {
          document.body.classList.remove('rtl-layout');
        }
      }),
      tap(lang => lang === 'ar' ? 'rtl' : 'ltr')
    );
  }

  /**
   * Set the current language and load its translations
   */
  setLanguage(langCode: string): void {
    if (this.supportedLanguages.some(lang => lang.code === langCode)) {
      this.loadTranslations(langCode);
      localStorage.setItem('language', langCode);
    } else {
      this.logger.error(`Language not supported: ${langCode}`);
    }
  }

  /**
   * Load translations for a specific language
   */
  private loadTranslations(langCode: string): void {
    this.http.get<any>(`assets/i18n/${langCode}.json`)
      .pipe(
        catchError(error => {
          this.logger.error(`Error loading translations for ${langCode}:`, error);
          return of({});
        })
      )
      .subscribe(translations => {
        this.translations[langCode] = translations;
        this.currentLang.next(langCode);
        this.logger.debug(`Loaded translations for: ${langCode}`);
      });
  }

  /**
   * Get translation for a key in the current language
   */
  translate(key: string, params?: {[key: string]: any} | any[]): string {
    const lang = this.currentLang.value;
    if (!this.translations[lang]) {
      return key;
    }
    
    // Check if the key contains parameters directly (format: key:param1:param2)
    if (key.includes(':')) {
      const parts = key.split(':');
      const actualKey = parts[0];
      const paramValues = parts.slice(1);
      return this.translateWithNumericParams(actualKey, paramValues);
    }

    // Split the key by dots to navigate through nested objects
    const keys = key.split('.');
    let value = this.translations[lang];
    
    // Navigate through the nested translation object
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        this.logger.warn(`Translation key not found: ${key} in language: ${lang}`);
        return key;
      }
    }

    // Handle string values with parameters
    if (typeof value === 'string') {
      if (Array.isArray(params)) {
        return this.interpolateNumericParams(value, params);
      } else if (params) {
        return this.interpolateParams(value, params);
      }
    }

    return typeof value === 'string' ? value : key;
  }

  /**
   * Replace parameters in translation strings
   * Format: {{ paramName }}
   */
  private interpolateParams(text: string, params: {[key: string]: any}): string {
    return text.replace(/{{[\s]?([^}]+)[\s]?}}/g, (_, paramName) => {
      const trimmedParam = paramName.trim();
      return params[trimmedParam] !== undefined ? params[trimmedParam] : `{{${trimmedParam}}}`;
    });
  }

  /**
   * Replace numeric parameters in translation strings
   * Format: {0}, {1}, {2}, etc.
   */
  private interpolateNumericParams(text: string, params: any[]): string {
    return text.replace(/{(\d+)}/g, (_, index) => {
      const paramIndex = parseInt(index, 10);
      return params[paramIndex] !== undefined ? params[paramIndex].toString() : `{${index}}`;
    });
  }

  /**
   * Translate a key and apply numeric parameters
   * Used for keys with inline parameters (format: key:param1:param2)
   */
  private translateWithNumericParams(key: string, params: string[]): string {
    const translatedText = this.translate(key);
    if (translatedText === key) {
      return key; // Key wasn't found
    }
    return this.interpolateNumericParams(translatedText, params);
  }
}
