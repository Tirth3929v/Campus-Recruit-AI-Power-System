import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-wrapper" @fadeIn>
      <div class="glass-panel auth-card">
        <h2>Create Account</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <input formControlName="name" type="text" placeholder="Full Name" />
          <input formControlName="email" type="email" placeholder="Email Address" />
          <input formControlName="password" type="password" placeholder="Password" />
          <button type="submit" class="btn-primary" [disabled]="form.invalid">Sign Up</button>
        </form>
        <p>Already have an account? <a routerLink="/auth/login">Login</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper { display: flex; justify-content: center; align-items: center; height: 100vh; }
    .auth-card { width: 100%; max-width: 400px; padding: 40px; text-align: center; }
    form { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
    button { margin-top: 10px; width: 100%; }
  `],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class SignupComponent {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  form = this.fb.group({ name: ['', Validators.required], email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  onSubmit() { if (this.form.valid) this.auth.register(this.form.value).subscribe(); }
}