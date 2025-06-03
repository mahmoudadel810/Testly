/** @format */

import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "app-reset-password",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.css"]
})
export class ResetPasswordComponent implements OnInit {
  email: string = "";
  code: string = "";
  newPassword: string = "";
  confirmNewPassword: string = "";
  isLoading = false;
  message = "";
  error = "";
  passwordError: string = "";
  confirmPasswordError: string = "";
  codeError: string = "";
  showNewPassword: boolean = false;
  showConfirmNewPassword: boolean = false;

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmNewPasswordVisibility() {
    this.showConfirmNewPassword = !this.showConfirmNewPassword;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.email = params["email"] || "";
    });
  }

  onSubmit() {
    this.isLoading = true;
    this.message = "";
    this.error = "";
    this.passwordError = "";
    this.confirmPasswordError = "";
    this.codeError = "";
    this.authService
      .verifyReset({
        code: this.code,
        newPassword: this.newPassword,
        confirmNewPassword: this.confirmNewPassword
      })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.message =
            "Password has been reset successfully. You can now log in.";
          setTimeout(() => this.router.navigate(["/login"]), 2000);
        },
        error: (err) => {
          this.isLoading = false;
          // Handle new validation error structure
          if (err.error?.Validation_Error && err.error?.Errors) {
            const errors = err.error.Errors.flat();
            errors.forEach((e: any) => {
              if (e.context?.key === "code") {
                this.codeError = e.message;
              } else if (e.context?.key === "newPassword") {
                this.passwordError = e.message;
              } else if (e.context?.key === "confirmNewPassword") {
                this.confirmPasswordError = e.message;
              }
            });
          } else {
            // Fallback for other errors
            const msg = err.error?.message || "";
            if (
              msg.includes("uppercase") ||
              msg.includes("number") ||
              msg.includes("symbol") ||
              msg.includes("characters")
            ) {
              this.passwordError = msg;
            } else if (msg.includes("Match")) {
              this.confirmPasswordError = msg;
            } else if (msg.includes("Invalid code")) {
              this.codeError = msg;
            } else {
              this.error = msg || "Failed to reset password.";
            }
          }
        }
      });
  }
}
