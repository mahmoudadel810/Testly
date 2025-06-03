import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ContactService } from "../../services/contact.service";

@Component({
  selector: "app-contact",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.css"],
})
export class ContactComponent {
  contactForm: FormGroup;
  submitted = false;
  submitSuccess = false;
  errorMessage = "";

  constructor(private fb: FormBuilder, private contactService: ContactService) {
    this.contactForm = this.fb.group({
      name: [
        "",
        [
          Validators.required,
          Validators.minLength(5),
          this.noLeadingWhitespaceValidator(),
        ],
      ],
      email: [
        "",
        [
          Validators.required,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|yahoo\.com)$/
          ),
        ],
      ],
      subject: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
        ],
      ],
      message: [
        "",
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(200),
        ],
      ],
    });
  }

  // Custom validator to prevent leading spaces in the name
  noLeadingWhitespaceValidator() {
    return (control: { value: string }) => {
      const isValid = control.value.trimStart() === control.value;
      return isValid ? null : { leadingWhitespace: true };
    };
  }

  // Getter for easy access to form fields
  get f() {
    return this.contactForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = "";

    if (this.contactForm.invalid) {
      return;
    }

    this.contactService.submitContactForm(this.contactForm.value).subscribe({
      next: (response) => {
        console.log("Message sent successfully", response);
        this.submitSuccess = true;
        this.submitted = false;
        this.contactForm.reset();
      },
      error: (error) => {
        console.error("Error sending message", error);
        this.submitted = false;
        this.errorMessage =
          "An error occurred while sending the message. Please try again.";
      },
    });
  }
}
