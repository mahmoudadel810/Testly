import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ResourcesSidebarComponent } from '../resources-sidebar/resources-sidebar.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule, ResourcesSidebarComponent],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css'],
})
export class BlogComponent {
  categories = [
    'All Posts',
    'Exam Strategies',
    'Study Tips',
    'Test Preparation',
    'News & Updates',
  ];

  selectedCategory = 'All Posts';

  featuredPost = {
    id: 1,
    title: 'How to Prepare for Your Certification Exam in Just 30 Days',
    excerpt:
      'Follow our proven 30-day study plan to efficiently prepare for your certification exam without burning out.',
    image: 'image/certification.jpeg',
    author: 'Dr. Lisa Chen',
    date: 'June 15, 2025',
    readTime: '8 min read',
    category: 'Exam Strategies',
  };

  recentPosts = [
    {
      id: 2,
      title: '6 Memory Techniques That Actually Work for Exam Preparation',
      excerpt:
        'Science-backed memory techniques to help you retain more information for your upcoming exams.',
      image: 'image/memoryTechnique.jpg',
      author: 'Michael Rodriguez',
      date: 'May 28, 2025',
      readTime: '6 min read',
      category: 'Study Tips',
    },
    {
      id: 3,
      title: 'New Features Coming to Testly This Summer',
      excerpt:
        "Exciting new features are coming to the Testly platform to enhance your study experience. Preview what's coming.",
      image: 'image/newFeatures.jpg',
      author: 'Sarah Johnson',
      date: 'May 15, 2025',
      readTime: '4 min read',
      category: 'News & Updates',
    },
    {
      id: 4,
      title: 'How to Overcome Test Anxiety: Expert Strategies',
      excerpt:
        'Learn practical techniques to manage test anxiety and perform your best on exam day.',
      image: 'image/test-anxiety.jpg',
      author: 'Dr. James Wilson',
      date: 'May 10, 2025',
      readTime: '7 min read',
      category: 'Exam Strategies',
    },
    {
      id: 5,
      title: 'The Optimal Study Schedule Based on Cognitive Science',
      excerpt:
        'Structure your study sessions for maximum retention and minimal fatigue based on the latest research.',
      image: 'image/study-schedule.jpg',
      author: 'Dr. Lisa Chen',
      date: 'April 28, 2025',
      readTime: '9 min read',
      category: 'Study Tips',
    },
    {
      id: 6,
      title: 'The Benefits of Practice Tests for Exam Preparation',
      excerpt:
        "Research shows that practice testing is one of the most effective study techniques. Here's why and how to use it.",
      image: 'image/practice-tests.jpg',
      author: 'Michael Rodriguez',
      date: 'April 15, 2025',
      readTime: '5 min read',
      category: 'Test Preparation',
    },
  ];

  filterByCategory(category: string) {
    this.selectedCategory = category;
  }
}
