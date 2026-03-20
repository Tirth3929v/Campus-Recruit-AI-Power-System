import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-wrapper" @fadeIn>
      <div class="glass-panel auth-card">
        <h2>Welcome Back</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <input formControlName="email" type="email" placeholder="Email Address" />
          <input formControlName="password" type="password" placeholder="Password" />
          <button type="submit" class="btn-primary" [disabled]="form.invalid">Login</button>
        </form>
        <p>New here? <a routerLink="/auth/signup">Create Account</a></p>
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
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class LoginComponent {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  form = this.fb.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  onSubmit() { if (this.form.valid) this.auth.login(this.form.value).subscribe(); }
}