import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-resources-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resources-sidebar.component.html',
  styleUrls: ['./resources-sidebar.component.css'],
})
export class ResourcesSidebarComponent {
  menuItems = [
    {
      title: 'Help Center',
      route: '/resources/help-center',
      icon: 'question-circle',
    },
    { title: 'FAQs', route: '/resources/faqs', icon: 'list-alt' },
    {
      title: 'Tutorials',
      route: '/resources/tutorials',
      icon: 'play-circle',
    },
    { title: 'Blog', route: '/resources/blog', icon: 'newspaper' },
    {
      title: 'Success Stories',
      route: '/resources/success-stories',
      icon: 'trophy',
    },
  ];
}
