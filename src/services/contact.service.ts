import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../models/constants';

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
  constructor(private http: HttpClient) {}

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
    return this.http.get<ContactMessage[]>(url);
  }

  getMessage(id: string): Observable<ContactMessage> {
    return this.http.get<ContactMessage>(
      `${API_ENDPOINTS.CONTACT}/admin/messages/${id}`
    );
  }

  updateMessageStatus(
    id: string,
    status: 'new' | 'in-progress' | 'resolved'
  ): Observable<any> {
    return this.http.put(`${API_ENDPOINTS.CONTACT}/admin/messages/${id}`, {
      status,
    });
  }

  deleteMessage(id: string): Observable<any> {
    return this.http.delete(`${API_ENDPOINTS.CONTACT}/admin/messages/${id}`);
  }
}
