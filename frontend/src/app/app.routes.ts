import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent), data: { animation: 'LoginPage' } },
      { path: 'signup', loadComponent: () => import('./features/auth/signup/signup.component').then(m => m.SignupComponent), data: { animation: 'SignupPage' } }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./layout/sidebar/sidebar.component').then(m => m.SidebarComponent), // Using Sidebar as shell
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent), data: { animation: 'DashboardPage' } },
      { path: 'courses', loadComponent: () => import('./features/courses/courses.component').then(m => m.CoursesComponent), data: { animation: 'CoursesPage' } },
      { path: 'jobs', loadComponent: () => import('./features/jobs/jobs.component').then(m => m.JobsComponent), data: { animation: 'JobsPage' } }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];