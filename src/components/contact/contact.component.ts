import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  contactForm: FormGroup;
  submitted = false;
  submitSuccess = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private contactService: ContactService) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(20)]],
    });
  }

  // Getter for easy access to form fields
  get f() {
    return this.contactForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    // Stop here if form is invalid
    if (this.contactForm.invalid) {
      return;
    }

    // Send the form data to the backend API
    this.contactService.submitContactForm(this.contactForm.value).subscribe({
      next: (response) => {
        console.log('Contact form submitted successfully', response);
        this.submitSuccess = true;
        this.submitted = false;
        this.contactForm.reset();
      },
      error: (error) => {
        console.error('Error submitting contact form', error);
        this.submitted = false;
        this.errorMessage =
          error.error?.message ||
          'An error occurred while submitting the form. Please try again.';
      },
    });
  }
}
