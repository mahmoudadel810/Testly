/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.css"]
})
export class ForgotPasswordComponent {
  email: string = "";
  isLoading = false;
  message = "";
  error = "";

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.isLoading = true;
    this.message = "";
    this.error = "";
    this.authService.resetPassword(this.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.message = "A reset code has been sent to your email.";
        // Optionally, navigate to reset-password page
        this.router.navigate(["/reset-password"], {
          queryParams: { email: this.email }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || "Failed to send reset code.";
      }
    });
  }
}
