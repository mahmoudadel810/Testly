import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ResourcesSidebarComponent } from '../resources-sidebar/resources-sidebar.component';

@Component({
  selector: 'app-tutorials',
  standalone: true,
  imports: [CommonModule, RouterModule, ResourcesSidebarComponent, FormsModule],
  templateUrl: './tutorials.component.html',
  styleUrls: ['./tutorials.component.css'],
})
export class TutorialsComponent {
  searchQuery = '';

  categories = [
    {
      name: 'Getting Started',
      tutorials: [
        {
          id: 1,
          title: 'How to Create an Account',
          description:
            'Learn how to sign up and set up your profile on Testly.',
          duration: '3:45',
          thumbnail: 'assets/tutorials/account-setup.jpg',
          videoUrl: '/tutorials/account-setup',
        },
        {
          id: 2,
          title: 'Navigating the Dashboard',
          description: 'A quick tour of the Testly dashboard and its features.',
          duration: '5:20',
          thumbnail: 'assets/tutorials/dashboard-tour.jpg',
          videoUrl: '/tutorials/dashboard-tour',
        },
      ],
    },
    {
      name: 'Taking Exams',
      tutorials: [
        {
          id: 3,
          title: 'Exam Interface Overview',
          description: 'Learn about the exam interface and navigation tools.',
          duration: '4:15',
          thumbnail: 'assets/tutorials/exam-interface.jpg',
          videoUrl: '/tutorials/exam-interface',
        },
        {
          id: 4,
          title: 'Answering Different Question Types',
          description:
            'Guide to handling multiple-choice, fill-in, and other question formats.',
          duration: '7:30',
          thumbnail: 'assets/tutorials/question-types.jpg',
          videoUrl: '/tutorials/question-types',
        },
        {
          id: 5,
          title: 'Time Management Tips',
          description:
            'Strategies for managing your time efficiently during exams.',
          duration: '6:10',
          thumbnail: 'assets/tutorials/time-management.jpg',
          videoUrl: '/tutorials/time-management',
        },
      ],
    },
    {
      name: 'Study Strategies',
      tutorials: [
        {
          id: 6,
          title: 'Creating Study Plans',
          description:
            'Learn how to create effective study schedules using Testly.',
          duration: '8:45',
          thumbnail: 'assets/tutorials/study-plans.jpg',
          videoUrl: '/tutorials/study-plans',
        },
        {
          id: 7,
          title: 'Practice Test Strategies',
          description:
            'Make the most of practice tests to improve your scores.',
          duration: '5:55',
          thumbnail: 'assets/tutorials/practice-tests.jpg',
          videoUrl: '/tutorials/practice-tests',
        },
      ],
    },
  ];

  featuredTutorial = {
    id: 8,
    title: 'Mastering Test Anxiety',
    description:
      'Expert strategies for overcoming test anxiety and performing your best under pressure.',
    duration: '12:30',
    thumbnail: 'assets/tutorials/test-anxiety.jpg',
    videoUrl: '/tutorials/test-anxiety',
    instructor: 'Dr. Sarah Williams',
    views: '24,587',
  };

  get filteredCategories() {
    if (!this.searchQuery.trim()) {
      return this.categories;
    }

    const query = this.searchQuery.toLowerCase();
    return this.categories
      .map((category) => ({
        ...category,
        tutorials: category.tutorials.filter(
          (tutorial) =>
            tutorial.title.toLowerCase().includes(query) ||
            tutorial.description.toLowerCase().includes(query) ||
            category.name.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.tutorials.length > 0);
  }

  onSearch() {}
}
