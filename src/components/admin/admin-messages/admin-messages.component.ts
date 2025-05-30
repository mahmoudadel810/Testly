import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  ContactService,
  ContactMessage,
} from '../../../services/contact.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-messages.component.html',
  styleUrls: ['./admin-messages.component.css'],
})
export class AdminMessagesComponent implements OnInit {
  messages: ContactMessage[] = [];
  filteredMessages: ContactMessage[] = [];
  selectedMessage: ContactMessage | null = null;
  statusFilter: string = '';
  loading = true;
  error = '';

  constructor(
    private contactService: ContactService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.statusFilter = params['filter'] || '';
      this.loadMessages(this.statusFilter);
    });
  }

  loadMessages(status?: string): void {
    this.loading = true;
    this.error = '';

    this.contactService.getAllMessages(status).subscribe({
      next: (data) => {
        this.messages = data;
        this.filteredMessages = data;
        this.loading = false;
        this.toastr.success('Messages loaded successfully');
      },
      error: (err) => {
        this.error = 'Failed to load messages';
        this.loading = false;
        this.toastr.error('Failed to load messages');
      },
    });
  }

  applyFilter(status: string): void {
    this.statusFilter = status;
    this.loadMessages(status);
  }

  viewMessage(message: ContactMessage): void {
    this.selectedMessage = { ...message };
  }

  closeMessage(): void {
    this.selectedMessage = null;
  }

  updateStatus(
    message: ContactMessage,
    newStatus: 'new' | 'in-progress' | 'resolved'
  ): void {
    if (message.status === newStatus) return;

    Swal.fire({
      title: 'Confirm Status Change',
      text: `Are you sure you want to change status to ${newStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.contactService
          .updateMessageStatus(message._id, newStatus)
          .subscribe({
            next: () => {
              message.status = newStatus;
              if (
                this.selectedMessage &&
                this.selectedMessage._id === message._id
              ) {
                this.selectedMessage.status = newStatus;
              }
              this.toastr.success('Status updated successfully');
            },
            error: (err) => {
              this.toastr.error('Failed to update status');
            },
          });
      }
    });
  }

  deleteMessage(message: ContactMessage): void {
    Swal.fire({
      title: 'Delete Message',
      text: 'Are you sure you want to delete this message?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#e74c3c',
    }).then((result) => {
      if (result.isConfirmed) {
        this.contactService.deleteMessage(message._id).subscribe({
          next: () => {
            this.messages = this.messages.filter((m) => m._id !== message._id);
            this.filteredMessages = this.filteredMessages.filter(
              (m) => m._id !== message._id
            );
            if (this.selectedMessage?._id === message._id) {
              this.selectedMessage = null;
            }
            this.toastr.success('Message deleted successfully');
          },
          error: (err) => {
            this.toastr.error('Failed to delete message');
          },
        });
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }
}
