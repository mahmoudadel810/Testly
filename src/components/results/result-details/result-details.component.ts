import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExamService } from '../../../services/exam.service';
import { ExamAttempt, Exam } from '../../../models/exam.model';

@Component({
  selector: 'app-result-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl:'./result-details.component.html',
  styleUrls: ['./result-details.component.css']
})
export class ResultDetailsComponent implements OnInit {
  attempt: ExamAttempt | null = null;
  exam: Exam | null = null;
  loading = true;
  error = '';

  constructor(
    private examService: ExamService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAttempt(id);
    } else {
      this.error = 'No attempt ID provided';
      this.loading = false;
    }
  }

  private loadAttempt(id: string): void {
    console.log('Loading attempt with ID:', id);
    this.examService.getAttempt(id).subscribe({
      next: (attempt: ExamAttempt) => {
        console.log('Received attempt data:', attempt);
        
        if (!attempt) {
          this.error = 'No attempt data found';
          this.loading = false;
          return;
        }
        
        this.attempt = attempt;
        
        // Handle examId whether it's a string or an object with _id
        const examId = typeof attempt.examId === 'string' 
          ? attempt.examId 
          : attempt.examId?._id;
          
        console.log('Extracted exam ID:', examId);
        
        if (!examId) {
          this.error = 'Could not determine exam ID from attempt';
          this.loading = false;
          return;
        }
        
        console.log('Fetching exam with ID:', examId);
        this.examService.getExam(examId).subscribe({
          next: (exam: Exam) => {
            console.log('Received exam data:', exam);
            
            if (!exam) {
              this.error = 'No exam data found';
              this.loading = false;
              return;
            }
            
            // Ensure the exam has questions property
            if (!exam.questions) {
              console.warn('Exam has no questions property');
              exam.questions = [];
            } else if (!Array.isArray(exam.questions)) {
              console.warn('Exam questions is not an array');
              exam.questions = [];
            }
            
            this.exam = exam;
            this.loading = false;
          },
          error: (err: Error) => {
            console.error('Error loading exam details:', err);
            this.error = 'Failed to load exam details';
            this.loading = false;
          }
        });
      },
      error: (err: Error) => {
        console.error('Error loading attempt details:', err);
        this.error = 'Failed to load attempt details';
        this.loading = false;
      }
    });
  }
}