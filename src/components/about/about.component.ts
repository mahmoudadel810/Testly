import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent {
  // Company information
  companyName = 'Testly';
  foundedYear = 2025;
  mission =
    'To provide the most accessible and effective exam preparation platform for students and professionals worldwide.';

  // Team members
  teamMembers = [
    {
      name: 'Jane Smith',
      position: 'CEO & Founder',
      bio: 'With over 15 years of experience in education technology, Jane founded Testly to revolutionize exam preparation.',
      imageUrl: 'assets/team/jane-smith.jpg',
    },
    {
      name: 'John Davis',
      position: 'CTO',
      bio: 'John brings 12 years of software development expertise with a focus on educational platforms and adaptive learning systems.',
      imageUrl: 'assets/team/john-davis.jpg',
    },
    {
      name: 'Sarah Johnson',
      position: 'Head of Content',
      bio: 'Former educator with a passion for creating engaging and effective learning materials for various subjects and levels.',
      imageUrl: 'assets/team/sarah-johnson.jpg',
    },
  ];
}
