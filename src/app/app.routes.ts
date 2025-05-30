import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth.guard';
import { adminGuard } from '../guards/admin.guard';
import { teacherGuard } from '../guards/teacher.guard';

export const routes: Routes = [
  // Public pages
  {
    path: '',
    loadComponent: () =>
      import('../components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('../components/about/about.component').then(
        (m) => m.AboutComponent
      ),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('../components/contact/contact.component').then(
        (m) => m.ContactComponent
      ),
  },

  // Resources feature area - Lazy loaded components
  {
    path: 'resources/help-center',
    loadComponent: () =>
      import('../components/resources/help-center/help-center.component').then(
        (m) => m.HelpCenterComponent
      ),
  },
  {
    path: 'resources/faqs',
    loadComponent: () =>
      import('../components/resources/faqs/faqs.component').then(
        (m) => m.FAQsComponent
      ),
  },
  {
    path: 'resources/tutorials',
    loadComponent: () =>
      import('../components/resources/tutorials/tutorials.component').then(
        (m) => m.TutorialsComponent
      ),
  },
  {
    path: 'resources/blog',
    loadComponent: () =>
      import('../components/resources/blog/blog.component').then(
        (m) => m.BlogComponent
      ),
  },
  {
    path: 'resources/success-stories',
    loadComponent: () =>
      import(
        '../components/resources/success-stories/success-stories.component'
      ).then((m) => m.SuccessStoriesComponent),
  },

  // Direct routes (redirects)
  {
    path: 'help-center',
    redirectTo: 'resources/help-center',
    pathMatch: 'full',
  },
  {
    path: 'faqs',
    redirectTo: 'resources/faqs',
    pathMatch: 'full',
  },
  {
    path: 'tutorials',
    redirectTo: 'resources/tutorials',
    pathMatch: 'full',
  },
  {
    path: 'blog',
    redirectTo: 'resources/blog',
    pathMatch: 'full',
  },
  {
    path: 'success-stories',
    redirectTo: 'resources/success-stories',
    pathMatch: 'full',
  },

  // Auth feature area - Lazy loaded components
  {
    path: 'login',
    loadComponent: () =>
      import('../components/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'role-selection',
    loadComponent: () =>
      import('../components/auth/teacher-or-student/teacher-or-student.component').then(
        (m) => m.TeacherOrStudentComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('../components/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'teacher-register',
    loadComponent: () =>
      import(
        '../components/auth/teacher-register/teacher-register.component'
      ).then((m) => m.TeacherRegisterComponent),
  },
  {
    path: 'teacher-pending',
    loadComponent: () =>
      import(
        '../components/auth/teacher-pending/teacher-pending.component'
      ).then((m) => m.TeacherPendingComponent),
  },
  {
    path: 'confirm-email/:token',
    loadComponent: () =>
      import(
        '../components/auth/email-confirmation/email-confirmation.component'
      ).then((m) => m.EmailConfirmationComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import(
        '../components/auth/forgot-password/forgot-password.component'
      ).then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('../components/auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },

  // Teacher feature area - Protected and lazy loaded components
  {
    path: 'teacher',
    loadChildren: () =>
      import('./teacher.routes').then((m) => m.TEACHER_ROUTES),
    canActivate: [authGuard, teacherGuard],
  },
  {
    path: 'teacher/exams',
    loadComponent: () =>
      import('../components/teacher/manage-exams/manage-exams.component').then(
        (m) => m.ManageExamsComponent
      ),
    canActivate: [authGuard, teacherGuard],
  },
  {
    path: 'teacher/exams/create',
    loadComponent: () =>
      import('../components/teacher/create-exam/create-exam.component').then(
        (m) => m.CreateExamComponent
      ),
    canActivate: [authGuard, teacherGuard],
  },
  {
    path: 'teacher/exams/edit/:id',
    loadComponent: () =>
      import('../components/teacher/edit-exam/edit-exam.component').then(
        (m) => m.EditExamComponent
      ),
    canActivate: [authGuard, teacherGuard],
  },
  {
    path: 'teacher/students',
    loadComponent: () =>
      import('../components/teacher/students/students.component').then(
        (m) => m.StudentsComponent
      ),
    canActivate: [authGuard, teacherGuard],
  },
  {
    path: 'teacher/profile',
    loadComponent: () =>
      import(
        '../components/teacher/teacher-profile/teacher-profile.component'
      ).then((m) => m.TeacherProfileComponent),
    canActivate: [authGuard, teacherGuard],
  },

  // Exam feature area - Protected and lazy loaded components
  {
    path: 'exams',
    loadComponent: () =>
      import('../components/exams/exam-list/exam-list.component').then(
        (m) => m.ExamListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'exams/:id',
    loadComponent: () =>
      import('../components/exams/exam-details/exam-details.component').then(
        (m) => m.ExamDetailsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'take-exam/:id',
    loadComponent: () =>
      import('../components/exams/take-exam/take-exam.component').then(
        (m) => m.TakeExamComponent
      ),
    canActivate: [authGuard],
  },

  // Results feature area - Protected and lazy loaded components
  {
    path: 'results',
    loadComponent: () =>
      import('../components/results/result-list/result-list.component').then(
        (m) => m.ResultListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'results/:id',
    loadComponent: () =>
      import(
        '../components/results/result-details/result-details.component'
      ).then((m) => m.ResultDetailsComponent),
    canActivate: [authGuard],
  },

  // Admin feature area - Protected and lazy loaded components
  {
    path: 'admin',
    loadComponent: () =>
      import(
        '../components/admin/admin-dashboard/admin-dashboard.component'
      ).then((m) => m.AdminDashboardComponent),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin/messages',
    loadComponent: () =>
      import(
        '../components/admin/admin-messages/admin-messages.component'
      ).then((m) => m.AdminMessagesComponent),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin/exams',
    loadComponent: () =>
      import('../components/admin/manage-exams/manage-exams.component').then(
        (m) => m.ManageExamsComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin/exams/create',
    loadComponent: () =>
      import('../components/admin/create-exam/create-exam.component').then(
        (m) => m.CreateExamComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin/exams/edit/:id',
    loadComponent: () =>
      import('../components/admin/edit-exam/edit-exam.component').then(
        (m) => m.EditExamComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin/results',
    loadComponent: () =>
      import('../components/admin/view-results/view-results.component').then(
        (m) => m.ViewResultsComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin/teachers',
    loadComponent: () =>
      import(
        '../components/admin/manage-teachers/manage-teachers.component'
      ).then((m) => m.ManageTeachersComponent),
    canActivate: [authGuard, adminGuard],
  },

  // Wildcard route
  {
    path: '**',
    loadComponent: () =>
      import('../components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
