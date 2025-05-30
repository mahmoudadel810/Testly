import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ResourcesSidebarComponent } from '../resources-sidebar/resources-sidebar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule, RouterModule, ResourcesSidebarComponent, FormsModule],
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.css'],
})
export class HelpCenterComponent {
  searchQuery = '';

  helpCategories = [
    {
      title: 'Getting Started',
      icon: 'rocket',
      description: 'Learn the basics of Testly and how to set up your account.',
      articles: [
        { title: 'Creating your account', link: '/help/creating-account' },
        {
          title: 'Navigating the dashboard',
          link: '/help/dashboard-navigation',
        },
        { title: 'Setting up your profile', link: '/help/profile-setup' },
      ],
    },
    {
      title: 'Taking Exams',
      icon: 'edit',
      description: 'Everything you need to know about taking exams on Testly.',
      articles: [
        { title: 'Exam interface overview', link: '/help/exam-interface' },
        {
          title: 'Answering different question types',
          link: '/help/question-types',
        },
        { title: 'Submitting your exam', link: '/help/submitting-exam' },
      ],
    },
    {
      title: 'Account & Security',
      icon: 'shield-alt',
      description: 'Manage your account settings and security preferences.',
      articles: [
        { title: 'Changing your password', link: '/help/change-password' },
        { title: 'Two-factor authentication', link: '/help/two-factor' },
        { title: 'Privacy settings', link: '/help/privacy-settings' },
      ],
    },
    {
      title: 'Technical Support',
      icon: 'wrench',
      description:
        'Troubleshooting and technical assistance for common issues.',
      articles: [
        { title: 'Browser compatibility', link: '/help/browser-compatibility' },
        { title: 'Connection issues', link: '/help/connection-issues' },
        { title: 'Contacting support', link: '/help/contact-support' },
      ],
    },
  ];

  get filteredCategories() {
    if (!this.searchQuery) {
      return this.helpCategories;
    }

    const query = this.searchQuery.toLowerCase();
    return this.helpCategories
      .map((category) => ({
        ...category,
        articles: category.articles.filter(
          (article) =>
            article.title.toLowerCase().includes(query) ||
            category.title.toLowerCase().includes(query) ||
            category.description.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.articles.length > 0);
  }

  onSearch() {
    console.log('Searching for:', this.searchQuery);
  }
}
