import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoggingService } from './logging.service';
import { STORAGE_KEYS } from '../models/constants';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  private isBrowser: boolean;
  private bookmarkedItems: { [key: string]: string[] } = {};

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private logger: LoggingService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadBookmarks();
  }

  /**
   * Loads all bookmarks from local storage
   */
  private loadBookmarks(): void {
    if (!this.isBrowser) return;

    try {
      const savedBookmarks = localStorage.getItem(
        STORAGE_KEYS.BOOKMARKED_EXAMS
      );
      if (savedBookmarks) {
        this.bookmarkedItems[STORAGE_KEYS.BOOKMARKED_EXAMS] =
          JSON.parse(savedBookmarks);
      } else {
        this.bookmarkedItems[STORAGE_KEYS.BOOKMARKED_EXAMS] = [];
      }
    } catch (error) {
      this.logger.error('Error loading bookmarks:', error);
      this.bookmarkedItems[STORAGE_KEYS.BOOKMARKED_EXAMS] = [];
    }
  }

  /**
   * Saves bookmarks to local storage
   * @param type Type of bookmark (default is exams)
   */
  private saveBookmarks(type: string = STORAGE_KEYS.BOOKMARKED_EXAMS): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(
        type,
        JSON.stringify(this.bookmarkedItems[type] || [])
      );
    } catch (error) {
      this.logger.error(`Error saving bookmarks for ${type}:`, error);
    }
  }

  /**
   * Gets all bookmarked items of a specific type
   * @param type Type of bookmarks to retrieve
   * @returns Array of bookmarked item IDs
   */
  getBookmarkedItems(type: string = STORAGE_KEYS.BOOKMARKED_EXAMS): string[] {
    return [...(this.bookmarkedItems[type] || [])];
  }

  /**
   * Checks if an item is bookmarked
   * @param id Item ID to check
   * @param type Type of bookmark
   * @returns True if item is bookmarked, false otherwise
   */
  isBookmarked(
    id: string | undefined,
    type: string = STORAGE_KEYS.BOOKMARKED_EXAMS
  ): boolean {
    if (!id) return false;
    return (this.bookmarkedItems[type] || []).includes(id);
  }

  /**
   * Toggles bookmark status for an item
   * @param id Item ID to toggle
   * @param type Type of bookmark
   * @returns True if item is now bookmarked, false if removed
   */
  toggleBookmark(
    id: string | undefined,
    type: string = STORAGE_KEYS.BOOKMARKED_EXAMS
  ): boolean {
    if (!id) return false;

    if (!this.bookmarkedItems[type]) {
      this.bookmarkedItems[type] = [];
    }

    const index = this.bookmarkedItems[type].indexOf(id);
    let isNowBookmarked = false;

    if (index === -1) {
      // Add to bookmarks
      this.bookmarkedItems[type].push(id);
      isNowBookmarked = true;
      this.logger.debug(`Added item ${id} to ${type} bookmarks`);
    } else {
      // Remove from bookmarks
      this.bookmarkedItems[type].splice(index, 1);
      this.logger.debug(`Removed item ${id} from ${type} bookmarks`);
    }

    this.saveBookmarks(type);
    return isNowBookmarked;
  }

  /**
   * Adds an item to bookmarks
   * @param id Item ID to add
   * @param type Type of bookmark
   */
  addBookmark(
    id: string | undefined,
    type: string = STORAGE_KEYS.BOOKMARKED_EXAMS
  ): void {
    if (!id) return;

    if (!this.bookmarkedItems[type]) {
      this.bookmarkedItems[type] = [];
    }

    if (!this.isBookmarked(id, type)) {
      this.bookmarkedItems[type].push(id);
      this.saveBookmarks(type);
      this.logger.debug(`Added item ${id} to ${type} bookmarks`);
    }
  }

  /**
   * Removes an item from bookmarks
   * @param id Item ID to remove
   * @param type Type of bookmark
   */
  removeBookmark(
    id: string | undefined,
    type: string = STORAGE_KEYS.BOOKMARKED_EXAMS
  ): void {
    if (!id) return;

    if (!this.bookmarkedItems[type]) {
      return;
    }

    const index = this.bookmarkedItems[type].indexOf(id);
    if (index !== -1) {
      this.bookmarkedItems[type].splice(index, 1);
      this.saveBookmarks(type);
      this.logger.debug(`Removed item ${id} from ${type} bookmarks`);
    }
  }

  /**
   * Clears all bookmarks of a specific type
   * @param type Type of bookmarks to clear
   */
  clearBookmarks(type: string = STORAGE_KEYS.BOOKMARKED_EXAMS): void {
    this.bookmarkedItems[type] = [];
    this.saveBookmarks(type);
    this.logger.debug(`Cleared all ${type} bookmarks`);
  }
}
