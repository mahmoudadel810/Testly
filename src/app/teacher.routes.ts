import { Routes } from '@angular/router';

export const TEACHER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        '../components/teacher/teacher-dashboard/teacher-dashboard.component'
      ).then((m) => m.TeacherDashboardComponent),
  },
  {
    path: 'exams',
    loadComponent: () =>
      import('../components/teacher/manage-exams/manage-exams.component').then(
        (m) => m.ManageExamsComponent
      ),
  },
  {
    path: 'exams/create',
    loadComponent: () =>
      import('../components/teacher/create-exam/create-exam.component').then(
        (m) => m.CreateExamComponent
      ),
  },
  {
    path: 'exams/:id/edit',
    loadComponent: () =>
      import('../components/teacher/edit-exam/edit-exam.component').then(
        (m) => m.EditExamComponent
      ),
  },
  {
    path: 'exams/:id/attempts',
    loadComponent: () =>
      import(
        '../components/teacher/exam-attempts/exam-attempts.component'
      ).then((m) => m.ExamAttemptsComponent),
  },
  {
    path: 'attempts',
    loadComponent: () =>
      import(
        '../components/teacher/student-attempts/student-attempts.component'
      ).then((m) => m.StudentAttemptsComponent),
  },
  {
    path: 'pass-rates',
    loadComponent: () =>
      import('../components/teacher/pass-rates/pass-rates.component').then(
        (m) => m.PassRatesComponent
      ),
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('../components/teacher/reports/reports.component').then(
        (m) => m.ReportsComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import(
        '../components/teacher/teacher-profile/teacher-profile.component'
      ).then((m) => m.TeacherProfileComponent),
  },
];
