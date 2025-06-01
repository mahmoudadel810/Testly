import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, tap } from 'rxjs';
import { API_ENDPOINTS } from '../models/constants';
import { TokenService } from './token.service';
import { environment } from '../environments/environment';

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
  status: 'new' | 'in-progress' | 'resolved';
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  // Public methods - accessible without login
  submitContactForm(formData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Observable<any> {
    return this.http.post(`${API_ENDPOINTS.CONTACT}/submit`, formData);
  }

  // Admin methods - requires authentication
  getAllMessages(status?: string): Observable<ContactMessage[]> {
    let url = `${API_ENDPOINTS.CONTACT}/admin/messages`;
    if (status) {
      url += `?status=${status}`;
    }

    // Ensure we have a valid token
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No authentication token available');
      return of([]);
    }

    // Add authorization header with proper format
    const headers = {
      Authorization: `${environment.bearerTokenPrefix}${token}`
    };

    console.debug('Authorization header:', headers.Authorization);

    // Define an interface for the API response format
    interface ApiResponse {
      success: boolean;
      data: ContactMessage[];
      message: string;
    }

    return this.http
      .get<any>(url, { headers })
      .pipe(
        tap(response => {
          // Log the raw response to debug what's coming back
          console.debug('Raw API response for messages:', response);

          // Check if response is empty or null
          if (!response) {
            console.warn('Empty response received for messages');
          }
        }),
        map(response => {
          // Handle different response formats
          if (Array.isArray(response)) {
            return response as ContactMessage[];
          } else if (response && typeof response === 'object') {
            // Check for common response patterns
            if (response.success && response.data && Array.isArray(response.data)) {
              return response.data as ContactMessage[];
            } else if (response.messages && Array.isArray(response.messages)) {
              return response.messages as ContactMessage[];
            } else if (response.items && Array.isArray(response.items)) {
              return response.items as ContactMessage[];
            } else {
              // Try to extract array from response
              const possibleArray = Object.values(response).find(val => Array.isArray(val));
              if (possibleArray) {
                return possibleArray as ContactMessage[];
              }
            }
          }

          // If we can't extract an array, return empty array
          console.warn('Could not extract messages array from response');
          return [] as ContactMessage[];
        }),
        tap(messages => {
          console.debug('Messages loaded:', messages.length);

          // Log additional info if no messages were found
          if (messages.length === 0) {
            console.warn('No messages found. Check API endpoint.');
          }
        }),
        catchError((error) => {
          console.error('Error fetching messages:', error);
          return of([]);
        })
      );
  }

  getMessage(id: string): Observable<ContactMessage> {
    // Ensure we have a valid token
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No authentication token available');
      return of({} as ContactMessage);
    }
    
    // Add authorization header with proper format
    const headers = {
      Authorization: `${environment.bearerTokenPrefix}${token}`
    };
    
    // Define an interface for the API response format
    interface ApiResponse {
      success: boolean;
      data: ContactMessage;
      message: string;
    }
    
    return this.http
      .get<any>(`${API_ENDPOINTS.CONTACT}/admin/messages/${id}`, { headers })
      .pipe(
        map(response => {
          // Handle different response formats
          if (response && typeof response === 'object') {
            if (response.success && response.data) {
              return response.data as ContactMessage;
            } else if (response._id) {
              // If the response is directly the message object
              return response as ContactMessage;
            }
          }
          console.warn(`Could not extract message data for ID: ${id}`);
          return {} as ContactMessage;
        }),
        catchError(error => {
          console.error(`Error fetching message ${id}:`, error);
          return of({} as ContactMessage);
        })
      );
  }

  updateMessageStatus(
    id: string,
    status: 'new' | 'in-progress' | 'resolved'
  ): Observable<any> {
    // Ensure we have a valid token
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No authentication token available');
      return of({ success: false, message: 'No authentication token' });
    }
    
    // Add authorization header with proper format
    const headers = {
      Authorization: `${environment.bearerTokenPrefix}${token}`
    };
    
    return this.http
      .put(`${API_ENDPOINTS.CONTACT}/admin/messages/${id}`, { status }, { headers })
      .pipe(
        catchError(error => {
          console.error(`Error updating message status ${id}:`, error);
          return of({ success: false, message: 'Failed to update status' });
        })
      );
  }

  deleteMessage(id: string): Observable<any> {
    // Ensure we have a valid token
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No authentication token available');
      return of({ success: false, message: 'No authentication token' });
    }
    
    // Add authorization header with proper format
    const headers = {
      Authorization: `${environment.bearerTokenPrefix}${token}`
    };
    
    return this.http
      .delete(`${API_ENDPOINTS.CONTACT}/admin/messages/${id}`, { headers })
      .pipe(
        catchError(error => {
          console.error(`Error deleting message ${id}:`, error);
          return of({ success: false, message: 'Failed to delete message' });
        })
      );
  }
}
