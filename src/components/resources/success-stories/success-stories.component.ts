import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ResourcesSidebarComponent } from '../resources-sidebar/resources-sidebar.component';

@Component({
  selector: 'app-success-stories',
  standalone: true,
  imports: [CommonModule, RouterModule, ResourcesSidebarComponent],
  templateUrl: './success-stories.component.html',
  styleUrls: ['./success-stories.component.css'],
})
export class SuccessStoriesComponent {
  categories = [
    'All Stories',
    'Certification Exams',
    'Academic Tests',
    'Professional Development',
    'Career Transitions',
  ];

  selectedCategory = 'All Stories';

  featuredStory = {
    name: 'David Rodriguez',
    title: 'From College Dropout to Senior Software Engineer',
    quote:
      "Testly's structured approach and realistic practice tests were instrumental in helping me pass my certification exams. I couldn't have done it without this platform.",
    achievement: 'Obtained 3 AWS certifications in 6 months',
    image: 'image/success-stories.jpg',
    category: 'Certification Exams',
    testimonial:
      'After dropping out of college due to financial constraints, I knew I needed certifications to break into tech. Testly helped me structure my learning and practice effectively. The adaptive quizzes and detailed explanations helped me understand complex concepts better than any textbook could.',
  };

  successStories = [
    {
      name: 'Sarah Chen',
      title: 'Medical School Acceptance After 3 Rejections',
      quote:
        'The MCAT practice tests on Testly were more accurate than any other platform I tried. They truly prepared me for the real thing.',
      achievement: 'Improved MCAT score by 15 points',
      image: 'image/Medical.jpg',
      category: 'Academic Tests',
    },
    {
      name: 'Michael Johnson',
      title: 'Career Switch to Data Science at 45',
      quote:
        "At my age, I was worried about competing with younger candidates. Testly's focused approach to exam preparation gave me the confidence I needed.",
      achievement: 'Secured a data scientist role at a Fortune 500 company',
      image: 'image/career.jpg',
      category: 'Career Transitions',
    },
    {
      name: 'Priya Patel',
      title: 'From Intern to Project Manager in 2 Years',
      quote:
        'The PMP practice exams on Testly were crucial to my success. They simulated the real exam experience perfectly.',
      achievement: 'Passed PMP on first attempt with above average score',
      image: 'image/Manager.jpg',
      category: 'Professional Development',
    },
    {
      name: 'James Wilson',
      title: 'Overcoming Learning Disabilities to Excel in Law School',
      quote:
        'The customizable study plans and various question formats helped me adapt the material to my learning style.',
      achievement: 'Passed the bar exam on first try',
      image: 'image/Overcoming.jpeg',
      category: 'Academic Tests',
    },
    {
      name: 'Emily Taylor',
      title: 'From Retail Manager to IT Professional',
      quote:
        'Testly made it possible to study while working full-time. The mobile app allowed me to practice during my commute.',
      achievement: 'Earned CompTIA A+ and Network+ certifications',
      image: 'image/Professional.jpg',
      category: 'Career Transitions',
    },
    {
      name: 'Carlos Mendez',
      title: 'Promotion to Senior Management',
      quote:
        'The business certification practice exams were challenging but incredibly helpful. They prepared me for questions I never expected.',
      achievement: 'Received immediate promotion after certification',
      image: 'image/Management.jpg',
      category: 'Professional Development',
    },
  ];

  filterByCategory(category: string) {
    this.selectedCategory = category;
  }
}
