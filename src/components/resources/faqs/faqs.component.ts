import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ResourcesSidebarComponent } from '../resources-sidebar/resources-sidebar.component';

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [CommonModule, RouterModule, ResourcesSidebarComponent, FormsModule],
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.css'],
})
export class FAQsComponent {
  searchQuery = '';
  activeCategory: string | null = 'Account & Registration';

  faqCategories = [
    {
      title: 'Account & Registration',
      faqs: [
        {
          question: 'How do I create an account?',
          answer:
            'Creating an account is simple. Click on the "Register" button in the top right corner of the homepage, fill in your details, and follow the verification steps sent to your email.',
        },
        {
          question: 'Can I use Testly without creating an account?',
          answer:
            'No, you need to create an account to access our exam platform and features. Registration is free and only takes a minute.',
        },
        {
          question: 'How do I reset my password?',
          answer:
            'To reset your password, click on "Login", then "Forgot Password", and follow the instructions sent to your registered email address.',
        },
      ],
    },
    {
      title: 'Exams & Testing',
      faqs: [
        {
          question: 'How are the exams scored?',
          answer:
            'Exams are scored based on the number of correct answers. Some questions may have different point values based on their difficulty.',
        },
        {
          question: 'Can I pause an exam and continue later?',
          answer:
            'Yes, you can pause most practice exams and continue later. However, timed certification exams cannot be paused.',
        },
        {
          question:
            'What happens if I lose my internet connection during an exam?',
          answer:
            'Our system automatically saves your progress every 30 seconds. If you lose connection, you can log back in and continue from where you left off in most cases.',
        },
      ],
    },
    {
      title: 'Billing & Subscription',
      faqs: [
        {
          question: 'What payment methods do you accept?',
          answer:
            'We accept all major credit cards, PayPal, and bank transfers for institutional accounts.',
        },
        {
          question: 'Can I cancel my subscription at any time?',
          answer:
            'Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of the current billing period.',
        },
        {
          question: 'Do you offer refunds?',
          answer:
            'We offer a 14-day money-back guarantee for all new subscriptions. Please contact our support team for more information.',
        },
      ],
    },
    {
      title: 'Technical Issues',
      faqs: [
        {
          question: 'Which browsers are supported?',
          answer:
            'Testly works best on recent versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.',
        },
        {
          question: "Why can't I see my exam results?",
          answer:
            "If you can't see your results, please try clearing your browser cache or try a different browser. If the issue persists, contact our support team.",
        },
        {
          question: 'The application is running slowly. What can I do?',
          answer:
            'Try clearing your browser cache, closing unnecessary tabs, or using a different browser. Our platform is optimized for performance but requires a stable internet connection.',
        },
      ],
    },
  ];

  toggleCategory(category: string): void {
    this.activeCategory = this.activeCategory === category ? null : category;
  }

  isCategoryActive(category: string): boolean {
    return this.activeCategory === category;
  }

  get filteredCategories() {
    if (!this.searchQuery.trim()) {
      return this.faqCategories;
    }

    const query = this.searchQuery.toLowerCase();
    return this.faqCategories
      .map((category) => ({
        ...category,
        faqs: category.faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(query) ||
            faq.answer.toLowerCase().includes(query) ||
            category.title.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.faqs.length > 0);
  }

  onSearch() {
    if (this.filteredCategories.length > 0 && !this.activeCategory) {
      this.activeCategory = this.filteredCategories[0].title;
    }
  }
}
