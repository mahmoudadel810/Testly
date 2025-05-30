import { Injectable } from '@angular/core';
import { Exam } from '../models/exam.model';
import { FILTER_TYPES } from '../models/constants';
import { BookmarkService } from './bookmark.service';

@Injectable({
  providedIn: 'root',
})
export class ExamFilterService {
  constructor(private bookmarkService: BookmarkService) {}

  /**
   * Filters exams based on search term and filter type
   * @param exams Array of exams to filter
   * @param searchTerm Search term to filter by (case-insensitive)
   * @param filterType Filter type from FILTER_TYPES
   * @returns Filtered array of exams
   */
  filterExams(
    exams: Exam[],
    searchTerm: string = '',
    filterType: string = FILTER_TYPES.ALL
  ): Exam[] {
    // First apply search term filtering
    let result = this.filterBySearchTerm(exams, searchTerm);

    // Then apply category filtering
    result = this.applyFilterType(result, filterType);

    return result;
  }

  /**
   * Filters exams by search term
   * @param exams Exams to filter
   * @param searchTerm Search term to match (case-insensitive)
   * @returns Filtered exams
   */
  private filterBySearchTerm(exams: Exam[], searchTerm: string = ''): Exam[] {
    if (!searchTerm) return exams;

    const term = searchTerm.toLowerCase();

    return exams.filter(
      (exam) =>
        exam.title.toLowerCase().includes(term) ||
        (exam.description && exam.description.toLowerCase().includes(term)) ||
        (exam.category && exam.category.toLowerCase().includes(term))
    );
  }

  /**
   * Applies filter type to exams
   * @param exams Exams to filter
   * @param filterType Filter type from FILTER_TYPES
   * @returns Filtered exams
   */
  private applyFilterType(exams: Exam[], filterType: string): Exam[] {
    switch (filterType) {
      case FILTER_TYPES.RECENT:
        // Sort by most recent
        return [...exams]
          .sort((a, b) => {
            const dateA = a.dateCreated ? new Date(a.dateCreated).getTime() : 0;
            const dateB = b.dateCreated ? new Date(b.dateCreated).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 10); // Limit to 10 most recent

      case FILTER_TYPES.POPULAR:
        // Sort by popularity (attempts count)
        return [...exams]
          .sort((a, b) => {
            const attemptsA = a.attempts || 0;
            const attemptsB = b.attempts || 0;
            return attemptsB - attemptsA;
          })
          .slice(0, 10); // Limit to 10 most popular

      case FILTER_TYPES.BOOKMARKED:
        // Filter to only show bookmarked exams
        const bookmarkedIds = this.bookmarkService.getBookmarkedItems();
        return exams.filter(
          (exam) => exam._id && bookmarkedIds.includes(exam._id)
        );

      case FILTER_TYPES.ALL:
      default:
        // Return all exams unfiltered
        return exams;
    }
  }

  /**
   * Sorts exams by a specific property
   * @param exams Exams to sort
   * @param sortBy Property to sort by
   * @param ascending Whether to sort in ascending order
   * @returns Sorted exams
   */
  sortExams(
    exams: Exam[],
    sortBy: keyof Exam,
    ascending: boolean = true
  ): Exam[] {
    return [...exams].sort((a, b) => {
      // Handle nested properties or missing values gracefully
      let valueA = a[sortBy];
      let valueB = b[sortBy];

      // Set default values for undefined properties
      if (valueA === undefined) valueA = '';
      if (valueB === undefined) valueB = '';

      // Handle date comparison
      if (
        sortBy === 'dateCreated' ||
        sortBy === 'createdAt' ||
        sortBy === 'updatedAt'
      ) {
        // For date strings
        if (typeof valueA === 'string' && valueA) {
          valueA = new Date(valueA).getTime();
        }
        // For Date objects
        else if (valueA instanceof Date) {
          valueA = valueA.getTime();
        }
        // Default
        else {
          valueA = 0;
        }

        // Same for valueB
        if (typeof valueB === 'string' && valueB) {
          valueB = new Date(valueB).getTime();
        } else if (valueB instanceof Date) {
          valueB = valueB.getTime();
        } else {
          valueB = 0;
        }
      }

      // Compare values
      if (valueA < valueB) return ascending ? -1 : 1;
      if (valueA > valueB) return ascending ? 1 : -1;
      return 0;
    });
  }
}
