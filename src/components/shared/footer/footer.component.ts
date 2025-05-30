import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  host: { ngSkipHydration: '' },
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();

  ngOnInit(): void {}
}
