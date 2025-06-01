import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { ContactService, ContactMessage } from "../../../services/contact.service";
import { ConfirmationPopupComponent } from "../../shared/confirmation-popup/confirmation-popup.component";

@Component({
  selector: "app-admin-messages",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmationPopupComponent],
  templateUrl: "./admin-messages.component.html",
  styleUrls: ["./admin-messages.component.css"]
})
export class AdminMessagesComponent implements OnInit {
  messages: ContactMessage[] = [];
  filteredMessages: ContactMessage[] = [];
  selectedMessage: ContactMessage | null = null;
  statusFilter: string = "";
  loading = true;
  error = "";
  showDeleteModal = false;
  messageToDelete: ContactMessage | null = null;

  constructor(
    private contactService: ContactService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.statusFilter = params["filter"] || "";
      this.loadMessages(this.statusFilter);
    });
  }

  loadMessages(status?: string): void {
    this.loading = true;
    this.error = "";

    this.contactService.getAllMessages(status).subscribe({
      next: (data) => {
        this.messages = data;
        this.filteredMessages = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = "Failed to load messages";
        this.loading = false;
      }
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
    newStatus: "new" | "in-progress" | "resolved"
  ): void {
    if (message.status === newStatus) return;
  }

  openDeleteModal(message: ContactMessage): void {
    this.messageToDelete = message;
    this.showDeleteModal = true;
  }

  onDeleteConfirmed(): void {
    if (!this.messageToDelete) return;

    const messageId = this.messageToDelete._id;
    this.contactService.deleteMessage(messageId).subscribe({
      next: () => {
        this.messages = this.messages.filter((m) => m._id !== messageId);
        this.filteredMessages = this.filteredMessages.filter(
          (m) => m._id !== messageId
        );
        if (this.selectedMessage?._id === messageId) {
          this.selectedMessage = null;
        }
        this.showDeleteModal = false;
        this.messageToDelete = null;
      },
      error: (err) => {
        this.showDeleteModal = false;
        this.messageToDelete = null;
      }
    });
  }

  onDeleteCancelled(): void {
    this.showDeleteModal = false;
    this.messageToDelete = null;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }
}